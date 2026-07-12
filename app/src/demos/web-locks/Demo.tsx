import { useEffect, useState } from 'react';

export default function WebLocksDemo() {
  const [holding, setHolding] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [heldLocks, setHeldLocks] = useState<
    Array<{ name: string; mode: string; clientId: string }>
  >([]);
  const [pendingLocks, setPendingLocks] = useState<
    Array<{ name: string; mode: string; clientId: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Poll navigator.locks.query() every 500ms
  useEffect(() => {
    const poll = async () => {
      try {
        const state = await navigator.locks.query();
        setHeldLocks((state.held as Array<{ name: string; mode: string; clientId: string }>) || []);
        setPendingLocks(
          (state.pending as Array<{ name: string; mode: string; clientId: string }>) || [],
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to query locks');
      }
    };

    const interval = setInterval(poll, 500);
    poll();

    return () => clearInterval(interval);
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (!holding || countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [holding, countdown]);

  const acquireLock = async () => {
    setError(null);
    try {
      await navigator.locks.request('webcandoit-demo-lock', async (_lock) => {
        setHolding(true);
        setCountdown(3);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setHolding(false);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to acquire lock';
      setError(message);
      setHolding(false);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        Open this demo in multiple browser tabs to see how the Web Locks API coordinates access
        across documents of the same origin.
      </p>

      <p>
        <button type="button" onClick={acquireLock} disabled={holding}>
          Acquire lock for 3 seconds
        </button>
      </p>

      {holding && (
        <div role="status" style={{ color: 'var(--accent)' }}>
          Lock held — releasing in {countdown}s…
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          Error: {error}
        </p>
      )}

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text)', fontSize: '0.95rem' }}>
          Lock Status
        </h3>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
          {heldLocks.length > 0 || pendingLocks.length > 0
            ? 'Held/pending locks across all tabs:'
            : 'No locks held or pending'}
        </p>

        {heldLocks.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--accent)' }}>Held:</strong>
            <ul
              style={{
                margin: '0.25rem 0 0 1.5rem',
                fontSize: '0.875rem',
                color: 'var(--text)',
              }}
            >
              {heldLocks.map((lock) => (
                <li key={`${lock.name}-${lock.mode}-${lock.clientId}`}>
                  {lock.name} ({lock.mode})
                </li>
              ))}
            </ul>
          </div>
        )}

        {pendingLocks.length > 0 && (
          <div>
            <strong style={{ color: 'var(--text-dim)' }}>Pending:</strong>
            <ul
              style={{
                margin: '0.25rem 0 0 1.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-dim)',
              }}
            >
              {pendingLocks.map((lock) => (
                <li key={`${lock.name}-${lock.mode}-${lock.clientId}`}>
                  {lock.name} ({lock.mode})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
