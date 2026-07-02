import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';
import { AppNotification, AppNotificationType } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Writes an in-app notification document. A Cloud Function (see functions/)
 * picks these up and delivers a push notification to the recipient.
 */
export async function createNotification(input: {
  coupleId: string;
  toUserId: string;
  fromUserName: string;
  type: AppNotificationType;
  message: string;
}) {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...input,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Notifications are best-effort; never block the main action.
    console.warn('Failed to create notification', err);
  }
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification)
    );
  });
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Wishlist',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const res = await Notifications.requestPermissionsAsync();
      status = res.status;
    }
    if (status !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await updateDoc(doc(db, 'users', userId), { pushToken: token });
    return token;
  } catch (err) {
    console.warn('Push registration failed', err);
    return null;
  }
}
