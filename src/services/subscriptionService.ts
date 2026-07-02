import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Timestamp } from 'firebase/firestore';
import { SubscriptionStatus, UserProfile } from '../types';

export const TRIAL_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

export function trialEndsAt(profile: UserProfile): Date | null {
  const start = profile.trialStart as Timestamp | null;
  if (!start) return null;
  return new Date(start.toMillis() + TRIAL_DURATION_MS);
}

export function isTrialActive(profile: UserProfile): boolean {
  const ends = trialEndsAt(profile);
  return !!ends && Date.now() < ends.getTime();
}

/** Effective status: 'trial' decays to 'free' once 48h have passed. */
export function effectiveStatus(profile: UserProfile): SubscriptionStatus {
  if (profile.subscriptionStatus === 'premium') return 'premium';
  return isTrialActive(profile) ? 'trial' : 'free';
}

/** Premium features (unlimited wishes, secret planning, image uploads). */
export function hasFullAccess(profile: UserProfile): boolean {
  return effectiveStatus(profile) !== 'free';
}

export function trialTimeRemaining(profile: UserProfile): string | null {
  const ends = trialEndsAt(profile);
  if (!ends) return null;
  const ms = ends.getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// ---------------------------------------------------------------------------
// RevenueCat integration.
//
// react-native-purchases requires a development build (it has native code),
// so everything below degrades gracefully: in Expo Go, or when no RevenueCat
// API key is configured, the paywall falls back to a demo upgrade that just
// flips subscriptionStatus in Firestore.
// ---------------------------------------------------------------------------

let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch {
  Purchases = null;
}

const REVENUECAT_API_KEY = Platform.select({
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
});

let configured = false;

export function isRevenueCatAvailable(): boolean {
  return !!Purchases && !!REVENUECAT_API_KEY;
}

export async function configurePurchases(userId: string): Promise<boolean> {
  if (!isRevenueCatAvailable()) return false;
  try {
    if (!configured) {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
      configured = true;
    }
    return true;
  } catch (err) {
    console.warn('RevenueCat configure failed', err);
    return false;
  }
}

export interface PlanOption {
  identifier: string;
  title: string;
  priceString: string;
  period: string;
  rcPackage?: any;
}

const DEMO_PLANS: PlanOption[] = [
  { identifier: 'monthly', title: 'Monthly', priceString: '₹199 / month', period: 'monthly' },
  { identifier: 'annual', title: 'Yearly', priceString: '₹1,499 / year', period: 'yearly' },
];

export async function getPlans(): Promise<{ plans: PlanOption[]; live: boolean }> {
  if (isRevenueCatAvailable() && configured) {
    try {
      const offerings = await Purchases.getOfferings();
      const packages = offerings?.current?.availablePackages ?? [];
      if (packages.length > 0) {
        return {
          live: true,
          plans: packages.map((p: any) => ({
            identifier: p.identifier,
            title: p.product?.title ?? p.identifier,
            priceString: p.product?.priceString ?? '',
            period: p.packageType ?? '',
            rcPackage: p,
          })),
        };
      }
    } catch (err) {
      console.warn('RevenueCat getOfferings failed', err);
    }
  }
  return { live: false, plans: DEMO_PLANS };
}

async function markPremium(userId: string) {
  await updateDoc(doc(db, 'users', userId), { subscriptionStatus: 'premium' });
}

/**
 * Purchases the given plan. Live purchases go through RevenueCat /
 * Google Play Billing; demo mode simply unlocks premium in Firestore.
 */
export async function purchasePlan(
  userId: string,
  plan: PlanOption
): Promise<void> {
  if (plan.rcPackage && isRevenueCatAvailable()) {
    const { customerInfo } = await Purchases.purchasePackage(plan.rcPackage);
    const isActive = !!customerInfo?.entitlements?.active?.premium;
    if (!isActive) throw new Error('Purchase did not activate the premium entitlement.');
  }
  await markPremium(userId);
}

export async function restorePurchases(userId: string): Promise<boolean> {
  if (!isRevenueCatAvailable()) return false;
  const customerInfo = await Purchases.restorePurchases();
  const isActive = !!customerInfo?.entitlements?.active?.premium;
  if (isActive) await markPremium(userId);
  return isActive;
}
