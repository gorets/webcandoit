import { useEffect, useState } from 'react';

// Periodic Background Sync isn't in TS's DOM lib yet — declare the minimal shape we use.
interface PeriodicSyncManager {
  register(tag: string, options?: { minInterval?: number }): Promise<void>;
  getTags(): Promise<string[]>;
}

const SW_READY_TIMEOUT_MS = 2500;
const SYNC_TAG = 'demo-periodic';
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function waitForActiveRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const timeout = new Promise<'timeout'>((resolve) => {
    setTimeout(() => resolve('timeout'), SW_READY_TIMEOUT_MS);
  });
  const result = await Promise.race([navigator.serviceWorker.ready, timeout]);
  return result === 'timeout' ? null : result;
}

export default function PeriodicBackgroundSyncDemo() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [checking, setChecking] = useState(true);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void waitForActiveRegistration().then(async (reg) => {
      if (cancelled) return;
      setRegistration(reg);
      setChecking(false);
      if (!reg) return;
      try {
        const permission = await navigator.permissions.query({
          name: 'periodic-background-sync',
        } as unknown as PermissionDescriptor);
        if (!cancelled) setPermissionState(permission.state);
      } catch {
        if (!cancelled) setPermissionState(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshTags = async (reg: ServiceWorkerRegistration) => {
    try {
      const periodicSync = (
        reg as ServiceWorkerRegistration & { periodicSync: PeriodicSyncManager }
      ).periodicSync;
      setTags(await periodicSync.getTags());
    } catch {
      setError('Could not read registered periodic sync tags.');
    }
  };

  const handleRegister = async () => {
    if (!registration) return;
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const periodicSync = (
        registration as ServiceWorkerRegistration & { periodicSync: PeriodicSyncManager }
      ).periodicSync;
      await periodicSync.register(SYNC_TAG, { minInterval: MIN_INTERVAL_MS });
      setStatus(
        `Registered periodic sync tag "${SYNC_TAG}". The browser decides exactly when it fires.`,
      );
      await refreshTags(registration);
    } catch {
      setError(
        'Registering periodic sync failed — this usually means the permission was not granted or the app is not installed.',
      );
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
        Periodic Background Sync needs the app installed as a PWA, and the browser only grants the
        permission to sites it considers engaging enough. It lets the service worker refresh content
        at an interval the browser (not the app) decides.
      </p>

      <div style={{ color: 'var(--text-dim)' }}>
        Permission state: {permissionState ?? 'unknown'}
      </div>

      <button
        type="button"
        onClick={handleRegister}
        disabled={busy || permissionState !== 'granted'}
      >
        {busy ? 'Registering…' : `Register periodic sync tag "${SYNC_TAG}"`}
      </button>

      {permissionState !== 'granted' && (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Registration is disabled until this origin has the "periodic-background-sync" permission
          granted (typically after installing the PWA).
        </div>
      )}

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
          Registered periodic sync tags
        </div>
        {tags.length === 0 ? <div>None yet.</div> : tags.map((tag) => <div key={tag}>{tag}</div>)}
      </div>
    </div>
  );
}
