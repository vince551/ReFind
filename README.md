# ReFind 📱

**Find it. Recover it. Protect it.**

ReFind is a privacy-first lost-device recovery platform by **Vince Odhiambo**. It is designed around a simple real-world scenario: register your own phone before an event or trip, then use another device to find its latest available location if it goes missing.

## Architecture

```text
┌─────────────────────┐       PocketBase        ┌──────────────────────┐
│ ReFind Web PWA      │ ◄──────────────────────► │ Android Companion    │
│ Recovery dashboard  │       REST + SSE         │ Registered phone     │
│ Interactive map     │                          │ GPS + battery        │
└─────────────────────┘                          └──────────────────────┘
          │                                               │
          └────────────── owner-only records ─────────────┘
```

PocketBase provides the embedded SQLite database, authentication, REST API and realtime subscriptions. Its realtime API uses Server-Sent Events for record changes. urlPocketBase documentationhttps://pocketbase.io/docs/

## Current build

### Web
- Responsive recovery dashboard
- PWA manifest + service worker
- PocketBase authentication
- Device registration
- Interactive OpenStreetMap/Leaflet recovery map
- Last-known location marker + accuracy circle
- Realtime device subscription using PocketBase SSE
- Lost Mode synchronization
- Ring-command dispatch

### Android companion
- Native Android project under `android/`
- PocketBase Email/Password authentication
- Device registration with a stable local device ID
- Foreground location service
- Periodic GPS uploads
- Battery telemetry
- Owner ring-command polling
- Transparent persistent notification while recovery protection is active

Android location recovery uses a visible location foreground service. Android requires explicit location permissions and applies additional restrictions to background location and foreground-service startup on newer versions. urlAndroid location permissionshttps://developer.android.com/develop/sensors-and-location/location/permissions

## Important privacy and platform rules

ReFind is designed only for devices owned or explicitly authorized by the account holder. Location access is permission-based and visible to the user.

A powered-off phone, a phone with location/connectivity disabled, or a phone whose permissions have been revoked cannot be guaranteed to provide a live location.

The system does **not** attempt to bypass Android security, hide tracking, defeat permissions, or locate arbitrary devices from a phone number/IMEI.

## PocketBase deployment

The repository includes:

- `Dockerfile`
- `docker-compose.yml`
- `pb_migrations/`
- `config.js`

For local development, run PocketBase on `http://127.0.0.1:8090`. For an Internet-accessible deployment, run the included container on a server and set the web app's PocketBase URL to the server's HTTPS address.

The web app also supports overriding the URL through `localStorage` using the `refind_api_url` key.

## Android build

Open `android/` in Android Studio and build the `app` module. Set the PocketBase URL inside the app to the same reachable backend URL used by the web dashboard.

The companion requires location permission and uses a visible foreground service for ongoing recovery location. urlAndroid foreground location guidancehttps://developer.android.com/develop/sensors-and-location/location/permissions

## Recovery flow

1. **Create an account.**
2. **Register your own phone.**
3. **Install and configure the Android companion.**
4. **Grant the required location permission.**
5. **Start recovery protection while the phone is with you.**
6. If the phone is lost, **open ReFind from another device and sign in.**
7. The dashboard receives the phone's latest cloud-synced location through PocketBase realtime updates.
8. If the companion is online, owner-authorized recovery commands such as Ring can be delivered.

## Roadmap

- [x] PocketBase backend architecture
- [x] Android companion foundation
- [x] Owner authentication
- [x] Device registration
- [x] Location reporting
- [x] Interactive live recovery map
- [x] Realtime location synchronization
- [x] Battery telemetry
- [x] Ring command foundation
- [x] Lost Mode synchronization
- [ ] Location history timeline
- [ ] More robust command acknowledgements
- [ ] Secure command expiration / replay protection
- [ ] Multi-device dashboard
- [ ] Production monitoring, privacy policy and deployment hardening

## Built by

**Vince Odhiambo** — web developer and technology builder.

> ReFind is for recovering devices you own or are authorized to manage. It is not a covert-tracking tool.
