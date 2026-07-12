import { useEffect, useRef, useState } from 'react';

export default function FullscreenDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement === boxRef.current);
    }

    document.addEventListener('fullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  async function enterFullscreen() {
    setError(null);
    try {
      await boxRef.current?.requestFullscreen();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enter fullscreen.');
    }
  }

  async function exitFullscreen() {
    setError(null);
    try {
      await document.exitFullscreen();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exit fullscreen.');
    }
  }

  return (
    <div>
      <p>Make the box below take up the full screen, then exit again.</p>
      <div
        ref={boxRef}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          minHeight: '200px',
        }}
      >
        <p role="status" style={{ margin: 0 }}>
          Fullscreen: <strong>{isFullscreen ? 'Yes' : 'No'}</strong>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={enterFullscreen} disabled={isFullscreen}>
            Enter fullscreen
          </button>
          <button type="button" onClick={exitFullscreen} disabled={!isFullscreen}>
            Exit fullscreen
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
