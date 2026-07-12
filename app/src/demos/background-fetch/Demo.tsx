import { useEffect, useState } from 'react';

// Background Fetch isn't in TS's DOM lib yet — declare the minimal shape we use.
interface BackgroundFetchRegistration {
  readonly id: string;
  readonly result: '' | 'success' | 'failure';
  readonly failureReason: string;
  readonly recordsAvailable: boolean;
}

interface BackgroundFetchOptions {
  title?: string;
  downloadTotal?: number;
}

interface BackgroundFetchManager {
  fetch(
    id: string,
    requests: string[],
    options?: BackgroundFetchOptions,
  ): Promise<BackgroundFetchRegistration>;
  getIds(): Promise<string[]>;
}

const SW_READY_TIMEOUT_MS = 2500;
const FETCH_ID = 'demo-fetch';

async function waitForActiveRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  const timeout = new Promise<'timeout'>((resolve) => {
    setTimeout(() => resolve('timeout'), SW_READY_TIMEOUT_MS);
  });
  const result = await Promise.race([navigator.serviceWorker.ready, timeout]);
  return result === 'timeout' ? null : result;
}

export default function BackgroundFetchDemo() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [checking, setChecking] = useState(true);
  const [ids, setIds] = useState<string[]>([]);
  const [current, setCurrent] = useState<BackgroundFetchRegistration | null>(null);
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

  const refreshIds = async (reg: ServiceWorkerRegistration) => {
    try {
      const backgroundFetch = (
        reg as ServiceWorkerRegistration & { backgroundFetch: BackgroundFetchManager }
      ).backgroundFetch;
      setIds(await backgroundFetch.getIds());
    } catch {
      setError('Could not list background fetch ids.');
    }
  };

  const handleStart = async () => {
    if (!registration) return;
    setError(null);
    setBusy(true);
    try {
      const backgroundFetch = (
        registration as ServiceWorkerRegistration & { backgroundFetch: BackgroundFetchManager }
      ).backgroundFetch;
      const reg = await backgroundFetch.fetch(FETCH_ID, ['/manifest.webmanifest'], {
        title: 'Demo download',
        downloadTotal: 1000,
      });
      setCurrent(reg);
      await refreshIds(registration);
    } catch {
      setError('Starting the background fetch failed in this browser.');
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
        Background Fetch delegates a download to the browser, which manages it (with progress UI)
        even if this tab is closed, then hands the result to the service worker.
      </p>

      <button type="button" onClick={handleStart} disabled={busy}>
        {busy ? 'Starting…' : `Start background fetch "${FETCH_ID}"`}
      </button>

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {current && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div>id: {current.id}</div>
          <div>state: {current.result || 'pending'}</div>
          {current.failureReason && <div>failure reason: {current.failureReason}</div>}
          <div>records available: {String(current.recordsAvailable)}</div>
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
          Active background fetch ids
        </div>
        {ids.length === 0 ? <div>None yet.</div> : ids.map((id) => <div key={id}>{id}</div>)}
      </div>
    </div>
  );
}
