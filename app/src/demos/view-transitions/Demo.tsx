import { useState } from 'react';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

export default function ViewTransitionsDemo() {
  const [order, setOrder] = useState(COLORS);
  const [error, setError] = useState<string | null>(null);

  function shuffle() {
    setError(null);
    const next = [...order];
    // Simple, visible rearrangement: move the first box to the end.
    const [first, ...rest] = next;
    const shuffled = [...rest, first];

    try {
      document.startViewTransition(() => {
        setOrder(shuffled);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'View transition failed, applying instantly.');
      setOrder(shuffled);
    }
  }

  return (
    <div>
      <p>
        Click the button to reorder the boxes. The change is wrapped in{' '}
        <code>document.startViewTransition()</code> so the browser animates the swap smoothly
        instead of the boxes jumping instantly.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        {order.map((color) => (
          <div
            key={color}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius)',
              background: color,
              viewTransitionName: `box-${color}`,
            }}
          />
        ))}
      </div>
      <button type="button" onClick={shuffle} style={{ marginTop: '1rem' }}>
        Reorder boxes
      </button>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
