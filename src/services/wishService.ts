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
  setDoc,
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

function planRef(wishId: string, userId: string) {
  return doc(db, 'plans', `${wishId}_${userId}`);
}

async function removeOwnPlan(wishId: string, userId: string) {
  try {
    await deleteDoc(planRef(wishId, userId));
  } catch {
    // No plan doc (or already gone) — nothing to clean up.
  }
}

export async function deleteWish(wishId: string, userId: string) {
  await deleteDoc(doc(db, 'wishlistItems', wishId));
  await removeOwnPlan(wishId, userId);
}

/**
 * Secret planning: stored in the private `plans` collection whose security
 * rules only let the planner read their own docs — the wish's creator can
 * never see the plan, even by querying Firestore directly.
 */
export async function togglePlanning(
  wish: Wish,
  userId: string,
  currentlyPlanning: boolean
) {
  if (currentlyPlanning) {
    await removeOwnPlan(wish.id, userId);
  } else {
    await setDoc(planRef(wish.id, userId), {
      wishId: wish.id,
      userId,
      coupleId: wish.coupleId,
      createdAt: serverTimestamp(),
    });
  }
}

/** Live set of wish ids the current user is secretly planning. */
export function subscribeToMyPlans(
  userId: string,
  callback: (wishIds: Set<string>) => void
) {
  const q = query(collection(db, 'plans'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => callback(new Set(snap.docs.map((d) => d.data().wishId as string))),
    () => callback(new Set())
  );
}

export async function completeWish(wish: Wish, user: UserProfile) {
  await updateDoc(doc(db, 'wishlistItems', wish.id), {
    status: 'completed' satisfies WishStatus,
    completedAt: serverTimestamp(),
  });
  await removeOwnPlan(wish.id, user.uid);
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
