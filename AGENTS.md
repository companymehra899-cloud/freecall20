# Base44 Dev Environment

## Overview
SpeakFree P2P is a Vite + React 19 + TypeScript web app that serves as an interactive
simulator/showcase for an Android (Kotlin/Jetpack Compose) English-speaking-practice app.
The web app is **frontend-only** — all WebRTC calls, Firebase auth, Firestore signaling,
and Google Play Billing are simulated in React state. No real external services are called.

## Stack
- Vite 6, React 19, Tailwind CSS 4 (via `@tailwindcss/vite`), lucide-react, motion
- No backend, no database, no external API calls from the web app

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 slim image, source bind-mounted at `/app`
- `npm install` + `npm run dev` (Vite) on container start
- Dev server on port 3000, bound to 0.0.0.0, `allowedHosts: true` for preview access
- Live reload via Vite HMR (watch polling enabled for bind mounts)

## Secrets
None required. The app is fully self-contained with no external credentials.

## Verification
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the app HTML
- `curl -sf http://localhost:3000/src/main.tsx` returns 200 (live source, not prebuilt)
- Healthcheck: `docker compose -f docker-compose.base44.yml ps` shows `healthy`

## Notes
- The `app/` directory contains the Android (Kotlin) source — not part of the web build.
- `@google/genai` is listed in package.json but not imported by the web app.
- `.env.example` references `FIREBASE_APPCHECK_DEBUG_TOKEN` but it's unused by the web app.
