import { LinkPreview, WishSource, WishType } from '../types';

const SHOPPING_HOSTS = [
  'amazon.',
  'amzn.',
  'flipkart.',
  'fkrt.',
  'myntra.',
  'nykaa.',
  'ajio.',
  'meesho.',
  'etsy.',
];

const MAPS_HOSTS = [
  'maps.google.',
  'google.com/maps',
  'goo.gl/maps',
  'maps.app.goo.gl',
  'maps.apple.com',
];

const FOOD_KEYWORDS = [
  'food', 'restaurant', 'cafe', 'coffee', 'ramen', 'sushi', 'pizza', 'burger',
  'dessert', 'bakery', 'brunch', 'dinner', 'lunch', 'breakfast', 'eat',
  'recipe', 'biryani', 'dosa', 'thali', 'street food', 'foodie', 'cuisine',
  'cocktail', 'bar ', 'buffet', 'tasting',
];

const ACTIVITY_KEYWORDS = [
  'class', 'workshop', 'pottery', 'painting', 'hike', 'hiking', 'trek',
  'kayak', 'concert', 'museum', 'bowling', 'karaoke', 'escape room', 'diy',
  'dance', 'yoga', 'climbing', 'skating', 'camping', 'movie', 'game',
  'experience', 'adventure', 'spa ', 'massage',
];

const PLACE_KEYWORDS = [
  'beach', 'travel', 'trip', 'visit', 'destination', 'city', 'island',
  'mountain', 'resort', 'hotel', 'sunset', 'view', 'waterfall', 'lake',
  'temple', 'palace', 'fort', 'wanderlust', 'vacation', 'getaway', 'tour',
];

export function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s"'<>()]+/i);
  return match ? match[0] : null;
}

export function detectSource(url: string): WishSource {
  const lower = url.toLowerCase();
  if (SHOPPING_HOSTS.some((h) => lower.includes(h))) return 'shopping';
  if (lower.includes('instagram.com')) return 'instagram';
  if (MAPS_HOSTS.some((h) => lower.includes(h))) return 'maps';
  return 'link';
}

export function detectTypeFromText(text: string): WishType | null {
  const lower = ` ${text.toLowerCase()} `;
  const score = (keywords: string[]) =>
    keywords.reduce((n, k) => (lower.includes(k) ? n + 1 : n), 0);

  const scores: [WishType, number][] = [
    ['food', score(FOOD_KEYWORDS)],
    ['activity', score(ACTIVITY_KEYWORDS)],
    ['place', score(PLACE_KEYWORDS)],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][1] > 0 ? scores[0][0] : null;
}

function defaultTypeForSource(source: WishSource): WishType | null {
  if (source === 'shopping') return 'gift';
  if (source === 'maps') return 'place';
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');
}

function matchMeta(html: string, property: string): string | null {
  // Handles both property/name attribute orders.
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

async function fetchHtml(url: string, timeoutMs = 8000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Some sites only serve OG tags to crawlers / plain browsers.
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Builds a LinkPreview for any pasted/shared URL:
 * detects the source app, fetches OpenGraph metadata (title, image, price)
 * and guesses the wish category. Falls back gracefully when the page
 * can't be fetched — the user can always fill fields manually.
 */
export async function parseLink(
  rawUrl: string,
  sharedTitle?: string | null
): Promise<LinkPreview> {
  const url = rawUrl.trim();
  const source = detectSource(url);

  let title: string | null = sharedTitle?.trim() || null;
  let image: string | null = null;
  let description: string | null = null;
  let price: string | null = null;

  const html = await fetchHtml(url);
  if (html) {
    title = matchMeta(html, 'og:title') ?? matchMeta(html, 'twitter:title') ?? title;
    if (!title) {
      const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (t) title = decodeEntities(t[1].trim());
    }
    image =
      matchMeta(html, 'og:image') ??
      matchMeta(html, 'twitter:image') ??
      matchMeta(html, 'image');
    description =
      matchMeta(html, 'og:description') ?? matchMeta(html, 'description');

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
  }

  const detectedType =
    defaultTypeForSource(source) ??
    detectTypeFromText([title, description, url].filter(Boolean).join(' '));

  return { url, source, detectedType, title, image, description, price };
}
