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

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') return 'Permission to show notifications was denied.';
    return `${err.name}: ${err.message}`;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}

export default function IncomingCallDemo() {
  const [swState, setSwState] = useState<SwState>('checking');
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
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

  const handleSimulateCall = async () => {
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
      await registration.showNotification('Incoming call', {
        body: 'Alice is calling…',
        requireInteraction: true,
        tag: 'call',
        renotify: true,
        actions: [
          { action: 'accept', title: 'Accept' },
          { action: 'decline', title: 'Decline' },
        ],
      } as NotificationOptions);
      setNotice(
        'Call notification shown. It will stay visible until dismissed (requireInteraction). ' +
          "Note: this app's service worker doesn't yet have a notificationclick handler for " +
          'the Accept/Decline actions (that arrives with the signaling backend), so clicking ' +
          'them currently just closes the notification.',
      );
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        Simulates the notification UX for an incoming call: a persistent, re-alerting notification
        with Accept and Decline action buttons. A real cross-device incoming call additionally needs
        a push server to wake up the callee's device and a WebSocket (or similar) signaling channel
        to negotiate the call — both are a later phase. This demo focuses purely on the notification
        presentation, shown locally right now.
      </p>
      <p role="status" style={{ color: 'var(--text-dim)' }}>
        Service worker: {swState === 'checking' && 'checking…'}
        {swState === 'active' && 'active'}
        {swState === 'unavailable' &&
          'no active registration found (only registers in production builds).'}
      </p>
      <div>
        <button type="button" onClick={handleSimulateCall} disabled={busy}>
          Simulate incoming call
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
    </div>
  );
}
