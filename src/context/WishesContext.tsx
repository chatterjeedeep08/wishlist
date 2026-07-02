import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Wish } from '../types';
import { subscribeToWishes } from '../services/wishService';
import { useAuth } from './AuthContext';

interface WishesContextValue {
  wishes: Wish[];
  activeWishes: Wish[];
  completedWishes: Wish[];
  loading: boolean;
}

const WishesContext = createContext<WishesContextValue>({
  wishes: [],
  activeWishes: [],
  completedWishes: [],
  loading: true,
});

export function WishesProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

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
      loading,
    }),
    [wishes, loading]
  );

  return <WishesContext.Provider value={value}>{children}</WishesContext.Provider>;
}

export function useWishes() {
  return useContext(WishesContext);
}
