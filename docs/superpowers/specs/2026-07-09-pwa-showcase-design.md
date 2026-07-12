# PWA Feature Showcase — Design

**Date:** 2026-07-09
**Status:** Approved

## Goal

Build an open PWA feature showcase — the same concept as whatpwacando.today, but implemented from scratch (the original's source is not published and carries no license, so nothing is copied from it). The showcase covers every capability the original demonstrates plus modern capabilities added to the web platform in recent years, ~70 demos total.

## Constraints & decisions

- **Original implementation only.** No HTML/CSS/JS is taken from whatpwacando.today. Feature list parity is derived from the public list of demo names; each demo is written fresh against the underlying web API and its spec/MDN docs.
- **Stack:** Vite + React + TypeScript (strict), Biome for lint/format. No CSS framework; hand-written CSS with a dark default theme, own visual design.
- **Backend:** Node + Express + TypeScript in the same repo. Needed for Web Push (VAPID), incoming-call signaling (WebSocket), Web Share Target (POST endpoint), Background Fetch payloads.
- **Hosting:** own VPS. Docker Compose: app container (node serves API + built static files from one origin) + Caddy for automatic HTTPS. Single origin keeps service worker scope and push simple.
- **UI language:** English.

## Architecture

Monorepo with npm workspaces:

```
whatpwacando.today/
├── package.json            # workspaces: app, server
├── biome.json
├── docker-compose.yml      # app + caddy
├── Caddyfile
├── app/                    # Vite + React + TS (SPA)
│   ├── public/             # icons, manifest assets
│   ├── src/
│   │   ├── demos/<slug>/   # one folder per demo
│   │   │   ├── meta.ts     # title, description, category, support matrix, spec link
│   │   │   └── Demo.tsx    # lazy-loaded demo component
│   │   ├── components/     # Layout, DemoCard, SupportBadge, CodeBlock, ErrorBoundary
│   │   ├── registry.ts     # demo registry → routes
│   │   └── sw.ts           # service worker (vite-plugin-pwa, injectManifest)
│   └── vite.config.ts
└── server/                 # Express + TS: /api/push, /api/share-target, WS signaling
```

### Demo module contract

Every demo is a self-contained folder:

- `meta.ts` — `{ slug, title, category, description, browserSupport, specUrl, requiresBackend?, requiresInstall? }`. The registry imports all metas eagerly (small), components lazily via `React.lazy`.
- `Demo.tsx` — the interactive demo. Must:
  - feature-detect before rendering controls; if unsupported, show a "not supported in this browser" panel with the support matrix instead of broken buttons;
  - handle permission denial with a human-readable message;
  - be wrapped in a shared `ErrorBoundary` by the route layer.
- Each demo page shows: description, live demo, code snippet (the essential API usage), support badges, spec/MDN link.

### Home page

Card grid grouped by category, with search and a "supported in my browser" filter (computed from each meta's feature-detect function).

### PWA plumbing

- `manifest.webmanifest`: icons (maskable), `shortcuts`, `share_target`, `file_handlers`, `protocol_handlers`, `launch_handler`, `display_override: ["window-controls-overlay"]`, experimental `widgets` (Edge).
- Service worker via `vite-plugin-pwa` in `injectManifest` mode (hand-written SW is required for push, notification click handling, background sync/fetch, declarative web push fallback, share target, periodic sync). Precache the build for full offline support.

### Backend endpoints

- `POST /api/push/subscribe`, `POST /api/push/send` — web-push with VAPID keys (env vars). Subscriptions in memory (demo-grade; lost on restart — acceptable).
- WebSocket `/ws/call` — room-code based signaling so two devices can demo Incoming Call notifications (and a minimal WebRTC audio call).
- `POST /api/share-target` — receives shared data/files, redirects into the app.
- Static assets for Background Fetch demo (a large file to fetch in background).

## Feature set (~70 demos)

**Parity with the original (42):** Installation, Offline support, Notifications, Declarative Web Push, Shortcuts, View Transitions, Incoming Call Notifications, Geolocation, Media Capture, AirPlay, Picture-in-Picture, File System, Compression Streams, Authentication (WebAuthn/passkeys), Encryption (Web Crypto), Protocol Handling, File Handling, Contact Picker, Web Share, Viewport, Barcode Detection, Face Detection, Vibration, Audio Recording, Audio, Audio Session, Screen Capture, Element Capture, Background Sync, Background Fetch, Storage, Web Bluetooth, Web NFC, AR/VR (WebXR), Payment Request, Wake Lock, Orientation, Motion, Network Info, Speech Synthesis, Speech Recognition, Multi-touch.

**New — missing from the original (~28):**

| Demo | API | Notes |
|---|---|---|
| App Badging | `navigator.setAppBadge` | |
| Window Controls Overlay | `display_override` + `windowControlsOverlay` | requires install |
| EyeDropper | `EyeDropper` | |
| Web Serial | `navigator.serial` | hardware required |
| WebHID | `navigator.hid` | hardware required |
| WebUSB | `navigator.usb` | hardware required |
| Document Picture-in-Picture | `documentPictureInPicture` | |
| WebGPU | `navigator.gpu` | small render demo |
| WebCodecs | `VideoEncoder`/`VideoDecoder` | encode webcam frames |
| Idle Detection | `IdleDetector` | |
| Window Management | `getScreenDetails` | multi-screen |
| Device Posture | `navigator.devicePosture` | foldables |
| Virtual Keyboard | `navigator.virtualKeyboard` | |
| WebOTP | `navigator.credentials.get({otp})` | shows code + flow; live part needs an SMS provider — out of scope |
| Periodic Background Sync | `periodicSync` | requires install |
| Local Font Access | `queryLocalFonts` | |
| Launch Handler | manifest `launch_handler` | |
| Compute Pressure | `PressureObserver` | |
| Clipboard | async Clipboard API incl. images | |
| Speculation Rules | `<script type="speculationrules">` | prerender demo |
| Web Install API | `navigator.install` | very new, flag/origin-trial |
| Text Detection | `TextDetector` (Shape Detection) | |
| Presentation / Remote Playback | `PresentationRequest`, `remote` | cast to TV |
| Battery Status | `navigator.getBattery` | |
| Device & Page State | Device Memory, Permissions API, Page Visibility, Page Lifecycle (freeze/resume), online/offline | one category, several small demos |
| Home Screen Widgets | manifest `widgets` | Edge/Windows, declarative part only |
| Calendar Events | ICS generation | practical demo, not a new API |
| Phone Calls | `tel:` links | practical demo |

**Deliberately excluded:** Geofencing (spec dead; noted inside the Geolocation demo), Splash Screens / Pin to Taskbar / Run on Startup (installation properties, covered as text in the Installation demo), Cache-Control and Image Editing (not PWA-specific).

Experimental/Chrome-only demos are included and labeled with browser-support badges; unsupported browsers see the support matrix instead of the demo.

## Error handling

- Route-level `ErrorBoundary` around every demo — a crash in one demo never takes down the app.
- Permission denials (`NotAllowedError`) rendered as friendly guidance (how to re-enable), not raw errors.
- Backend-dependent demos detect API server absence (dev without server running) and say so.

## Testing

- **Vitest:** registry integrity (every demo folder has valid meta, unique slugs/routes), utility functions, ICS generation.
- **Playwright smoke:** home page renders, every demo route renders without crashing (feature-unsupported panels count as rendering), install manifest and SW register in Chromium.
- Hardware APIs (Bluetooth, NFC, Serial, HID, USB) and push are verified manually — no automated E2E.
- **Biome + `tsc --noEmit`** as CI gate.

## Implementation phases

1. **Skeleton:** monorepo, Vite + React + TS + Biome, layout, registry, routing, PWA plumbing (manifest, SW, offline), Express server stub, Docker + Caddy.
2. **Simple client-side demos:** all demos that need no backend, no install, no hardware (~45).
3. **Backend-dependent demos:** push, declarative push, incoming call (WS + WebRTC), share target, background fetch/sync.
4. **Hardware & experimental:** Bluetooth, NFC, Serial, HID, USB, WebXR, WebGPU, WebCodecs, widgets, Web Install.
5. **Polish:** icons, offline UX, search/filter, Lighthouse PWA pass, deployment docs.
