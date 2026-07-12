import { useCallback, useEffect, useRef, useState } from 'react';

export default function ScreenCaptureDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // The browser's own "Stop sharing" UI ends the track without going through our button.
      for (const track of stream.getVideoTracks()) {
        track.addEventListener('ended', stopStream);
      }
      setActive(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Screen sharing permission was denied.');
      } else {
        setError('Could not start screen capture. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={start} disabled={active}>
          Start screen share
        </button>
        <button type="button" onClick={stopStream} disabled={!active}>
          Stop screen share
        </button>
      </div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
        }}
      />
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {active ? 'Screen capture is live.' : 'Screen capture is stopped.'}
        </div>
      )}
    </div>
  );
}
