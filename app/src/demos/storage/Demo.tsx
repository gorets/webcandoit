import { useEffect, useState } from 'react';

interface Estimate {
  usage: number;
  quota: number;
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.01) return `${bytes} B`;
  return `${mb.toFixed(2)} MB`;
}

export default function StorageDemo() {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [est, isPersisted] = await Promise.all([
          navigator.storage.estimate(),
          navigator.storage.persisted(),
        ]);
        if (cancelled) return;
        setEstimate({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
        setPersisted(isPersisted);
      } catch {
        if (!cancelled) setError('Could not read storage estimate in this browser.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRequestPersist = async () => {
    setRequestError(null);
    setRequesting(true);
    try {
      const granted = await navigator.storage.persist();
      setPersisted(granted);
      if (!granted) {
        setRequestError('The browser declined to grant persistent storage right now.');
      }
    } catch {
      setRequestError('Requesting persistent storage failed in this browser.');
    } finally {
      setRequesting(false);
    }
  };

  const percentUsed =
    estimate && estimate.quota > 0 ? Math.min(100, (estimate.usage / estimate.quota) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {estimate && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div>
            Usage: {formatBytes(estimate.usage)} / {formatBytes(estimate.quota)}
          </div>
          <div
            style={{
              height: '0.5rem',
              borderRadius: 'var(--radius)',
              background: 'var(--surface-2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentUsed}%`,
                background: 'var(--accent)',
              }}
            />
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            {percentUsed.toFixed(2)}% of quota used
          </div>
        </div>
      )}

      <div style={{ color: 'var(--text-dim)' }}>
        Persistent storage: {persisted === null ? 'unknown' : persisted ? 'granted' : 'not granted'}
      </div>

      <button
        type="button"
        onClick={handleRequestPersist}
        disabled={requesting || persisted === true}
      >
        {requesting
          ? 'Requesting…'
          : persisted
            ? 'Already persistent'
            : 'Request persistent storage'}
      </button>

      {requestError && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {requestError}
        </div>
      )}
    </div>
  );
}
