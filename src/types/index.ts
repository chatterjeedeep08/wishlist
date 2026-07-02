import { Timestamp } from 'firebase/firestore';

export type WishType = 'food' | 'activity' | 'place' | 'gift';

export type WishSource =
  | 'manual'
  | 'shopping'
  | 'instagram'
  | 'maps'
  | 'shared'
  | 'link';

export type WishStatus = 'active' | 'completed';

export type WishPriority = 'low' | 'medium' | 'high';

export type SubscriptionStatus = 'trial' | 'free' | 'premium';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  partnerId: string | null;
  coupleId: string | null;
  trialStart: Timestamp | null;
  subscriptionStatus: SubscriptionStatus;
  pushToken?: string | null;
  createdAt: Timestamp | null;
}

export interface Couple {
  id: string;
  user1: string;
  user2: string | null;
  inviteCode: string;
  createdAt: Timestamp | null;
}

export interface Wish {
  id: string;
  coupleId: string;
  createdBy: string;
  createdByName: string;
  type: WishType;
  source: WishSource;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  price: string | null;
  priority: WishPriority;
  status: WishStatus;
  createdAt: Timestamp | null;
  completedAt: Timestamp | null;
}

export interface WishDraft {
  type: WishType;
  source: WishSource;
  title: string;
  description?: string;
  image?: string | null;
  link?: string | null;
  price?: string | null;
  priority?: WishPriority;
}

/**
 * A secret plan lives in its own collection (plans/{wishId}_{userId}) with
 * security rules that only let the planner read it — the wish's creator
 * can never see it, even at the API level.
 */
export interface Plan {
  wishId: string;
  userId: string;
  coupleId: string;
  createdAt: Timestamp | null;
}

export type AppNotificationType =
  | 'wish_added'
  | 'partner_joined'
  | 'wish_completed';

export interface AppNotification {
  id: string;
  coupleId: string;
  toUserId: string;
  fromUserName: string;
  type: AppNotificationType;
  message: string;
  read: boolean;
  createdAt: Timestamp | null;
}

export interface LinkPreview {
  url: string;
  source: WishSource;
  detectedType: WishType | null;
  title: string | null;
  image: string | null;
  description: string | null;
  price: string | null;
}
