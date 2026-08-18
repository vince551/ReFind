# ReFind Firebase backend

ReFind uses Firebase Authentication + Cloud Firestore for the cross-device recovery layer.

## Data model

```text
users/{uid}
  devices/{deviceId}
    name
    platform
    status
    lastSeen
    lastLocation: { latitude, longitude, accuracy, timestamp }
    locations/{locationId}
      latitude
      longitude
      accuracy
      timestamp
```

## Setup

1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Publish `firestore.rules`.
5. Add an Android app with package name `com.vince.refind`.
6. Download `google-services.json` and place it at `android/app/google-services.json` locally. Never commit private service-account credentials.
7. Build and install the Android companion app.

Firebase configuration values used by Android are normal client configuration values; server/service-account keys must never be placed in the web app or APK.

## Why the Android companion matters

The web app can request a location while it is open, but a lost-phone recovery product needs a native companion to keep sending owner-authorized location updates. Android requires explicit location permissions and uses a visible foreground service for ongoing location access. On Android 11+, background location is granted through system settings rather than the initial permission dialog.
