import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Couple, UserProfile } from '../types';
import { createNotification } from './notificationService';

// Unambiguous alphabet: no 0/O, 1/I/L
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Creates the couple document immediately with the inviter as user1.
 * The inviter can start using the app while waiting for their partner.
 */
export async function createInvite(userId: string): Promise<Couple> {
  const inviteCode = generateInviteCode();
  const ref = await addDoc(collection(db, 'couples'), {
    user1: userId,
    user2: null,
    inviteCode,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), { coupleId: ref.id });
  return { id: ref.id, user1: userId, user2: null, inviteCode, createdAt: null };
}

export async function joinWithCode(user: UserProfile, code: string): Promise<string> {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== CODE_LENGTH) {
    throw new Error('Invite codes are 6 characters long.');
  }
  const q = query(
    collection(db, 'couples'),
    where('inviteCode', '==', normalized),
    where('user2', '==', null),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error('No open invite found for that code. Double-check it with your partner.');
  }
  const coupleDoc = snap.docs[0];
  const couple = coupleDoc.data();
  if (couple.user1 === user.uid) {
    throw new Error("That's your own invite code — share it with your partner instead.");
  }

  const batch = writeBatch(db);
  batch.update(coupleDoc.ref, { user2: user.uid });
  batch.update(doc(db, 'users', user.uid), {
    coupleId: coupleDoc.id,
    partnerId: couple.user1,
  });
  batch.update(doc(db, 'users', couple.user1), { partnerId: user.uid });
  await batch.commit();

  await createNotification({
    coupleId: coupleDoc.id,
    toUserId: couple.user1,
    fromUserName: user.name,
    type: 'partner_joined',
    message: `${user.name} joined your couple! Start wishing together 💕`,
  });

  return coupleDoc.id;
}

export async function getCouple(coupleId: string): Promise<Couple | null> {
  const snap = await getDoc(doc(db, 'couples', coupleId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Couple;
}

export async function getPartnerProfile(partnerId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', partnerId));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/**
 * Breaks the pairing: both users lose partnerId/coupleId and the couple
 * document is deleted, which also revokes access to the shared wishes
 * (security rules resolve membership through the couple doc). The other
 * partner's app returns to partner setup automatically.
 */
export async function breakPair(profile: UserProfile) {
  if (!profile.coupleId) return;
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', profile.uid), {
    coupleId: null,
    partnerId: null,
    themeSync: false,
  });
  if (profile.partnerId) {
    batch.update(doc(db, 'users', profile.partnerId), {
      partnerId: null,
      coupleId: null,
    });
  }
  batch.delete(doc(db, 'couples', profile.coupleId));
  await batch.commit();
}
