import { useEffect, useState } from 'react';

// The Window Controls Overlay API is not part of TypeScript's bundled DOM
// lib, so we describe the minimal shape we need locally and cast at the call site.
interface TitlebarAreaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowControlsOverlayLike extends EventTarget {
  readonly visible: boolean;
  getTitlebarAreaRect(): TitlebarAreaRect;
}

function getWindowControlsOverlay(): WindowControlsOverlayLike {
  return (navigator as Navigator & { windowControlsOverlay: WindowControlsOverlayLike })
    .windowControlsOverlay;
}

export default function WindowControlsOverlayDemo() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [rect, setRect] = useState<TitlebarAreaRect | null>(null);

  useEffect(() => {
    const overlay = getWindowControlsOverlay();

    const update = () => {
      setVisible(overlay.visible);
      setRect(overlay.getTitlebarAreaRect());
    };

    update();
    overlay.addEventListener('geometrychange', update);

    return () => {
      overlay.removeEventListener('geometrychange', update);
    };
  }, []);

  return (
    <div>
      <p>
        The Window Controls Overlay API only reports a meaningful, visible titlebar area when this
        page is installed as a PWA and launched in its own window with{' '}
        <code>"display_override": ["window-controls-overlay"]</code> in the manifest. Viewed in a
        regular browser tab, <code>visible</code> will be <code>false</code> and the rect will be
        empty.
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
          Overlay visible: <strong>{visible === null ? 'unknown' : String(visible)}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>Titlebar area rect:</p>
        {rect ? (
          <pre
            style={{
              margin: '0.5rem 0 0',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(rect, null, 2)}
          </pre>
        ) : (
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)' }}>Not available yet.</p>
        )}
      </div>
    </div>
  );
}
