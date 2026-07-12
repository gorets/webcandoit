# Web Push (VAPID) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `push-notifications` demo work end-to-end in production — real VAPID subscribe, persisted storage, and a self-serve "send a real push to myself" flow.

**Architecture:** A new `server/src/push.ts` module persists subscriptions as JSON on a Docker volume. Three new Express routes in `server/src/app.ts` (`GET /api/push/public-key`, `POST /api/push/subscribe`, `POST /api/push/send`) use it plus the `web-push` library. The service worker (`app/src/sw.ts`) gains `push`/`notificationclick` listeners. The client demo (`app/src/demos/push-notifications/Demo.tsx`) fetches the real VAPID key instead of generating a placeholder one, and gets a "send test push to myself" button.

**Tech Stack:** Express 5, `web-push` 3.6.7 (+ `@types/web-push` 3.6.4), vitest + supertest, Vite + `vite-plugin-pwa` (injectManifest), React.

## Global Constraints

- Self-serve send only: `POST /api/push/send` takes the subscription directly in the request body (no stored-id lookup) — never broadcasts to other visitors' subscriptions.
- Subscriptions persist as JSON on a Docker volume (`push-data:/data`), not in-memory only — must survive `docker compose pull && up -d`.
- `VAPID_SUBJECT` is the hardcoded constant `https://pwa.prostoapp.pp.ua` — not an env var.
- Missing `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` must degrade gracefully: affected routes return `503`, the rest of the app (all other demos) keeps working. The server must never crash or refuse to start over this.
- `declarative-web-push` demo is out of scope — do not touch it.
- Spec: `docs/superpowers/specs/2026-07-11-web-push-design.md`.

---

### Task 1: Push subscription store

**Files:**
- Modify: `server/package.json`
- Create: `server/src/push.ts`
- Test: `server/src/push.test.ts`

**Interfaces:**
- Produces: `isPushConfigured(vapidPublicKey: string | undefined, vapidPrivateKey: string | undefined): boolean`
- Produces: `createPushStore(storePath: string): PushStore`, where:
  ```ts
  interface PushStore {
    save(subscription: PushSubscription): void;
    remove(endpoint: string): void;
    all(): PushSubscription[];
  }
  ```
  (`PushSubscription` is the type from the `web-push` package: `{ endpoint: string; expirationTime?: null | number; keys: { p256dh: string; auth: string } }`.)

- [ ] **Step 1: Add dependencies**

Edit `server/package.json` — add to `dependencies` and `devDependencies`:

```json
  "dependencies": {
    "express": "^5.0.0",
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.0",
    "@types/web-push": "^3.6.4",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^3.0.0"
  }
```

Run from the repo root: `npm install`

- [ ] **Step 2: Write the failing test**

Create `server/src/push.test.ts`:

```ts
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPushStore, isPushConfigured } from './push.js';

describe('isPushConfigured', () => {
  it('is false when either key is missing', () => {
    expect(isPushConfigured(undefined, undefined)).toBe(false);
    expect(isPushConfigured('pub', undefined)).toBe(false);
    expect(isPushConfigured(undefined, 'priv')).toBe(false);
  });

  it('is true when both keys are set', () => {
    expect(isPushConfigured('pub', 'priv')).toBe(true);
  });
});

describe('createPushStore', () => {
  let dir: string;
  let storePath: string;

  const sampleSubscription = {
    endpoint: 'https://push.example.com/abc',
    keys: { p256dh: 'p256dh-value', auth: 'auth-value' },
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'push-store-test-'));
    storePath = path.join(dir, 'subscriptions.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('starts empty when no file exists yet', () => {
    const store = createPushStore(storePath);
    expect(store.all()).toEqual([]);
  });

  it('persists a saved subscription to disk', () => {
    const store = createPushStore(storePath);
    store.save(sampleSubscription);
    expect(store.all()).toEqual([sampleSubscription]);
    const onDisk = JSON.parse(readFileSync(storePath, 'utf-8'));
    expect(onDisk[sampleSubscription.endpoint]).toEqual(sampleSubscription);
  });

  it('survives a fresh instance reading the same path (simulated restart)', () => {
    createPushStore(storePath).save(sampleSubscription);
    const restarted = createPushStore(storePath);
    expect(restarted.all()).toEqual([sampleSubscription]);
  });

  it('removes a subscription and persists the removal', () => {
    const store = createPushStore(storePath);
    store.save(sampleSubscription);
    store.remove(sampleSubscription.endpoint);
    expect(store.all()).toEqual([]);
    const restarted = createPushStore(storePath);
    expect(restarted.all()).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test -w server`
Expected: FAIL — `Cannot find module './push.js'` (or similar resolution error), since `server/src/push.ts` doesn't exist yet.

- [ ] **Step 4: Write the implementation**

Create `server/src/push.ts`:

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PushSubscription } from 'web-push';

export function isPushConfigured(
  vapidPublicKey: string | undefined,
  vapidPrivateKey: string | undefined,
): boolean {
  return Boolean(vapidPublicKey && vapidPrivateKey);
}

export interface PushStore {
  save(subscription: PushSubscription): void;
  remove(endpoint: string): void;
  all(): PushSubscription[];
}

export function createPushStore(storePath: string): PushStore {
  const subscriptions = new Map<string, PushSubscription>();

  if (existsSync(storePath)) {
    const raw = readFileSync(storePath, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, PushSubscription>;
    for (const [endpoint, subscription] of Object.entries(parsed)) {
      subscriptions.set(endpoint, subscription);
    }
  }

  function persist(): void {
    mkdirSync(path.dirname(storePath), { recursive: true });
    const serialized = Object.fromEntries(subscriptions);
    writeFileSync(storePath, JSON.stringify(serialized, null, 2));
  }

  return {
    save(subscription) {
      subscriptions.set(subscription.endpoint, subscription);
      persist();
    },
    remove(endpoint) {
      subscriptions.delete(endpoint);
      persist();
    },
    all() {
      return Array.from(subscriptions.values());
    },
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run test -w server`
Expected: PASS (8 tests: 2 for `isPushConfigured`, 4 for `createPushStore` under `describe`, run count may show as 6 total `it` blocks).

- [ ] **Step 6: Commit**

```bash
git add server/package.json package-lock.json server/src/push.ts server/src/push.test.ts
git commit -m "feat: add persisted push subscription store"
```

---

### Task 2: Wire push routes into the server

**Files:**
- Modify: `server/src/app.ts`
- Modify: `server/src/index.ts`
- Modify: `server/src/app.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `isPushConfigured`, `createPushStore`, `PushStore` from `./push.js` (Task 1).
- Produces: `createApp(options?: CreateAppOptions)` where:
  ```ts
  interface CreateAppOptions {
    pushStorePath?: string;
    vapidPublicKey?: string;
    vapidPrivateKey?: string;
  }
  ```
  `createApp()` with no options keeps working exactly as before (health check + prod static serving), with push routes present but reporting `503` since no VAPID keys are passed.

- [ ] **Step 1: Write the failing tests**

Replace the full contents of `server/src/app.test.ts`:

```ts
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as webpush from 'web-push';
import { createApp } from './app.js';
import { createPushStore } from './push.js';

vi.mock('web-push', () => {
  class WebPushError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  return {
    sendNotification: vi.fn(),
    WebPushError,
  };
});

describe('api', () => {
  it('responds to health check', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('push routes', () => {
  let dir: string;
  let pushStorePath: string;

  const sampleSubscription = {
    endpoint: 'https://push.example.com/abc',
    keys: { p256dh: 'p256dh-value', auth: 'auth-value' },
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'push-routes-test-'));
    pushStorePath = path.join(dir, 'subscriptions.json');
    vi.mocked(webpush.sendNotification).mockReset();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe('when push is not configured', () => {
    const app = () => createApp({ pushStorePath });

    it('GET /api/push/public-key returns 503', async () => {
      const res = await request(app()).get('/api/push/public-key');
      expect(res.status).toBe(503);
      expect(res.body).toEqual({ error: 'Push is not configured on this server.' });
    });

    it('POST /api/push/subscribe returns 503', async () => {
      const res = await request(app()).post('/api/push/subscribe').send(sampleSubscription);
      expect(res.status).toBe(503);
    });

    it('POST /api/push/send returns 503', async () => {
      const res = await request(app())
        .post('/api/push/send')
        .send({ subscription: sampleSubscription, title: 'Hi', body: 'There' });
      expect(res.status).toBe(503);
    });
  });

  describe('when push is configured', () => {
    const createConfiguredApp = () =>
      createApp({ pushStorePath, vapidPublicKey: 'pub-key', vapidPrivateKey: 'priv-key' });

    it('GET /api/push/public-key returns the public key', async () => {
      const res = await request(createConfiguredApp()).get('/api/push/public-key');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ publicKey: 'pub-key' });
    });

    it('POST /api/push/subscribe rejects an invalid subscription', async () => {
      const res = await request(createConfiguredApp())
        .post('/api/push/subscribe')
        .send({ endpoint: 'https://push.example.com/abc' });
      expect(res.status).toBe(400);
    });

    it('POST /api/push/subscribe stores a valid subscription, surviving a fresh app instance', async () => {
      const res = await request(createConfiguredApp())
        .post('/api/push/subscribe')
        .send(sampleSubscription);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });

      const restarted = createPushStore(pushStorePath);
      expect(restarted.all()).toEqual([sampleSubscription]);
    });

    it('POST /api/push/send calls web-push with the right arguments', async () => {
      vi.mocked(webpush.sendNotification).mockResolvedValueOnce({
        statusCode: 201,
        body: '',
        headers: {},
      });

      const res = await request(createConfiguredApp())
        .post('/api/push/send')
        .send({ subscription: sampleSubscription, title: 'Hello', body: 'World' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        sampleSubscription,
        JSON.stringify({ title: 'Hello', body: 'World' }),
        {
          vapidDetails: {
            subject: 'https://pwa.prostoapp.pp.ua',
            publicKey: 'pub-key',
            privateKey: 'priv-key',
          },
        },
      );
    });

    it('POST /api/push/send removes the subscription and returns 410 when it is gone', async () => {
      createPushStore(pushStorePath).save(sampleSubscription);
      vi.mocked(webpush.sendNotification).mockRejectedValueOnce(
        new webpush.WebPushError('Gone', 410, {}, '', sampleSubscription.endpoint),
      );

      const res = await request(createConfiguredApp())
        .post('/api/push/send')
        .send({ subscription: sampleSubscription, title: 'Hello', body: 'World' });

      expect(res.status).toBe(410);
      expect(createPushStore(pushStorePath).all()).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -w server`
Expected: FAIL — `createApp` doesn't accept an options argument yet, and the push routes don't exist (404s instead of the expected status codes).

- [ ] **Step 3: Implement the routes**

Replace the full contents of `server/src/app.ts`:

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import * as webpush from 'web-push';
import { createPushStore, isPushConfigured } from './push.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const appDist = path.resolve(moduleDir, '../../app/dist');
const defaultPushStorePath = path.resolve(moduleDir, '../data/push-subscriptions.json');

const VAPID_SUBJECT = 'https://pwa.prostoapp.pp.ua';

export interface CreateAppOptions {
  pushStorePath?: string;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(express.json());

  const pushStorePath = options.pushStorePath ?? defaultPushStorePath;
  const { vapidPublicKey, vapidPrivateKey } = options;
  const pushStore = createPushStore(pushStorePath);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/push/public-key', (_req, res) => {
    if (!isPushConfigured(vapidPublicKey, vapidPrivateKey)) {
      res.status(503).json({ error: 'Push is not configured on this server.' });
      return;
    }
    res.json({ publicKey: vapidPublicKey });
  });

  app.post('/api/push/subscribe', (req, res) => {
    if (!isPushConfigured(vapidPublicKey, vapidPrivateKey)) {
      res.status(503).json({ error: 'Push is not configured on this server.' });
      return;
    }
    const subscription = req.body as webpush.PushSubscription | undefined;
    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      res.status(400).json({ error: 'Invalid subscription.' });
      return;
    }
    pushStore.save(subscription);
    res.json({ ok: true });
  });

  app.post('/api/push/send', async (req, res) => {
    if (!isPushConfigured(vapidPublicKey, vapidPrivateKey)) {
      res.status(503).json({ error: 'Push is not configured on this server.' });
      return;
    }
    const { subscription, title, body } = req.body as {
      subscription?: webpush.PushSubscription;
      title?: string;
      body?: string;
    };
    if (!subscription?.endpoint || !title || !body) {
      res.status(400).json({ error: 'Invalid request.' });
      return;
    }
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body }), {
        vapidDetails: {
          subject: VAPID_SUBJECT,
          publicKey: vapidPublicKey as string,
          privateKey: vapidPrivateKey as string,
        },
      });
      res.json({ ok: true });
    } catch (err) {
      if (
        err instanceof webpush.WebPushError &&
        (err.statusCode === 404 || err.statusCode === 410)
      ) {
        pushStore.remove(subscription.endpoint);
        res.status(410).json({ error: 'Subscription expired — please subscribe again.' });
        return;
      }
      res.status(502).json({ error: 'Failed to send push notification.' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(appDist));
    // SPA fallback: any non-API GET returns index.html
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(appDist, 'index.html'));
    });
  }

  return app;
}
```

Replace the full contents of `server/src/index.ts`:

```ts
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 8080);
createApp({
  pushStorePath: process.env.PUSH_STORE_PATH,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
}).listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
```

Add a line to `.gitignore` (so a locally-created default store file is never committed) — insert after the existing `.env` line:

```
server/data/
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -w server`
Expected: PASS (1 health check test + 9 push route tests).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck -w server`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add server/src/app.ts server/src/index.ts server/src/app.test.ts .gitignore
git commit -m "feat: add push subscribe/send/public-key routes"
```

---

### Task 3: Service worker push handling

**Files:**
- Modify: `app/src/sw.ts`

**Interfaces:**
- Consumes: nothing new — uses only `self.registration`, `self.clients`, and the standard `PushEvent`/`NotificationEvent` types already available via `/// <reference lib="webworker" />`.
- Produces: nothing consumed elsewhere in code — this is the runtime behavior the `push-notifications` demo (Task 4) and the server's `push` payload shape (Task 2, `JSON.stringify({ title, body })`) depend on at runtime.

- [ ] **Step 1: Implement the handlers**

Replace the full contents of `app/src/sw.ts`:

```ts
/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() as { title?: string; body?: string } | undefined;
  const title = data?.title ?? 'Notification';
  const options: NotificationOptions = { body: data?.body ?? '' };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build -w app`
Expected: build succeeds (this compiles `sw.ts` via `vite-plugin-pwa`'s `injectManifest` step); no TypeScript errors.

There is no automated test for service worker event handling — jsdom (used by this project's vitest setup) doesn't implement a service worker environment. This matches the project's existing approach to push/hardware APIs (manual verification only, per `docs/superpowers/specs/2026-07-09-pwa-showcase-design.md`). Manual verification happens in Task 5's final step.

- [ ] **Step 3: Commit**

```bash
git add app/src/sw.ts
git commit -m "feat: handle push and notificationclick in the service worker"
```

---

### Task 4: Client demo — real subscribe + send button

**Files:**
- Modify: `app/src/demos/push-notifications/Demo.tsx`

**Interfaces:**
- Consumes: `GET /api/push/public-key`, `POST /api/push/subscribe`, `POST /api/push/send` (Task 2) — all returning `{ error: string }` bodies on non-2xx responses.
- Produces: nothing consumed elsewhere — this is a leaf demo component.

- [ ] **Step 1: Implement the changes**

Replace the full contents of `app/src/demos/push-notifications/Demo.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';

type SwState = 'checking' | 'active' | 'unavailable';

// Waits for an active service worker registration, but never hangs forever:
// the app only registers its service worker in production builds (see
// src/pwa.ts), so in dev `navigator.serviceWorker.ready` would never resolve.
async function getActiveRegistration(timeoutMs = 3000): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing?.active) return existing;
  } catch {
    // ignore and fall through to the ready/timeout race
  }
  const timedOut = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });
  const ready = navigator.serviceWorker.ready.catch(() => null);
  return Promise.race([ready, timedOut]);
}

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

// Fetches the server's real VAPID public key so pushManager.subscribe() creates
// a subscription the server can actually send to (see server/src/push.ts).
async function fetchApplicationServerKey(): Promise<Uint8Array> {
  const res = await fetch('/api/push/public-key');
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Push is not configured on this server.');
  }
  const { publicKey } = (await res.json()) as { publicKey: string };
  return urlBase64ToUint8Array(publicKey);
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') return 'Permission to show notifications was denied.';
    if (err.name === 'AbortError') {
      return 'The push service rejected the subscription request (this can happen without a real push server or on some networks).';
    }
    return `${err.name}: ${err.message}`;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}

export default function PushNotificationsDemo() {
  const [swState, setSwState] = useState<SwState>('checking');
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveRegistration().then((registration) => {
      if (cancelled) return;
      registrationRef.current = registration;
      setSwState(registration ? 'active' : 'unavailable');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubscribe = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setError('Notification permission was not granted.');
        return;
      }
      const registration = registrationRef.current;
      if (!registration) {
        setError(
          'No active service worker registration is available, so push subscription cannot proceed. Run a production build/preview to activate the service worker.',
        );
        return;
      }
      const applicationServerKey = await fetchApplicationServerKey();
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      } as PushSubscriptionOptionsInit);
      const json = sub.toJSON();

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      setSubscription(json);
      setNotice('Subscription created and sent to the server.');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSendTestPush = async () => {
    setError(null);
    setNotice(null);
    if (!subscription) {
      setError('Subscribe first before sending a test push.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          title: 'Push demo notification',
          body: 'This arrived through a real push message sent by the server.',
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      setNotice('Push sent — check your system notification tray.');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleShowLocal = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      let current = permission;
      if (current !== 'granted') {
        current = await Notification.requestPermission();
        setPermission(current);
      }
      if (current !== 'granted') {
        setError('Notification permission was not granted.');
        return;
      }
      const registration = registrationRef.current;
      if (!registration) {
        setError(
          'No active service worker registration is available, so a notification cannot be shown. Run a production build/preview to activate the service worker.',
        );
        return;
      }
      await registration.showNotification('Push demo notification', {
        body: 'This is shown locally by the service worker — no server or push message involved.',
        tag: 'push-demo-local',
      });
      setNotice('Local notification shown — check your system notification tray.');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        Subscribes this browser to push messages via the Push API, and separately demonstrates
        showing a notification locally through the service worker.
      </p>
      <p role="status" style={{ color: 'var(--text-dim)' }}>
        Service worker: {swState === 'checking' && 'checking…'}
        {swState === 'active' && 'active'}
        {swState === 'unavailable' &&
          'no active registration found (only registers in production builds).'}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleSubscribe} disabled={busy}>
          Request permission &amp; subscribe
        </button>
        <button type="button" onClick={handleSendTestPush} disabled={busy || !subscription}>
          Send test push to myself
        </button>
        <button type="button" onClick={handleShowLocal} disabled={busy}>
          Show local notification
        </button>
      </div>
      <p style={{ color: 'var(--text-dim)' }}>Notification permission: {permission}</p>
      {notice && (
        <p role="status" style={{ color: 'var(--accent)' }}>
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {subscription && (
        <pre
          style={{
            background: 'var(--surface-2)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(subscription, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck -w app`
Expected: no errors.

- [ ] **Step 3: Run the Playwright smoke suite**

Run: `npm run e2e`
Expected: PASS — the existing smoke test already visits every demo route including `/demo/push-notifications` and asserts it renders without crashing; this must still hold with the new button present.

There is no per-demo unit test in this codebase (only `registry.ts`, `DemoPage.tsx`, and `Home.tsx` have dedicated tests) — this matches that existing convention. The actual push subscribe/send/receive flow is verified manually in Task 5's final step.

- [ ] **Step 4: Commit**

```bash
git add app/src/demos/push-notifications/Demo.tsx
git commit -m "feat: subscribe with the real VAPID key and add a send-test-push button"
```

---

### Task 5: Deployment config, docs, and manual verification

**Files:**
- Modify: `docker-compose.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_STORE_PATH` env vars (read by `server/src/index.ts`, Task 2).

- [ ] **Step 1: Update docker-compose.yml**

Replace the full contents of `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    image: gorobetsva/pwa-showcases:latest
    restart: unless-stopped
    ports:
      - '127.0.0.1:18080:8080'
    environment:
      - PORT=8080
      - VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY:-}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY:-}
      - PUSH_STORE_PATH=/data/push-subscriptions.json
    volumes:
      - push-data:/data

volumes:
  push-data:
```

- [ ] **Step 2: Validate the compose file**

Run: `docker compose config`
Expected: no errors; the `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` lines print with empty values (with a "variable is not set, defaulting to a blank string" note being avoided by the `:-` default) if no `.env` is present locally.

- [ ] **Step 3: Document Web Push setup in README**

In `README.md`, insert a new `### Web Push` subsection immediately after the existing Nginx server block (after the closing ` ``` ` of that code block, before the file ends):

```markdown

### Web Push

Push notifications need a VAPID key pair. Generate one once:

    npx web-push generate-vapid-keys

Add the output to the VPS `.env`:

    echo "VAPID_PUBLIC_KEY=<public key>" >> .env
    echo "VAPID_PRIVATE_KEY=<private key>" >> .env

Then `docker compose up -d` to pick them up. Subscriptions persist in the `push-data` volume
across redeploys. Without these keys set, the push-notifications demo shows a "not configured"
message but the rest of the site is unaffected.
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml README.md
git commit -m "docs: document Web Push VAPID key setup for deployment"
```

- [ ] **Step 5: Full local verification**

Run each of these from the repo root and confirm they pass before considering the feature done:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

- [ ] **Step 6: Manual production verification (do not automate — confirm with the user before deploying)**

This step touches the live production deployment and must only be done with the user's explicit go-ahead:

1. Generate VAPID keys: `npx web-push generate-vapid-keys`.
2. Add `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` to the VPS's `.env`.
3. Build and push a new image: `docker buildx build --platform linux/amd64,linux/arm64 -t gorobetsva/pwa-showcases:latest --push .`
4. On the VPS: `docker compose pull && docker compose up -d`.
5. In a real Chrome/Edge browser, visit the deployed site's `/demo/push-notifications` page:
   - Click "Request permission & subscribe" → grant permission → confirm the notice says "Subscription created and sent to the server" and the subscription JSON appears.
   - Click "Send test push to myself" → confirm a real OS notification appears (even after closing the tab, this should still work since it goes through the service worker).
   - Click the notification → confirm it closes and focuses/opens the app tab.

---

## Self-Review

- **Spec coverage:** VAPID keys + graceful 503 (Task 2), persisted JSON store on a volume (Task 1, Task 5), self-serve send-only model (Task 2's `/send` route takes the subscription directly, Task 4's button sends its own state), `GET /api/push/public-key` + `POST /api/push/subscribe` + `POST /api/push/send` (Task 2), `push`/`notificationclick` SW handlers (Task 3), client using the real key + send button (Task 4), tests with `web-push` mocked (Task 1, Task 2), docker-compose volume + env vars + README docs (Task 5). `declarative-web-push` is untouched, as scoped. All spec sections are covered.
- **Placeholder scan:** no TBD/TODO; every step has complete, runnable code or an exact command.
- **Type consistency:** `PushStore`/`createPushStore`/`isPushConfigured` signatures in Task 1 match their usage in Task 2's `app.ts` and test imports exactly. `CreateAppOptions` fields (`pushStorePath`, `vapidPublicKey`, `vapidPrivateKey`) match between Task 2's `app.ts`, `index.ts`, and `app.test.ts`. The `{ title, body }` JSON payload shape written by `server/src/app.ts` (Task 2) matches what `app/src/sw.ts`'s `push` handler reads (Task 3).
