import {
  addDoc,
  collection,
  doc,
  getDoc,
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
 * Delivers a push notification straight from the device via Expo's push
 * API. Cloud Functions would be the classic home for this, but they
 * require the Blaze plan — sending client-side keeps the whole app on
 * the free Spark plan. Expo push tokens are only sendable, not readable,
 * so exposing the partner's token to the sender is low-risk.
 */
async function sendExpoPush(toUserId: string, message: string) {
  const recipient = await getDoc(doc(db, 'users', toUserId));
  const pushToken = recipient.get('pushToken');
  if (!pushToken) return;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: pushToken,
      title: 'Wishlist 💝',
      body: message,
      sound: 'default',
    }),
  });
}

/**
 * Writes an in-app notification document and pushes it to the partner's
 * device. Best-effort: failures never block the main action.
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
    await sendExpoPush(input.toUserId, input.message);
  } catch (err) {
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
