import { useEffect, useState } from 'react';

// `ScreenOrientation.lock()` is not part of TypeScript's bundled DOM lib
// (it was dropped from the standards track for most browsers), so we
// describe the minimal shape we need locally and cast at the call site.
type LockableScreenOrientation = ScreenOrientation & {
  lock(orientation: string): Promise<void>;
};

export default function ScreenOrientationDemo() {
  const [orientationType, setOrientationType] = useState(screen.orientation.type);
  const [angle, setAngle] = useState(screen.orientation.angle);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    function handleChange() {
      setOrientationType(screen.orientation.type);
      setAngle(screen.orientation.angle);
    }

    screen.orientation.addEventListener('change', handleChange);
    return () => {
      screen.orientation.removeEventListener('change', handleChange);
    };
  }, []);

  async function lockPortrait() {
    setError(null);
    try {
      await (screen.orientation as LockableScreenOrientation).lock('portrait');
      setLocked(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} (orientation lock usually requires fullscreen mode, and is restricted on many platforms).`
          : 'Failed to lock orientation.',
      );
    }
  }

  function unlock() {
    try {
      screen.orientation.unlock();
      setLocked(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock orientation.');
    }
  }

  return (
    <div>
      <p>Rotate your device, or resize the window, to see the orientation update live.</p>
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
          Type: <strong>{orientationType}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Angle: <strong>{angle}°</strong>
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="button" onClick={lockPortrait} disabled={locked}>
          Lock to portrait
        </button>
        <button type="button" onClick={unlock} disabled={!locked}>
          Unlock
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
