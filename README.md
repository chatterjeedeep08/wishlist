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
- **Secret planning**: mark a partner's wish as "planning" — the creator never sees it
- **Completion tracking** with a Completed Wishes memory list
- **Image uploads** to Firebase Storage
- **Notifications**: in-app activity feed + push notifications via a Cloud Function
- **Freemium model**: 48-hour full-access trial → free tier (max 20 wishes,
  limited images) → Premium subscription (RevenueCat / Google Play Billing,
  with a demo-mode fallback when RevenueCat isn't configured)

## Tech stack

| Layer | Choice |
|---|---|
| App | Expo SDK 57 · React Native · TypeScript |
| Navigation | React Navigation (native stack + bottom tabs) |
| Backend | Firebase Auth · Firestore · Storage · Cloud Functions |
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
    AuthContext.tsx         # Auth state, live profile, entitlements
    WishesContext.tsx       # Real-time couple wishlist subscription
  services/
    authService.ts          # Signup / login / logout
    coupleService.ts        # Invite codes & pairing
    wishService.ts          # Wish CRUD, planning, completion, free-tier limit
    linkParser.ts           # Source detection + OpenGraph metadata extraction
    storageService.ts       # Image uploads
    notificationService.ts  # In-app + push notifications
    subscriptionService.ts  # Trial logic + RevenueCat wrapper
  hooks/useShareIntentSafe.ts  # Share-sheet integration (Expo Go safe)
  navigation/               # Stacks, tabs, share-intent routing
  screens/                  # 16 screens (auth / partner / main)
functions/                  # Cloud Function: push on new notification
firestore.rules             # Security rules
firestore.indexes.json      # Composite indexes (required)
storage.rules               # Storage security rules
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**, **Firestore**, and **Storage**
3. Add a **Web app** and copy its config
4. `cp .env.example .env` and fill in the `EXPO_PUBLIC_FIREBASE_*` values
5. Deploy rules and indexes (required — the feed queries need the composite indexes):

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore,storage
```

### 3. Run the app

```bash
npx expo start
```

Works in **Expo Go** for everything except share-intent and real billing
(both degrade gracefully — see below).

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

### 5. Push notifications (optional)

Deploy the Cloud Function that forwards in-app notifications to Expo push:

```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```

### 6. RevenueCat (optional)

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

- `users/{userId}` — name, email, partnerId, coupleId, trialStart, subscriptionStatus, pushToken, createdAt
- `couples/{coupleId}` — user1, user2, inviteCode, createdAt
- `wishlistItems/{itemId}` — coupleId, createdBy, createdByName, type, source, title, description, image, link, price, priority, plannedBy, status, createdAt, completedAt
- `notifications/{id}` — coupleId, toUserId, fromUserName, type, message, read, createdAt

## Known MVP limitations

- Secret planning is hidden in the UI, but the `plannedBy` field is readable
  by both partners at the API level; hiding it server-side would need a
  Cloud Function or per-field rules.
- Instagram frequently gates reel metadata behind login, so category
  detection falls back to manual selection when the page can't be read.
- Wish editing after creation is limited to planning/completion state
  (full edit is a natural next step).
