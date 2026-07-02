import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_THEME_KEY, resolveTheme, Theme, ThemeKey, THEMES } from '../theme';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'wishlist.theme';

interface ThemeContextValue {
  /** The theme currently in effect (partner's when sync is on). */
  theme: Theme;
  /** The user's own selection, regardless of sync. */
  ownThemeKey: ThemeKey;
  syncWithPartner: boolean;
  setThemeKey: (key: ThemeKey) => void;
  setSyncWithPartner: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[DEFAULT_THEME_KEY],
  ownThemeKey: DEFAULT_THEME_KEY,
  syncWithPartner: false,
  setThemeKey: () => {},
  setSyncWithPartner: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, partner } = useAuth();
  const [localKey, setLocalKey] = useState<ThemeKey>(DEFAULT_THEME_KEY);
  const [localSync, setLocalSync] = useState(false);

  // Fast start: last used theme from device storage (also covers the
  // logged-out auth screens).
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in THEMES) setLocalKey(stored as ThemeKey);
    });
  }, []);

  // The user document is the source of truth once the profile loads
  // (keeps the theme consistent across devices and enables partner sync).
  useEffect(() => {
    if (profile?.theme && profile.theme in THEMES) {
      setLocalKey(profile.theme as ThemeKey);
    }
    if (profile) setLocalSync(!!profile.themeSync);
  }, [profile?.theme, profile?.themeSync]);

  const setThemeKey = useCallback(
    (key: ThemeKey) => {
      setLocalKey(key);
      AsyncStorage.setItem(STORAGE_KEY, key).catch(() => {});
      if (user) {
        updateDoc(doc(db, 'users', user.uid), { theme: key }).catch(() => {});
      }
    },
    [user?.uid]
  );

  const setSyncWithPartner = useCallback(
    (value: boolean) => {
      setLocalSync(value);
      if (user) {
        updateDoc(doc(db, 'users', user.uid), { themeSync: value }).catch(() => {});
      }
    },
    [user?.uid]
  );

  const value = useMemo<ThemeContextValue>(() => {
    const effectiveKey =
      localSync && partner?.theme && partner.theme in THEMES
        ? (partner.theme as ThemeKey)
        : localKey;
    return {
      theme: resolveTheme(effectiveKey),
      ownThemeKey: localKey,
      syncWithPartner: localSync,
      setThemeKey,
      setSyncWithPartner,
    };
  }, [localKey, localSync, partner?.theme, setThemeKey, setSyncWithPartner]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Builds a StyleSheet from the active theme, memoized per theme change.
 * Usage: `const styles = useThemedStyles(makeStyles);` with
 * `const makeStyles = (t: Theme) => StyleSheet.create({ ... })`.
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
