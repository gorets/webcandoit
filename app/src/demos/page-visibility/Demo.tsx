import { useEffect, useState } from 'react';

export default function PageVisibilityDemo() {
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(
    document.visibilityState,
  );
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    function handleVisibilityChange() {
      setVisibilityState(document.visibilityState);
      if (document.visibilityState === 'hidden') {
        setHiddenCount((count) => count + 1);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div>
      <p>
        Switch to another tab or window, then come back. The page tracks its own visibility state
        and counts how many times it has been hidden.
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
          Current state:{' '}
          <strong
            style={{ color: visibilityState === 'visible' ? 'var(--accent)' : 'var(--danger)' }}
          >
            {visibilityState}
          </strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Times hidden: <strong>{hiddenCount}</strong>
        </p>
      </div>
    </div>
  );
}
