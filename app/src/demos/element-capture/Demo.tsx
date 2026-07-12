import { useCallback, useEffect, useRef, useState } from 'react';

interface RestrictionTarget {
  readonly __brand?: 'RestrictionTarget';
}

declare const RestrictionTarget: {
  fromElement(element: Element): Promise<RestrictionTarget>;
};

// Augments the standard MediaStreamTrack interface with the Element Capture method.
declare global {
  interface MediaStreamTrack {
    restrictTo?(target: RestrictionTarget): Promise<void>;
  }
}

export default function ElementCaptureDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
    setRestricted(false);
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const start = async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Screen sharing permission was denied.');
      } else {
        setError('Could not start screen capture. Please try again.');
      }
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    for (const track of stream.getVideoTracks()) {
      track.addEventListener('ended', stopStream);
    }
    setActive(true);

    const [videoTrack] = stream.getVideoTracks();
    const restrictTo = videoTrack?.restrictTo;
    if (
      !videoTrack ||
      typeof restrictTo !== 'function' ||
      typeof RestrictionTarget.fromElement !== 'function' ||
      !targetRef.current
    ) {
      setError(
        'Element Capture (RestrictionTarget / restrictTo) is not available on this stream or browser, even though the API is present.',
      );
      return;
    }

    try {
      const target = await RestrictionTarget.fromElement(targetRef.current);
      await restrictTo.call(videoTrack, target);
      setRestricted(true);
    } catch {
      setError('Failed to restrict the capture to the target element.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Click start, then in the browser's share picker choose <strong>This Tab</strong> so the
        restriction below is visible in the preview.
      </p>
      <div
        ref={targetRef}
        style={{
          padding: '1rem',
          borderRadius: 'var(--radius)',
          background: 'var(--accent)',
          color: '#06281f',
          fontWeight: 600,
        }}
      >
        Capture target element — live tick: {tick}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={start} disabled={active}>
          Start capture &amp; restrict
        </button>
        <button type="button" onClick={stopStream} disabled={!active}>
          Stop capture
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
          {active
            ? restricted
              ? 'Capture is restricted to the target element above.'
              : 'Capture is live, but not yet restricted.'
            : 'Capture is stopped.'}
        </div>
      )}
    </div>
  );
}
