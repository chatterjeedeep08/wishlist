import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Wish } from '../types';
import { subscribeToMyPlans, subscribeToWishes } from '../services/wishService';
import { useAuth } from './AuthContext';

interface WishesContextValue {
  wishes: Wish[];
  activeWishes: Wish[];
  completedWishes: Wish[];
  /** Wish ids the current user is secretly planning (private to them). */
  plannedWishIds: Set<string>;
  loading: boolean;
}

const WishesContext = createContext<WishesContextValue>({
  wishes: [],
  activeWishes: [],
  completedWishes: [],
  plannedWishIds: new Set(),
  loading: true,
});

export function WishesProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [plannedWishIds, setPlannedWishIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlannedWishIds(new Set());
      return;
    }
    return subscribeToMyPlans(user.uid, setPlannedWishIds);
  }, [user?.uid]);

  useEffect(() => {
    if (!profile?.coupleId) {
      setWishes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToWishes(
      profile.coupleId,
      (items) => {
        setWishes(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [profile?.coupleId]);

  const value = useMemo(
    () => ({
      wishes,
      activeWishes: wishes.filter((w) => w.status === 'active'),
      completedWishes: wishes.filter((w) => w.status === 'completed'),
      plannedWishIds,
      loading,
    }),
    [wishes, plannedWishIds, loading]
  );

  return <WishesContext.Provider value={value}>{children}</WishesContext.Provider>;
}

export function useWishes() {
  return useContext(WishesContext);
}
