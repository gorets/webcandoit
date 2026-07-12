import { useCallback, useEffect, useRef, useState } from 'react';

type VideoWithWebkitAirPlay = HTMLVideoElement & {
  webkitShowPlaybackTargetPicker?: () => void;
};

function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
  ctx.fillStyle = '#101018';
  ctx.fillRect(0, 0, width, height);
  const barCount = 8;
  for (let i = 0; i < barCount; i++) {
    const h = (Math.sin(t / 300 + i) * 0.5 + 0.5) * (height - 20) + 8;
    ctx.fillStyle = '#6ee7ff';
    ctx.fillRect(i * (width / barCount) + 4, height - h, width / barCount - 8, h);
  }
  ctx.fillStyle = '#e6e6f0';
  ctx.font = '12px sans-serif';
  ctx.fillText('Cast source', 8, 16);
}

export default function AirPlayDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (t: number) => {
      drawFrame(ctx, canvas.width, canvas.height, t);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    const stream = canvas.captureStream(30);
    streamRef.current = stream;
    video.srcObject = stream;
    video.play().catch(() => {});

    return () => {
      cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      video.srcObject = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video?.remote) return;

    let watchId: number | undefined;
    let cancelled = false;

    video.remote
      .watchAvailability((isAvailable) => {
        if (!cancelled) setAvailable(isAvailable);
      })
      .then((id) => {
        watchId = id;
      })
      .catch(() => {
        // Not all browsers implement watchAvailability; leave availability unknown.
      });

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    video.remote.addEventListener('connect', handleConnect);
    video.remote.addEventListener('disconnect', handleDisconnect);

    return () => {
      cancelled = true;
      video.remote.removeEventListener('connect', handleConnect);
      video.remote.removeEventListener('disconnect', handleDisconnect);
      if (watchId !== undefined) {
        video.remote.cancelWatchAvailability(watchId).catch(() => {});
      }
    };
  }, []);

  const handleCast = useCallback(async () => {
    setError(null);
    const video = videoRef.current;
    if (!video) return;
    const withWebkit = video as VideoWithWebkitAirPlay;
    try {
      if (typeof withWebkit.webkitShowPlaybackTargetPicker === 'function') {
        withWebkit.webkitShowPlaybackTargetPicker();
      } else if (video.remote) {
        await video.remote.prompt();
      } else {
        setError('No remote playback picker is available in this browser.');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No AirPlay or casting devices were found.');
      } else if (err instanceof DOMException && err.name === 'InvalidStateError') {
        setError('A remote playback session could not be started right now.');
      } else {
        setError('Could not open the casting device picker.');
      }
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        style={{
          width: '100%',
          maxWidth: '320px',
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={handleCast}>
          Cast to a device
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {connected
            ? 'Connected to a remote playback device.'
            : available === null
              ? 'Device availability unknown — press the button to open the picker.'
              : available
                ? 'A remote playback device is available.'
                : 'No remote playback device detected nearby.'}
        </div>
      )}
    </div>
  );
}
