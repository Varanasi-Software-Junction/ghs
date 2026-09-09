# ExamForge Trusted Web Activity

This folder contains the Android Trusted Web Activity configuration for:

- Web origin: `https://exams.learnwithchampak.live`
- Android package: `live.learnwithchampak.exams`
- PWA manifest: `https://exams.learnwithchampak.live/examforge/manifest.json`
- TWA generator: Bubblewrap

## 1. Install tooling

Use a recent JDK and Android SDK, then from this `twa` folder run:

```bash
npm install
npm run doctor
```

## 2. Create the release signing key

Do not commit the keystore. It is ignored by `.gitignore`.

```bash
keytool -genkeypair -v \
  -keystore examforge-release.keystore \
  -alias examforge \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Get its SHA-256 certificate fingerprint:

```bash
keytool -list -v \
  -keystore examforge-release.keystore \
  -alias examforge
```

Copy the `SHA256:` value and write it into the root Digital Asset Links file:

```bash
python set-fingerprint.py "AA:BB:CC:...:FF"
```

The deployed file must be reachable at:

`https://exams.learnwithchampak.live/.well-known/assetlinks.json`

Until a real fingerprint replaces the placeholder, Android will fall back to a Custom Tab instead of a verified fullscreen TWA.

## 3. Generate/update the Android project

```bash
npm run update
```

Bubblewrap uses `twa-manifest.json` as the source configuration.

## 4. Build

```bash
npm run build
```

Bubblewrap produces Android package output suitable for testing and Play Store preparation.

## Google Play App Signing

If Google Play App Signing is enabled, the installed Play Store build is signed with Google's app-signing certificate. Add the SHA-256 fingerprint shown in Play Console under **App integrity / App signing key certificate** to `/.well-known/assetlinks.json` before production release. You may keep both the local/release fingerprint and Play app-signing fingerprint in the array when needed.

## Important files

- `twa-manifest.json` — Bubblewrap/TWA application settings.
- `../.well-known/assetlinks.json` — proves the Android app and website belong together.
- `set-fingerprint.py` — safely writes the signing certificate fingerprint.
- `.gitignore` — prevents signing keys and build artifacts from being committed.

The web application remains in `/examforge/`; the repository root and custom domain continue to open ExamForge.
