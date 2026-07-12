# Web Push (VAPID) — Design

**Date:** 2026-07-11
**Status:** Approved

## Goal

Wire up the `push-notifications` demo's backend so it works end-to-end in production: real VAPID
subscription, persisted storage, and a self-serve "send a real push to myself" flow. This is the
first of four Phase 3 (backend-dependent demos) sub-projects scoped in
`docs/superpowers/specs/2026-07-09-pwa-showcase-design.md` — Share Target, Background Sync/Fetch SW
handlers, and Incoming Call signaling follow as separate specs.

`declarative-web-push` stays as-is (explanatory stub) — out of scope for this spec.

## Constraints & decisions

- **Send model: self-serve only.** The demo page gets a "Send test push to myself" button that
  sends to the subscription currently held in that page's own React state — not a broadcast to
  every subscriber on this public site. `POST /api/push/send` takes the full subscription object
  directly in the request body (not a stored-id lookup), so it works even if the server's store was
  cleared since the subscribe call.
- **Persisted storage.** Subscriptions survive `docker compose pull && up -d` — stored as JSON on a
  Docker volume, not in memory only.
- **VAPID subject:** the site URL (`https://pwa.prostoapp.pp.ua`), hardcoded as a constant in server
  code (not a secret, doesn't vary per deploy — no need for an env var).
- **Graceful degradation:** missing VAPID keys must not crash the server or block the other ~70
  demos — push routes respond `503` instead.

## Architecture

- Add `web-push` to `server/package.json` dependencies.
- Generate a VAPID key pair once (`npx web-push generate-vapid-keys`); store
  `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` in the VPS `.env`, referenced in `docker-compose.yml`'s
  `environment:` block as **optional** (no `:?` requirement) so a redeploy without them doesn't
  refuse to start the container.
- `docker-compose.yml` gets a new named volume `push-data`, mounted at `/data` in the `app`
  container.
- New module `server/src/push.ts`:
  - Loads `PUSH_STORE_PATH` (env, defaults to `./data/push-subscriptions.json` relative to
    `server/`, so `npm run dev` works without Docker) into an in-memory `Map<endpoint,
    PushSubscriptionJSON>` on startup (empty map if the file doesn't exist yet).
  - `saveSubscription(sub)` — adds to the map, rewrites the JSON file in full.
  - `removeSubscription(endpoint)` — removes from the map, rewrites the file (used on 404/410
    cleanup).
  - `isConfigured()` — true only if both VAPID env vars are set.
- New routes in `server/src/app.ts`:
  - `GET /api/push/public-key` → `{ publicKey }` if configured, else `503`.
  - `POST /api/push/subscribe` → body is a `PushSubscriptionJSON`; stores it via `push.ts`; `503` if
    not configured.
  - `POST /api/push/send` → body is `{ subscription, title, body }`; calls
    `webpush.sendNotification(subscription, JSON.stringify({ title, body }), { vapidDetails })`;
    `503` if not configured, `410` + store cleanup if the push service reports the subscription is
    gone.
- `app/src/sw.ts` gains two listeners:
  - `push` — `event.waitUntil(self.registration.showNotification(data.title, { body: data.body }))`.
  - `notificationclick` — closes the notification, focuses an existing client or opens a new one.
- `app/src/demos/push-notifications/Demo.tsx`:
  - Replaces `generatePlaceholderApplicationServerKey()` with a fetch to
    `/api/push/public-key`, converting the base64url key to a `Uint8Array` before
    `pushManager.subscribe()`.
  - Keeps the existing POST to `/api/push/subscribe` (now actually succeeds instead of 404ing).
  - Adds a "Send test push to myself" button → `POST /api/push/send` with the subscription already
    held in component state.
  - Replaces the "server push endpoint is not available yet (coming in a later phase)" copy with
    real error text surfaced from the server (`503`/`410` bodies).

## Data flow

1. **Subscribe:** permission granted → `GET /api/push/public-key` → `pushManager.subscribe()` with
   the real key → `POST /api/push/subscribe` (persisted to `/data/push-subscriptions.json`) → UI
   shows the subscription JSON.
2. **Send:** click "Send test push to myself" → `POST /api/push/send` with the subscription from
   component state → `web-push` delivers via the browser's push service → service worker `push`
   event fires → `showNotification()` — works even if the tab is closed.
3. **Click:** clicking the OS notification → `notificationclick` → close it, focus/open the app tab.

## Error handling

- No VAPID keys configured → all three push routes return `503 { error: 'Push is not configured on
  this server.' }`; rest of the app is unaffected.
- `web-push.sendNotification` throws `WebPushError` with `statusCode` 404/410 → server removes the
  subscription from the store and returns `410 { error: 'Subscription expired — please subscribe
  again.' }`.
- File read/write errors on the store (e.g. volume not mounted, permissions) are logged
  server-side; affected routes return `503` rather than crashing the process.
- Client's existing `describeError()` is extended to surface error text from `/api/push/send`
  responses.

## Testing

- New `server/src/push.test.ts` (vitest + supertest, `web-push` mocked with `vi.mock` — no real
  network push calls in tests):
  - `GET /api/push/public-key` → key when configured, `503` when not.
  - `POST /api/push/subscribe` persists to a temp-dir `PUSH_STORE_PATH` and survives a fresh
    `createApp()` call reading the same path (simulates a restart).
  - `POST /api/push/send` calls the mocked `sendNotification` with the right args; a separate case
    covers the `410` + store-cleanup path.
- Existing Playwright smoke test (`e2e/smoke.spec.ts`) is unchanged — already asserts every demo
  route renders without crashing.
- Real end-to-end push delivery is verified manually on the deployed site, consistent with the
  project's existing approach to hardware/push APIs (no automated E2E for those, per
  `docs/superpowers/specs/2026-07-09-pwa-showcase-design.md`).

## Deployment

- `docker-compose.yml`: add `push-data:/data` volume; add optional `VAPID_PUBLIC_KEY` /
  `VAPID_PRIVATE_KEY` to `environment:`.
- `README.md`: document generating VAPID keys with `npx web-push generate-vapid-keys` and adding
  them to the VPS `.env`.
