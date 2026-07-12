import { useEffect, useState } from 'react';

interface ViewportSnapshot {
  width: number;
  height: number;
  scale: number;
  offsetLeft: number;
  offsetTop: number;
}

export default function ViewportDemo() {
  const [snapshot, setSnapshot] = useState<ViewportSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      setError('The Visual Viewport API is not available in this browser.');
      return;
    }

    const update = () => {
      setSnapshot({
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale,
        offsetLeft: viewport.offsetLeft,
        offsetTop: viewport.offsetTop,
      });
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);

  if (error) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <p>
        The visual viewport is the portion of the page currently visible on screen — it shrinks when
        the on-screen keyboard appears and its scale changes when the user pinch-zooms. Try zooming
        or focusing a text field on a touch device to see the values below change live.
      </p>
      {snapshot ? (
        <div
          role="status"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Width</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{snapshot.width.toFixed(1)}</div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Height</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{snapshot.height.toFixed(1)}</div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Scale</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{snapshot.scale.toFixed(2)}×</div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Offset (left, top)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {snapshot.offsetLeft.toFixed(1)}, {snapshot.offsetTop.toFixed(1)}
            </div>
          </div>
        </div>
      ) : (
        <p role="status" style={{ color: 'var(--text-dim)', marginTop: '1rem' }}>
          Reading viewport…
        </p>
      )}
    </div>
  );
}
