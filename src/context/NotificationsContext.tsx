import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppNotification } from '../types';
import { subscribeToNotifications } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  /** Newest partner-activity notification to show as an in-app popup. */
  banner: AppNotification | null;
  dismissBanner: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  banner: null,
  dismissBanner: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [banner, setBanner] = useState<AppNotification | null>(null);
  // Ids seen in the first snapshot — old items must not pop up on launch.
  const seenIds = useRef<Set<string> | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    seenIds.current = null;
    const unsub = subscribeToNotifications(user.uid, (items) => {
      if (seenIds.current === null) {
        seenIds.current = new Set(items.map((n) => n.id));
      } else {
        const fresh = items.find((n) => !seenIds.current!.has(n.id) && !n.read);
        items.forEach((n) => seenIds.current!.add(n.id));
        if (fresh) {
          setBanner(fresh);
          if (bannerTimer.current) clearTimeout(bannerTimer.current);
          bannerTimer.current = setTimeout(() => setBanner(null), 5000);
        }
      }
      setNotifications(items);
    });
    return () => {
      unsub();
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, [user?.uid]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      banner,
      dismissBanner: () => setBanner(null),
    }),
    [notifications, banner]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
