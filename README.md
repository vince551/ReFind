# ReFind 📱

**Find it. Recover it. Protect it.**

ReFind is a privacy-first lost-device recovery platform by **Vince Odhiambo**. The idea came from a real problem: a phone can disappear at an event and the owner may have no practical recovery tool ready.

## Architecture

```text
┌────────────────────┐       Firebase Auth / Firestore       ┌──────────────────────┐
│ ReFind Web PWA     │ ◄───────────────────────────────────► │ Android Companion    │
│ Recovery dashboard │                                       │ Registered phone     │
│ Login + map        │                                       │ Location service     │
└────────────────────┘                                       └──────────────────────┘
          ▲                                                          │
          └────────────── owner-only device records ─────────────────┘
```

## Current build

### Web
- Responsive recovery dashboard
- PWA manifest + service worker
- Browser location prototype
- Lost Mode UI
- Recovery-action placeholders

### Android companion
- Native Android project under `android/`
- Firebase Email/Password authentication
- Device registration with a stable local device ID
- Firestore device record
- Foreground location service
- Periodic location uploads to the owner's Firestore account
- Transparent persistent notification while recovery protection is active

### Firebase
- Owner-only Firestore rules in `firebase/firestore.rules`
- Backend data model documented in `firebase/README.md`
- Android configuration template at `android/app/google-services.json.example`

## Important privacy and platform rules

ReFind is designed only for devices owned or explicitly authorized by the account holder. Location access is permission-based and visible to the user.

Android requires explicit location permissions. For ongoing recovery location, the app uses a visible location foreground service. On newer Android versions, background location is subject to additional system permission flows and platform restrictions.

A powered-off phone, a phone with location/connectivity disabled, or a phone whose permissions have been revoked cannot be guaranteed to provide a live location.

## Firebase setup

1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create **Cloud Firestore**.
4. Publish `firebase/firestore.rules`.
5. Register Android package `com.vince.refind`.
6. Download `google-services.json` and place it at `android/app/google-services.json` locally.
7. Build and install the Android app.

Do **not** commit Firebase service-account credentials or other server secrets.

## Android build

Open the `android/` directory in Android Studio, add your real `google-services.json`, then build the `app` module.

## Roadmap

- [x] Cross-device backend architecture
- [x] Android companion foundation
- [x] Owner authentication
- [x] Device registration
- [x] Location reporting foundation
- [ ] Web Firebase authentication UI
- [ ] Live map from Firestore
- [ ] Real-time device status
- [ ] Secure ring command
- [ ] Lost Mode synchronization
- [ ] Location history UI
- [ ] Battery telemetry
- [ ] Security hardening, audit logs and production deployment

## Built by

**Vince Odhiambo** — web developer and technology builder.

> ReFind is for recovering devices you own or are authorized to manage. It is not a covert-tracking tool.
