import { useEffect, useRef, useState } from 'react';

export default function ResizeObserverDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Drag the bottom-right corner of the box to resize it. The observer reports its content-box
        size on every change.
      </p>
      <div
        ref={boxRef}
        style={{
          resize: 'both',
          overflow: 'auto',
          minWidth: '120px',
          minHeight: '80px',
          width: '240px',
          height: '140px',
          maxWidth: '100%',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
        }}
      >
        <span role="status">
          {size.width} × {size.height}
        </span>
      </div>
    </div>
  );
}
