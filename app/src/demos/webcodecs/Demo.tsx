import { useCallback, useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 30;
const FRAME_RATE = 30;
const WIDTH = 160;
const HEIGHT = 120;

interface EncodeStats {
  chunkCount: number;
  totalBytes: number;
  lastChunkType: string | null;
}

type Status = 'idle' | 'encoding' | 'done' | 'error';

export default function WebCodecsDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const encoderRef = useRef<VideoEncoder | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EncodeStats>({
    chunkCount: 0,
    totalBytes: 0,
    lastChunkType: null,
  });

  const closeEncoder = useCallback(() => {
    const encoder = encoderRef.current;
    if (encoder && encoder.state !== 'closed') {
      try {
        encoder.close();
      } catch {
        // ignore close errors during cleanup
      }
    }
    encoderRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      closeEncoder();
    };
  }, [closeEncoder]);

  const drawFrame = (ctx: CanvasRenderingContext2D, frameIndex: number) => {
    ctx.fillStyle = '#101826';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const angle = (frameIndex / FRAME_COUNT) * Math.PI * 2;
    const x = WIDTH / 2 + Math.cos(angle) * (WIDTH / 3);
    const y = HEIGHT / 2 + Math.sin(angle) * (HEIGHT / 3);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  const start = async () => {
    setError(null);
    setStats({ chunkCount: 0, totalBytes: 0, lastChunkType: null });
    setStatus('encoding');

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      setError('Canvas is not available.');
      setStatus('error');
      return;
    }

    try {
      const encoder = new VideoEncoder({
        output: (chunk) => {
          setStats((prev) => ({
            chunkCount: prev.chunkCount + 1,
            totalBytes: prev.totalBytes + chunk.byteLength,
            lastChunkType: chunk.type,
          }));
        },
        error: (err) => {
          setError(err.message || 'Video encoding failed.');
          setStatus('error');
        },
      });
      encoderRef.current = encoder;

      encoder.configure({
        codec: 'vp8',
        width: WIDTH,
        height: HEIGHT,
        bitrate: 500_000,
        framerate: FRAME_RATE,
      });

      let frameIndex = 0;
      const encodeNextFrame = () => {
        if (frameIndex >= FRAME_COUNT) {
          encoder
            .flush()
            .then(() => {
              closeEncoder();
              setStatus('done');
            })
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Failed to flush encoder.');
              setStatus('error');
            });
          return;
        }

        drawFrame(ctx, frameIndex);
        const frame = new VideoFrame(canvas, {
          timestamp: Math.round((frameIndex * 1_000_000) / FRAME_RATE),
        });
        try {
          encoder.encode(frame, { keyFrame: frameIndex === 0 });
        } finally {
          frame.close();
        }

        frameIndex += 1;
        rafRef.current = requestAnimationFrame(encodeNextFrame);
      };

      rafRef.current = requestAnimationFrame(encodeNextFrame);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotSupportedError') {
        setError('This browser cannot encode the requested codec (vp8).');
      } else {
        setError(err instanceof Error ? err.message : 'Could not start video encoding.');
      }
      setStatus('error');
      closeEncoder();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>
        Draws a short canvas animation and feeds each frame into a <code>VideoEncoder</code> as a{' '}
        <code>VideoFrame</code>, reporting the encoded chunks produced.
      </p>
      <div>
        <button type="button" onClick={start} disabled={status === 'encoding'}>
          {status === 'encoding' ? 'Encoding…' : 'Encode animation'}
        </button>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          width: '100%',
          maxWidth: `${WIDTH * 2}px`,
          borderRadius: 'var(--radius)',
          background: 'var(--surface)',
        }}
      />
      <div
        role="status"
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
        }}
      >
        <p style={{ margin: 0 }}>
          Encoded chunks: <strong>{stats.chunkCount}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Total bytes: <strong>{stats.totalBytes.toLocaleString()}</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}>
          Last chunk type: <strong>{stats.lastChunkType ?? '—'}</strong>
        </p>
      </div>
    </div>
  );
}
