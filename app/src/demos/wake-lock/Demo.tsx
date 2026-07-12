import { useEffect, useRef, useState } from 'react';

export default function WakeLockDemo() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    return () => {
      sentinelRef.current?.release().catch(() => {});
    };
  }, []);

  async function requestWakeLock() {
    setError(null);
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);
      sentinel.addEventListener('release', () => {
        setIsActive(false);
        sentinelRef.current = null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acquire wake lock.');
    }
  }

  async function releaseWakeLock() {
    setError(null);
    try {
      await sentinelRef.current?.release();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release wake lock.');
    }
  }

  return (
    <div>
      <p>
        Request a screen wake lock to keep the display on. Note that the lock is released
        automatically if the tab loses visibility.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="button" onClick={requestWakeLock} disabled={isActive}>
          Acquire wake lock
        </button>
        <button type="button" onClick={releaseWakeLock} disabled={!isActive}>
          Release
        </button>
      </div>
      <div
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          marginTop: '1rem',
        }}
      >
        <p style={{ margin: 0 }}>
          Wake lock:{' '}
          <strong style={{ color: isActive ? 'var(--accent)' : 'var(--text-dim)' }}>
            {isActive ? 'Active' : 'Inactive'}
          </strong>
        </p>
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
