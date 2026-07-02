import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { SubscriptionStatus, UserProfile } from '../types';
import {
  effectiveStatus,
  hasFullAccess,
  trialTimeRemaining,
} from '../services/subscriptionService';
import { registerForPushNotifications } from '../services/notificationService';
import { getPartnerProfile } from '../services/coupleService';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  partner: UserProfile | null;
  initializing: boolean;
  status: SubscriptionStatus;
  fullAccess: boolean;
  trialRemaining: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  partner: null,
  initializing: true,
  status: 'free',
  fullAccess: false,
  trialRemaining: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setPartner(null);
        setProfileLoaded(true);
        setInitializing(false);
      } else {
        setProfileLoaded(false);
      }
    });
    return unsub;
  }, []);

  // Live profile subscription
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        setProfileLoaded(true);
        setInitializing(false);
      },
      () => {
        setProfileLoaded(true);
        setInitializing(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  // Load partner profile whenever partnerId changes
  useEffect(() => {
    let cancelled = false;
    if (!profile?.partnerId) {
      setPartner(null);
      return;
    }
    getPartnerProfile(profile.partnerId).then((p) => {
      if (!cancelled) setPartner(p);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.partnerId]);

  // Register for push once logged in
  useEffect(() => {
    if (user && profileLoaded && profile) {
      registerForPushNotifications(user.uid);
    }
  }, [user?.uid, profileLoaded]);

  const value = useMemo<AuthContextValue>(() => {
    const status = profile ? effectiveStatus(profile) : 'free';
    return {
      user,
      profile,
      partner,
      initializing: initializing || (!!user && !profileLoaded),
      status,
      fullAccess: profile ? hasFullAccess(profile) : false,
      trialRemaining: profile ? trialTimeRemaining(profile) : null,
    };
  }, [user, profile, partner, initializing, profileLoaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
