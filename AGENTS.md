# Base44 Dev Environment

## What this app is
A Vite + React + TypeScript SPA (`src/`) that serves as an interactive **simulator/preview** for an Android app ("SpeakFree P2P", Kotlin/Jetpack Compose under `app/`). The web frontend is fully self-contained: all state is local React state + `localStorage`. No backend, no database, no runtime external API calls.

## Running it
```
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 base image, source bind-mounted at `/app`, deps installed on boot via `npm install`.
- Vite dev server on port 3000, host `0.0.0.0`, `allowedHosts: true` (accepts the preview's external hostname).
- Live reload enabled (chokidar polling for bind-mount reliability).

## Secrets
None required. `@google/genai` is a dependency but unused in the web frontend. `.env.example` lists `FIREBASE_APPCHECK_DEBUG_TOKEN`, which the web app never reads.

## Verify
- `curl -sf http://localhost:3000/` returns the app HTML.
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/src/main.tsx` returns live (unhashed) source — confirms dev mode, not a prebuilt bundle.
