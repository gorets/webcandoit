import { useCallback, useEffect, useRef, useState } from 'react';

export default function MediaCaptureDemo() {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Camera permission was denied. Allow camera access and try again.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No camera was found on this device.');
      } else {
        setError('Could not start the camera. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={start} disabled={active}>
          Start camera
        </button>
        <button type="button" onClick={stopStream} disabled={!active}>
          Stop camera
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
          {active ? 'Camera is live.' : 'Camera is stopped.'}
        </div>
      )}
    </div>
  );
}
