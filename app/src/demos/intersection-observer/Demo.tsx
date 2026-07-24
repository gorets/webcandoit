import { useEffect, useRef, useState } from 'react';

export default function IntersectionObserverDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0);
  const [intersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    const root = rootRef.current;
    if (!target || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
        setIntersecting(entry.isIntersecting);
      },
      { root, threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Scroll the box below. The observer reports how much of the target is visible inside the
        scroll container, with no scroll-event handlers.
      </p>
      <div
        role="status"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>
          Visible:{' '}
          <strong style={{ color: intersecting ? 'var(--accent)' : 'var(--danger)' }}>
            {(ratio * 100).toFixed(0)}%
          </strong>
        </span>
        <span style={{ color: 'var(--text-dim)' }}>{intersecting ? 'intersecting' : 'hidden'}</span>
      </div>
      <div
        ref={rootRef}
        style={{
          height: '220px',
          overflowY: 'scroll',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
        }}
      >
        <div style={{ height: '260px', color: 'var(--text-dim)' }}>Scroll down ↓</div>
        <div
          ref={targetRef}
          style={{
            height: '120px',
            borderRadius: 'var(--radius)',
            background: `color-mix(in srgb, var(--accent) ${Math.round(ratio * 100)}%, var(--surface))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
          }}
        >
          Target element
        </div>
        <div style={{ height: '260px', color: 'var(--text-dim)', textAlign: 'right' }}>
          ↑ Scroll up
        </div>
      </div>
    </div>
  );
}
