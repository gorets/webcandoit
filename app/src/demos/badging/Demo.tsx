import { useState } from 'react';

export default function BadgingDemo() {
  const [count, setCount] = useState(3);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setBadge = async () => {
    setError(null);
    setStatus(null);
    try {
      await navigator.setAppBadge(count);
      setStatus(
        `Badge set to ${count}. This shows on the app icon once installed to a home screen or dock.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set the app badge.');
    }
  };

  const clearBadge = async () => {
    setError(null);
    setStatus(null);
    try {
      await navigator.clearAppBadge();
      setStatus('Badge cleared.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not clear the app badge.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        The Badging API lets an installed PWA show a small numeric (or dot) badge on its app icon,
        similar to unread-count badges on native apps. It has no visible effect unless this app is
        installed — most browsers ignore it (or show nothing observable) on a plain browser tab.
      </p>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Badge value
        <input
          type="number"
          min={0}
          max={9999}
          value={count}
          onChange={(e) => setCount(Math.max(0, Number(e.target.value) || 0))}
          style={{
            width: '5rem',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.4rem 0.6rem',
          }}
        />
      </label>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={setBadge}>
          Set app badge
        </button>
        <button type="button" onClick={clearBadge}>
          Clear app badge
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
