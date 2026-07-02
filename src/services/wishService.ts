import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, Wish, WishDraft, WishStatus } from '../types';
import { createNotification } from './notificationService';

export const FREE_TIER_WISH_LIMIT = 20;

export class WishLimitError extends Error {
  constructor() {
    super(
      `Free accounts can keep up to ${FREE_TIER_WISH_LIMIT} wishes. Upgrade to Premium for unlimited wishes.`
    );
    this.name = 'WishLimitError';
  }
}

export async function countWishes(coupleId: string): Promise<number> {
  const q = query(collection(db, 'wishlistItems'), where('coupleId', '==', coupleId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function addWish(
  user: UserProfile,
  draft: WishDraft,
  hasFullAccess: boolean
): Promise<string> {
  if (!user.coupleId) throw new Error('Pair with your partner before adding wishes.');

  if (!hasFullAccess) {
    const count = await countWishes(user.coupleId);
    if (count >= FREE_TIER_WISH_LIMIT) throw new WishLimitError();
  }

  const ref = await addDoc(collection(db, 'wishlistItems'), {
    coupleId: user.coupleId,
    createdBy: user.uid,
    createdByName: user.name,
    type: draft.type,
    source: draft.source,
    title: draft.title.trim(),
    description: draft.description?.trim() ?? '',
    image: draft.image ?? null,
    link: draft.link ?? null,
    price: draft.price ?? null,
    priority: draft.priority ?? 'medium',
    plannedBy: null,
    status: 'active' satisfies WishStatus,
    createdAt: serverTimestamp(),
    completedAt: null,
  });

  if (user.partnerId) {
    await createNotification({
      coupleId: user.coupleId,
      toUserId: user.partnerId,
      fromUserName: user.name,
      type: 'wish_added',
      message: `${user.name} added a new wish: “${draft.title.trim()}”`,
    });
  }

  return ref.id;
}

export function subscribeToWishes(
  coupleId: string,
  callback: (wishes: Wish[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, 'wishlistItems'),
    where('coupleId', '==', coupleId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Wish)),
    (err) => onError?.(err)
  );
}

export async function updateWish(wishId: string, updates: Partial<Wish>) {
  const { id: _id, ...rest } = updates;
  await updateDoc(doc(db, 'wishlistItems', wishId), rest);
}

export async function deleteWish(wishId: string) {
  await deleteDoc(doc(db, 'wishlistItems', wishId));
}

/** Secret planning: only the planner ever sees this flag (enforced in UI). */
export async function togglePlanning(wish: Wish, userId: string) {
  await updateDoc(doc(db, 'wishlistItems', wish.id), {
    plannedBy: wish.plannedBy === userId ? null : userId,
  });
}

export async function completeWish(wish: Wish, user: UserProfile) {
  await updateDoc(doc(db, 'wishlistItems', wish.id), {
    status: 'completed' satisfies WishStatus,
    completedAt: serverTimestamp(),
    plannedBy: null,
  });
  if (user.partnerId) {
    await createNotification({
      coupleId: wish.coupleId,
      toUserId: user.partnerId,
      fromUserName: user.name,
      type: 'wish_completed',
      message: `${user.name} completed “${wish.title}” ✅`,
    });
  }
}

export async function reopenWish(wishId: string) {
  await updateDoc(doc(db, 'wishlistItems', wishId), {
    status: 'active' satisfies WishStatus,
    completedAt: null,
  });
}
