# ReFind 📱

**Find it. Recover it. Protect it.**

ReFind is a privacy-first lost-device recovery project by **Vince Odhiambo**. The goal is simple: register your own phone before an event, trip, school day or everyday use, then use another device to access a secure recovery dashboard when it goes missing.

## Current MVP

- Responsive recovery dashboard
- Device registration flow
- Browser geolocation permission and latest-location capture
- Battery information when supported by the browser
- Lost Mode state
- Ring/recovery action placeholder for the future companion app
- PWA manifest, service worker and install prompt
- Offline-friendly shell
- Clear security/permission boundaries

### Important limitation

The current GitHub Pages MVP stores its demo state locally in the browser. A web page cannot reliably locate a separate lost phone by itself, bypass Android/iOS permissions, or locate a powered-off device.

## Next build phases

1. **Authenticated cloud backend** — accounts, device ownership and encrypted device records.
2. **Android companion app** — background location reporting, battery state and secure commands.
3. **Live map** — cross-device location updates and location history.
4. **Recovery actions** — ring, Lost Mode, recovery message and device status.
5. **Security hardening** — token rotation, rate limits, audit logs and device revocation.
6. **Production deployment** — monitoring, privacy policy and app-store readiness.

## Run locally

This is a static PWA, so any static server works. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser and allow location access when prompted.

## GitHub Pages

The project can be served directly from the repository's `main` branch once GitHub Pages is enabled.

## Built by

**Vince Odhiambo** — web developer and technology builder.

> ReFind is intended for recovering devices owned or authorized by the person using the service. It is not designed for covert tracking.
