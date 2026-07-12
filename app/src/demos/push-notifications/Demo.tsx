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
