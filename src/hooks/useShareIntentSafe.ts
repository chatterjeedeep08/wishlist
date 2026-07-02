/**
 * Safe wrapper around expo-share-intent.
 *
 * expo-share-intent ships native code, so it only works in a development
 * build / production APK — not in Expo Go. This wrapper keeps the app
 * runnable everywhere by falling back to a no-op implementation.
 */

export interface SafeShareIntent {
  hasShareIntent: boolean;
  text: string | null;
  webUrl: string | null;
  resetShareIntent: () => void;
}

let useShareIntentImpl: any = null;
try {
  useShareIntentImpl = require('expo-share-intent').useShareIntent;
} catch {
  useShareIntentImpl = null;
}

const FALLBACK: SafeShareIntent = {
  hasShareIntent: false,
  text: null,
  webUrl: null,
  resetShareIntent: () => {},
};

export function useShareIntentSafe(): SafeShareIntent {
  if (!useShareIntentImpl) return FALLBACK;
  try {
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentImpl({
      debug: false,
      resetOnBackground: true,
    });
    return {
      hasShareIntent: !!hasShareIntent,
      text: shareIntent?.text ?? null,
      webUrl: shareIntent?.webUrl ?? null,
      resetShareIntent: resetShareIntent ?? (() => {}),
    };
  } catch {
    return FALLBACK;
  }
}
