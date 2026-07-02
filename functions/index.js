/**
 * Cloud Function: deliver a push notification whenever an in-app
 * notification document is created (partner added a wish, joined the
 * couple, or completed a wish).
 *
 * The app registers an Expo push token on each user document; delivery
 * goes through Expo's push service.
 */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
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

/**
 * Callable: server-side link preview.
 *
 * The app first tries to read OpenGraph tags on-device, but many sites
 * (Instagram especially) only serve metadata to crawler user-agents or
 * block mobile fetches. This function fetches the page as a crawler and
 * returns { title, image, description, price } for the app to merge in.
 */
const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');

function matchMeta(html, property) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${property}["'][^>]*content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${property}["']`,
      'i'
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(m[1].trim());
  }
  return null;
}

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

exports.fetchLinkPreview = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in to fetch link previews.');
  }

  let parsed;
  try {
    parsed = new URL(String(request.data?.url ?? ''));
  } catch {
    throw new HttpsError('invalid-argument', 'A valid URL is required.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || PRIVATE_HOST.test(parsed.hostname)) {
    throw new HttpsError('invalid-argument', 'Only public http(s) URLs are supported.');
  }

  let html;
  try {
    const res = await fetch(parsed.href, {
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
      headers: {
        // Sites serve OpenGraph tags to link-preview crawlers.
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return { title: null, image: null, description: null, price: null };
    html = await res.text();
  } catch {
    return { title: null, image: null, description: null, price: null };
  }

  let title = matchMeta(html, 'og:title') ?? matchMeta(html, 'twitter:title');
  if (!title) {
    const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) title = decodeEntities(t[1].trim());
  }

  let price = null;
  const amount =
    matchMeta(html, 'product:price:amount') ??
    matchMeta(html, 'og:price:amount') ??
    matchMeta(html, 'price');
  if (amount) {
    const currency =
      matchMeta(html, 'product:price:currency') ??
      matchMeta(html, 'og:price:currency') ??
      '';
    price = currency ? `${currency} ${amount}` : amount;
  }

  return {
    title,
    image: matchMeta(html, 'og:image') ?? matchMeta(html, 'twitter:image'),
    description: matchMeta(html, 'og:description') ?? matchMeta(html, 'description'),
    price,
  };
});
