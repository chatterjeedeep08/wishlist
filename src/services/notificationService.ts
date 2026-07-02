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
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { db } from '../config/firebase';
import { AppNotification, AppNotificationType } from '../types';

// Expo Go removed remote-push support in SDK 53, and expo-notifications
// throws as soon as it is imported there. Load it lazily and only outside
// Expo Go — in Expo Go the app runs without push (in-app notifications
// still work); development/production builds get the full experience.
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let Notifications: NotificationsModule | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications') as NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (err) {
    console.warn('expo-notifications unavailable', err);
    Notifications = null;
  }
}

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
    const N = Notifications;
    if (!N || !Device.isDevice) return null;

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('default', {
        name: 'Wishlist',
        importance: N.AndroidImportance.DEFAULT,
      });
    }

    const { status: existing } = await N.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const res = await N.requestPermissionsAsync();
      status = res.status;
    }
    if (status !== 'granted') return null;

    const token = (await N.getExpoPushTokenAsync()).data;
    await updateDoc(doc(db, 'users', userId), { pushToken: token });
    return token;
  } catch (err) {
    console.warn('Push registration failed', err);
    return null;
  }
}
