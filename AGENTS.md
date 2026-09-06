# SpeakFree P2P — Base44 Dev Environment

## Overview
Frontend-only React 19 + Vite 6 + TypeScript + Tailwind v4 app. It is an interactive
**simulator/mockup** of an Android English-speaking-practice app (WebRTC P2P, Firestore
signaling, Google Play Billing). All "backend" behavior (matchmaking, calls, auth,
billing, Firestore logs) is simulated client-side in `src/App.tsx` — there is **no real
backend, no Firebase calls, no Gemini calls at runtime**.

The `app/` directory contains the actual Android (Kotlin/Jetpack Compose) source shown
read-only in the "Kotlin Codebase" tab; it is not built or run here.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Service `web` uses `node:22`, bind-mounts the repo at `/app`, runs `npm install && npm run dev`.
- Vite dev server on port 3000, host 0.0.0.0, `allowedHosts: true` (required for the preview proxy).
- Live reload is enabled; edits to `src/` appear in the preview automatically.

## Secrets
None required. `.env.example` lists an empty `FIREBASE_APPCHECK_DEBUG_TOKEN` but the web app
does not read any env vars at runtime.

## Verify it works
```
curl -sf -H "Host: external-preview.example.com" http://localhost:3000/
```
Should return the `index.html` with the Vite client injected.
