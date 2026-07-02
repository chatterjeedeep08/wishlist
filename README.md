# Wishlist 💝

A React Native (Expo) app for couples to keep a **shared wishlist** of things
they want to do, eat, visit, or receive as gifts — and to secretly plan
surprises for each other.

## Features

- **Email auth** with session persistence (Firebase Auth)
- **Couple pairing** via a 6-character invite code — both partners share one wishlist
- **Four wish categories**: Food 🍜 · Activities 🎨 · Places 🏖️ · Gifts 🎁
- **Three ways to add wishes**
  - Manually (title, description, category, photo, link, price, priority)
  - Paste a link — Amazon/Flipkart/Myntra/Nykaa/Ajio are detected as Gifts,
    Google Maps as Places, Instagram reels get keyword-based category
    detection, everything else falls back to generic link import.
    OpenGraph metadata (title, image, price) is fetched automatically.
  - **Share directly from other apps** (Instagram, Amazon, Chrome, Maps…)
    via the Android/iOS share sheet — the app opens with the link pre-filled
- **Real-time shared feed** with category filters (Firestore listeners)
- **Full wish editing** — every field (title, category, photo, link, price, priority) can be changed after creation
- **Six themes** (Love 💕, Cutesy 🎀, Dark 🌙, Modern 🏙️, Nature 🌿, Sunset 🌅)
  with themed background graphics, plus one-tap **theme sync with your partner**
- **In-app notification popups + unread badge** — a banner slides in when your
  partner adds/edits/completes a wish and tapping it opens that wish; the
  notifications tab shows a red dot while anything is unread
- **Profile**: profile picture, change password, break the pair, delete
  account, and a one-time floating-hearts celebration when you first open
  your profile after pairing (💔 becomes ❤️)
- **Completion notes** — an optional "how did it go?" note when marking a
  wish completed, shown on the wish afterwards
- **Field validation** with inline errors on signup and wish forms
- **Secret planning**: mark a partner's wish as "planning" — plans live in a
  private `plans` collection whose security rules block the creator from ever
  reading them, so surprises stay secret even at the API level
- **Completion tracking** with a Completed Wishes memory list
- **Photo attachments** — compressed on-device and stored inline in Firestore
  (no Firebase Storage needed)
- **Notifications**: in-app activity feed + push notifications sent
  device-to-device via Expo's push API (no server needed)
- **Freemium model**: 48-hour full-access trial → free tier (max 20 wishes,
  limited images) → Premium subscription (RevenueCat / Google Play Billing,
  with a demo-mode fallback when RevenueCat isn't configured)
- **Runs entirely on Firebase's free Spark plan** — no Storage, no Cloud
  Functions, no billing account required

## Tech stack

| Layer | Choice |
|---|---|
| App | Expo SDK 57 · React Native · TypeScript |
| Navigation | React Navigation (native stack + bottom tabs) |
| Backend | Firebase Auth · Firestore (free Spark plan) |
| Share intent | expo-share-intent (dev build required) |
| Payments | RevenueCat (`react-native-purchases`) |
| Push | expo-notifications + Expo push API |

## Project structure

```
App.tsx                     # Providers + root navigator
src/
  config/firebase.ts        # Firebase initialization (env-driven)
  theme.ts                  # Colors, spacing, category metadata
  types/                    # Shared TypeScript models
  context/
    AuthContext.tsx         # Auth state, live profile + partner, entitlements
    WishesContext.tsx       # Real-time couple wishlist subscription
    ThemeContext.tsx        # Theme selection, persistence, partner sync
    NotificationsContext.tsx # Unread count + in-app popup banner state
  services/
    authService.ts          # Signup / login / logout
    coupleService.ts        # Invite codes & pairing
    wishService.ts          # Wish CRUD, planning, completion, free-tier limit
    linkParser.ts           # Source detection + OpenGraph metadata extraction
    imageService.ts         # On-device photo compression (inline storage)
    notificationService.ts  # In-app + push notifications
    subscriptionService.ts  # Trial logic + RevenueCat wrapper
  hooks/useShareIntentSafe.ts  # Share-sheet integration (Expo Go safe)
  navigation/               # Stacks, tabs, share-intent routing
  screens/                  # 16 screens (auth / partner / main)
firestore.rules             # Security rules
firestore.indexes.json      # Composite indexes (required)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
   — the free **Spark plan** is all you need
2. Enable **Authentication → Email/Password** and **Firestore**
3. Add a **Web app** and copy its config
4. `cp .env.example .env` and fill in the `EXPO_PUBLIC_FIREBASE_*` values
5. Deploy rules and indexes (required — the feed queries need the composite indexes):

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore
```

### 3. Run the app

```bash
npx expo start
```

Works in **Expo Go** for everything except share-intent, push
notifications (removed from Expo Go since SDK 53 — the in-app
notifications feed still works) and real billing; all three degrade
gracefully and work fully in a development build (see below). Pressing
`w` runs the web version
(handy for quick UI checks; share-intent, push and billing are
mobile-only).

> **Troubleshooting — "Unable to resolve <package>" when bundling:**
> your `node_modules` is stale or a previous `npm install` failed on a
> peer-dependency conflict (fixed by the committed `.npmrc`). Delete
> `node_modules`, run `npm install` again, and restart with
> `npx expo start -c` to clear Metro's cache.

### 4. Development build (share-from-other-apps + billing)

`expo-share-intent` and `react-native-purchases` contain native code, so use
a dev build to test them:

```bash
npx expo prebuild
npx expo run:android   # or: eas build --profile development --platform android
```

After installing the build, tap **Share → Wishlist** in Instagram, Amazon,
Chrome, etc. — the app opens on the link-processing screen with everything
pre-filled.

### 5. RevenueCat (optional)

Without keys the paywall runs in **demo mode** (subscribing unlocks Premium
without charging — handy for testing the freemium gates). For real billing:

1. Create a RevenueCat project with a `premium` entitlement and attach your
   Google Play products
2. Put your public SDK keys in `.env`
   (`EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` / `..._IOS_API_KEY`)
3. Use a development build (step 4)

## Freemium rules

| Tier | Access |
|---|---|
| Trial (first 48h) | Everything |
| Free | Max 20 wishes, no image uploads, no secret planning |
| Premium | Unlimited wishes & images, secret planning, future features |

## Data model (Firestore)

- `users/{userId}` — name, email, partnerId, coupleId, trialStart, subscriptionStatus, pushToken, photo (base64 data URI), theme, themeSync, createdAt
- `couples/{coupleId}` — user1, user2, inviteCode, createdAt
- `wishlistItems/{itemId}` — coupleId, createdBy, createdByName, type, source, title, description, image (external URL or inline base64 data URI), link, price, priority, status, createdAt, completedAt
- `plans/{wishId_userId}` — wishId, userId, coupleId, createdAt
  (secret plans; rules only allow the planner to read their own docs)
- `notifications/{id}` — coupleId, toUserId, fromUserName, type, message, read, createdAt

## Spark-plan design choices

To keep the whole app on Firebase's no-cost Spark plan (new projects need
the Blaze plan for Storage and Cloud Functions), three things work
differently than a "classic" Firebase setup:

- **Photos** are resized to ≤600px JPEG on-device and stored inline in the
  wish document as a base64 data URI (typically 40–80 KB) instead of
  Firebase Storage.
- **Push notifications** are sent directly from the sender's device to
  Expo's push API instead of via a Cloud Function trigger.
- **Link previews** retry with a crawler user-agent on-device instead of
  scraping server-side.

If you later upgrade to Blaze, moving photos to Storage and push/scraping
into Cloud Functions are clean, isolated swaps (`imageService.ts`,
`notificationService.ts`, `linkParser.ts`).

## Known MVP limitations

- Link metadata extraction is best-effort: when a page can't be read even
  with the crawler user-agent retry (some Instagram content requires
  login), the user picks the category and title manually.
- Push delivery happens from the acting user's device; if they lose
  connectivity right after the action, the in-app notification still
  syncs but the push may not be sent.
