import { useEffect, useRef, useState } from 'react';

interface StatusEvent {
  id: number;
  status: 'online' | 'offline';
  time: string;
}

export default function OnlineStatusDemo() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [history, setHistory] = useState<StatusEvent[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      const id = nextIdRef.current++;
      setHistory((prev) =>
        [{ id, status: 'online' as const, time: new Date().toLocaleTimeString() }, ...prev].slice(
          0,
          20,
        ),
      );
    }
    function handleOffline() {
      setIsOnline(false);
      const id = nextIdRef.current++;
      setHistory((prev) =>
        [{ id, status: 'offline' as const, time: new Date().toLocaleTimeString() }, ...prev].slice(
          0,
          20,
        ),
      );
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div>
      <p>
        Toggle your device's network connection (for example via devtools network throttling or
        airplane mode) to see the status update live.
      </p>
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
          Status:{' '}
          <strong style={{ color: isOnline ? 'var(--accent)' : 'var(--danger)' }}>
            {isOnline ? 'Online' : 'Offline'}
          </strong>
        </p>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Event history</h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No online/offline events observed yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {history.map((entry) => (
              <li
                key={entry.id}
                style={{
                  padding: '0.4rem 0.6rem',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius)',
                  marginBottom: '0.3rem',
                }}
              >
                <strong>{entry.status}</strong> — {entry.time}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
