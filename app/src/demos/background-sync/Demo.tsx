import { useEffect, useState } from 'react';

// The Background Sync manager isn't in TS's DOM lib yet — declare the minimal shape we use.
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

const SW_READY_TIMEOUT_MS = 2500;
const SYNC_TAG = 'demo-sync';

async function waitForActiveRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const timeout = new Promise<'timeout'>((resolve) => {
    setTimeout(() => resolve('timeout'), SW_READY_TIMEOUT_MS);
  });
  const result = await Promise.race([navigator.serviceWorker.ready, timeout]);
  return result === 'timeout' ? null : result;
}

export default function BackgroundSyncDemo() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [checking, setChecking] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void waitForActiveRegistration().then((reg) => {
      if (cancelled) return;
      setRegistration(reg);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshTags = async (reg: ServiceWorkerRegistration) => {
    try {
      const sync = (reg as ServiceWorkerRegistration & { sync: SyncManager }).sync;
      const currentTags = await sync.getTags();
      setTags(currentTags);
    } catch {
      setError('Could not read registered sync tags.');
    }
  };

  const handleRegister = async () => {
    if (!registration) return;
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const sync = (registration as ServiceWorkerRegistration & { sync: SyncManager }).sync;
      await sync.register(SYNC_TAG);
      setStatus(
        `Registered sync tag "${SYNC_TAG}". It will fire in the service worker once the browser regains connectivity.`,
      );
      await refreshTags(registration);
    } catch {
      setError('Registering the sync tag failed in this browser.');
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return <div style={{ color: 'var(--text-dim)' }}>Checking for an active service worker…</div>;
  }

  if (!registration) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        Service worker isn't active here (it registers in the production build) — this API needs an
        active service worker.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Registering a sync tag asks the browser to run the service worker's <code>sync</code> event
        the next time the device has connectivity — useful for retrying a failed request after
        coming back online.
      </p>

      <button type="button" onClick={handleRegister} disabled={busy}>
        {busy ? 'Registering…' : `Register sync tag "${SYNC_TAG}"`}
      </button>

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {status && (
        <div role="status" style={{ color: 'var(--accent)' }}>
          {status}
        </div>
      )}

      <div
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
        }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
          Registered sync tags
        </div>
        {tags.length === 0 ? <div>None yet.</div> : tags.map((tag) => <div key={tag}>{tag}</div>)}
      </div>
    </div>
  );
}
