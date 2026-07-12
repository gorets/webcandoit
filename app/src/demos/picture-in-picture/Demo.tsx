import { useCallback, useEffect, useRef, useState } from 'react';

// Draws a small bouncing-dot animation so we have a genuinely "playing" video
// to pop out — no network request or bundled media file required.
function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
  ctx.fillStyle = '#101018';
  ctx.fillRect(0, 0, width, height);
  const x = (Math.sin(t / 700) * 0.5 + 0.5) * (width - 24) + 12;
  const y = (Math.cos(t / 900) * 0.5 + 0.5) * (height - 24) + 12;
  ctx.fillStyle = '#6ee7ff';
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e6e6f0';
  ctx.font = '12px sans-serif';
  ctx.fillText('PiP source', 8, 16);
}

export default function PictureInPictureDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const [pipActive, setPipActive] = useState(false);
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
    video.play().catch(() => {
      // Autoplay can be blocked in some contexts; the user can still press
      // play manually, and PiP only needs a video element with a stream.
    });

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
    if (!video) return;

    const handleEnter = () => setPipActive(true);
    const handleLeave = () => setPipActive(false);
    video.addEventListener('enterpictureinpicture', handleEnter);
    video.addEventListener('leavepictureinpicture', handleLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnter);
      video.removeEventListener('leavepictureinpicture', handleLeave);
    };
  }, []);

  useEffect(
    () => () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
    },
    [],
  );

  const enterPip = useCallback(async () => {
    setError(null);
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.requestPictureInPicture();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Picture-in-Picture was blocked. Try interacting with the page first.');
      } else if (err instanceof DOMException && err.name === 'InvalidStateError') {
        setError('The video is not ready for Picture-in-Picture yet.');
      } else {
        setError('Could not enter Picture-in-Picture.');
      }
    }
  }, []);

  const exitPip = useCallback(async () => {
    setError(null);
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch {
      setError('Could not exit Picture-in-Picture.');
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <canvas ref={canvasRef} width={160} height={90} style={{ display: 'none' }} />
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
        <button type="button" onClick={enterPip} disabled={pipActive}>
          Enter Picture-in-Picture
        </button>
        <button type="button" onClick={exitPip} disabled={!pipActive}>
          Exit Picture-in-Picture
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {pipActive
            ? 'Video is floating in a Picture-in-Picture window.'
            : 'Picture-in-Picture is inactive.'}
        </div>
      )}
    </div>
  );
}
