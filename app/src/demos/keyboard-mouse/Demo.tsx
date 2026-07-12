import { useEffect, useRef, useState } from 'react';

interface KeyInfo {
  key: string;
  code: string;
  modifiers: string[];
}

interface MovementDelta {
  x: number;
  y: number;
}

export default function KeyboardMouseDemo() {
  const [lastKey, setLastKey] = useState<KeyInfo | null>(null);
  const [locked, setLocked] = useState(false);
  const [movement, setMovement] = useState<MovementDelta>({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers = [
        event.ctrlKey && 'Ctrl',
        event.shiftKey && 'Shift',
        event.altKey && 'Alt',
        event.metaKey && 'Meta',
      ].filter((m): m is string => Boolean(m));
      setLastKey({ key: event.key, code: event.code, modifiers });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleLockChange = () => {
      setLocked(document.pointerLockElement === boxRef.current);
      if (document.pointerLockElement !== boxRef.current) {
        setMovement({ x: 0, y: 0 });
      }
    };

    const handleLockError = () => {
      setError('Pointer lock request failed.');
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== boxRef.current) return;
      setMovement({ x: event.movementX, y: event.movementY });
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('pointerlockerror', handleLockError);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('pointerlockerror', handleLockError);
      document.removeEventListener('mousemove', handleMouseMove);
      if (document.pointerLockElement === boxRef.current) {
        document.exitPointerLock();
      }
    };
  }, []);

  async function lock() {
    setError(null);
    try {
      const el = boxRef.current;
      if (!el) return;
      await el.requestPointerLock();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not lock the pointer.');
    }
  }

  function unlock() {
    document.exitPointerLock();
  }

  return (
    <div>
      <p>
        Press any key to see it decoded below. Click the box to lock the pointer — the cursor
        disappears and mouse movement is reported as unbounded deltas instead of screen coordinates,
        which is useful for first-person camera controls. Press Escape or click "Release" to exit.
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
        <p style={{ margin: 0 }}>Last key event:</p>
        {lastKey ? (
          <p style={{ margin: '0.5rem 0 0' }}>
            key=<strong>{lastKey.key}</strong> code=<strong>{lastKey.code}</strong> modifiers=
            <strong>{lastKey.modifiers.length ? lastKey.modifiers.join('+') : 'none'}</strong>
          </p>
        ) : (
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)' }}>
            No key pressed yet — try typing.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      <button
        type="button"
        ref={boxRef}
        onClick={lock}
        style={{
          marginTop: '1rem',
          width: '100%',
          height: '10rem',
          borderRadius: 'var(--radius)',
          background: locked ? 'var(--surface-2)' : 'var(--surface)',
          border: '1px dashed var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locked ? 'none' : 'pointer',
          userSelect: 'none',
          color: 'var(--text-dim)',
        }}
      >
        {locked ? `movementX=${movement.x}, movementY=${movement.y}` : 'Click to lock pointer'}
      </button>

      <button type="button" onClick={unlock} disabled={!locked} style={{ marginTop: '0.75rem' }}>
        Release pointer lock
      </button>
    </div>
  );
}
