import { useCallback, useRef, useState } from 'react';

interface ActivePointer {
  x: number;
  y: number;
  color: string;
}

const PALETTE = ['#ff6b6b', '#4dabf7', '#69db7c', '#ffd43b', '#da77f2', '#ff922b', '#38d9a9'];

function colorForPointer(pointerId: number): string {
  return PALETTE[Math.abs(pointerId) % PALETTE.length];
}

export default function MultiTouchDemo() {
  const [pointers, setPointers] = useState<Map<number, ActivePointer>>(new Map());
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    setPointers((prev) => {
      const next = new Map(prev);
      next.set(event.pointerId, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        color: colorForPointer(event.pointerId),
      });
      return next;
    });
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    setPointers((prev) => {
      if (!prev.has(event.pointerId)) return prev;
      const rect = event.currentTarget.getBoundingClientRect();
      const next = new Map(prev);
      const existing = next.get(event.pointerId);
      if (existing) {
        next.set(event.pointerId, {
          ...existing,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
      return next;
    });
  }, []);

  const handlePointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    setPointers((prev) => {
      if (!prev.has(event.pointerId)) return prev;
      const next = new Map(prev);
      next.delete(event.pointerId);
      return next;
    });
  }, []);

  return (
    <div>
      <p>
        Touch the surface below with multiple fingers (or use several mice/pens) to see each contact
        tracked independently via Pointer Events. Each dot is labelled with its{' '}
        <code>pointerId</code>.
      </p>
      <div
        ref={surfaceRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{
          position: 'relative',
          marginTop: '1rem',
          height: '16rem',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
          border: '1px dashed var(--surface-2)',
          touchAction: 'none',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        {pointers.size === 0 && (
          <p
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--text-dim)',
              margin: 0,
            }}
          >
            Touch here
          </p>
        )}
        {[...pointers.entries()].map(([id, pointer]) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: pointer.x,
              top: pointer.y,
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: pointer.color,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111',
              fontWeight: 700,
              fontSize: '0.85rem',
              pointerEvents: 'none',
            }}
          >
            {id}
          </div>
        ))}
      </div>
      <p role="status" style={{ marginTop: '0.75rem', color: 'var(--text-dim)' }}>
        Active pointers: <strong>{pointers.size}</strong>
      </p>
    </div>
  );
}
