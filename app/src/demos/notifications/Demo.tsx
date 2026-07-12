import { useState } from 'react';

async function getReadyRegistration(timeoutMs = 1500): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
    if (registration?.active) return registration;
    return null;
  } catch {
    return null;
  }
}

function describePermission(permission: NotificationPermission): string {
  switch (permission) {
    case 'granted':
      return 'Granted — you can show notifications.';
    case 'denied':
      return 'Denied — enable notifications for this site in your browser settings to try the demo.';
    default:
      return 'Not requested yet.';
  }
}

export default function NotificationsDemo() {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    setError(null);
    setStatus(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setError('Permission was not granted, so a notification cannot be shown.');
      }
    } catch {
      setError('Could not request notification permission.');
    }
  };

  const showNotification = async () => {
    setError(null);
    setStatus(null);
    if (permission !== 'granted') {
      setError('Request permission first.');
      return;
    }
    try {
      const registration = await getReadyRegistration();
      if (registration) {
        await registration.showNotification('Hello from WebCanDoIt', {
          body: 'This notification was shown through the active service worker.',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        });
        setStatus('Notification shown via the service worker.');
      } else {
        new Notification('Hello from WebCanDoIt', {
          body: 'Shown directly — no active service worker in this session (this is normal in dev; the SW only registers in the production build).',
          icon: '/icons/icon-192.png',
        });
        setStatus('Notification shown directly (no active service worker found).');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not show the notification.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Requests permission to show notifications, then shows one via{' '}
        <code>registration.showNotification()</code> when a service worker is active, falling back
        to <code>new Notification()</code> otherwise.
      </p>
      <div
        role="status"
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
      >
        Permission: <strong>{permission}</strong> — {describePermission(permission)}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={requestPermission} disabled={permission === 'granted'}>
          Request permission
        </button>
        <button type="button" onClick={showNotification} disabled={permission !== 'granted'}>
          Show notification
        </button>
      </div>
      {status && (
        <p role="status" style={{ color: 'var(--accent)' }}>
          {status}
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
