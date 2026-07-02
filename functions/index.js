/**
 * Cloud Function: deliver a push notification whenever an in-app
 * notification document is created (partner added a wish, joined the
 * couple, or completed a wish).
 *
 * The app registers an Expo push token on each user document; delivery
 * goes through Expo's push service.
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

exports.sendPushOnNotification = onDocumentCreated(
  'notifications/{notificationId}',
  async (event) => {
    const notification = event.data?.data();
    if (!notification?.toUserId) return;

    const userSnap = await getFirestore()
      .collection('users')
      .doc(notification.toUserId)
      .get();
    const pushToken = userSnap.get('pushToken');
    if (!pushToken) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: pushToken,
        title: 'Wishlist 💝',
        body: notification.message,
        sound: 'default',
      }),
    });
  }
);
