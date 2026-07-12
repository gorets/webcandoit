import { useEffect, useState } from 'react';

// The VirtualKeyboard API is not part of TypeScript's bundled DOM lib, so we
// describe the minimal shape we need locally and cast at the call site.
interface BoundingRectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VirtualKeyboardLike extends EventTarget {
  overlaysContent: boolean;
  readonly boundingRect: BoundingRectLike;
  show(): void;
  hide(): void;
}

function getVirtualKeyboard(): VirtualKeyboardLike {
  return (navigator as Navigator & { virtualKeyboard: VirtualKeyboardLike }).virtualKeyboard;
}

export default function VirtualKeyboardDemo() {
  const [rect, setRect] = useState<BoundingRectLike | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const keyboard = getVirtualKeyboard();

    try {
      keyboard.overlaysContent = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enable content overlay.');
    }

    const update = () => {
      setRect(keyboard.boundingRect);
    };

    update();
    keyboard.addEventListener('geometrychange', update);

    return () => {
      keyboard.removeEventListener('geometrychange', update);
    };
  }, []);

  function show() {
    try {
      getVirtualKeyboard().show();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not show the keyboard.');
    }
  }

  function hide() {
    try {
      getVirtualKeyboard().hide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not hide the keyboard.');
    }
  }

  const isOpen = rect !== null && rect.height > 0;

  return (
    <div>
      <p>
        On a touch device, focus the field below to raise the on-screen keyboard. With{' '}
        <code>overlaysContent</code> enabled, the keyboard overlays the page instead of resizing the
        viewport, and its geometry is reported here.
      </p>
      <label htmlFor="vk-input" style={{ display: 'block', marginTop: '1rem' }}>
        Tap to focus (opens the keyboard on touch devices)
      </label>
      <input
        id="vk-input"
        type="text"
        placeholder="Tap here…"
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--surface-2)',
          background: 'var(--surface)',
          color: 'var(--text)',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="button" onClick={show}>
          Show keyboard
        </button>
        <button type="button" onClick={hide}>
          Hide keyboard
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
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
          Keyboard state: <strong>{isOpen ? 'open' : 'closed'}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>Bounding rect:</p>
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
