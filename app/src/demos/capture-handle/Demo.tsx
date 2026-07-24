import { useCallback, useEffect, useRef, useState } from 'react';

// The Capture Handle API is not yet in TypeScript's lib.dom, so describe the
// pieces we touch. A page opts in by advertising a handle; the capturing side
// reads it back from the video track.
interface CaptureHandle {
  handle?: string;
  origin?: string;
}

interface CaptureHandleConfig {
  handle?: string;
  exposeOrigin?: boolean;
  permittedOrigins?: string[];
}

interface CaptureHandleTrack extends MediaStreamTrack {
  getCaptureHandle?: () => CaptureHandle | null;
}

interface CaptureHandleMediaDevices extends MediaDevices {
  setCaptureHandleConfig?: (config: CaptureHandleConfig) => void;
}

const HANDLE = 'webcandoit:capture-handle-demo';

export default function CaptureHandleDemo() {
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<CaptureHandleTrack | null>(null);
  const [active, setActive] = useState(false);
  const [captureHandle, setCaptureHandle] = useState<CaptureHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Advertise this tab's handle so it can recognise itself when captured.
  useEffect(() => {
    const mediaDevices = navigator.mediaDevices as CaptureHandleMediaDevices;
    mediaDevices.setCaptureHandleConfig?.({
      handle: HANDLE,
      exposeOrigin: true,
      permittedOrigins: ['*'],
    });
  }, []);

  const stop = useCallback(() => {
    // Stopping the track ends the stream and drops its event listeners with it.
    streamRef.current?.getTracks().forEach((t) => {
      t.stop();
    });
    streamRef.current = null;
    trackRef.current = null;
    setActive(false);
    setCaptureHandle(null);
  }, []);

  useEffect(() => stop, [stop]);

  function readHandle() {
    const track = trackRef.current;
    setCaptureHandle(track?.getCaptureHandle?.() ?? null);
  }

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0] as CaptureHandleTrack;
      streamRef.current = stream;
      trackRef.current = track;
      track.addEventListener('capturehandlechange', readHandle);
      track.addEventListener('ended', stop);
      setActive(true);
      readHandle();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Screen sharing permission was denied.');
      } else {
        setError('Could not start capture. Please try again.');
      }
    }
  };

  const isSelf = captureHandle?.handle === HANDLE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Start a capture and pick <strong>this very tab</strong>. The capturing side reads the handle
        this page advertised, so it can tell it is looking at itself. Pick a different window or tab
        and no handle is exposed.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={start} disabled={active}>
          Start capture
        </button>
        <button type="button" onClick={stop} disabled={!active}>
          Stop
        </button>
      </div>

      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {!error && active && (
        <div
          role="status"
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
        >
          {captureHandle?.handle ? (
            <>
              <p style={{ margin: 0 }}>
                Capture handle:{' '}
                <strong style={{ color: isSelf ? 'var(--accent)' : 'var(--text)' }}>
                  {captureHandle.handle}
                </strong>
              </p>
              {captureHandle.origin && (
                <p style={{ margin: '0.5rem 0 0' }}>
                  Origin: <strong>{captureHandle.origin}</strong>
                </p>
              )}
              {isSelf && (
                <p style={{ margin: '0.5rem 0 0', color: 'var(--accent)' }}>
                  You are capturing this demo tab. ✔
                </p>
              )}
            </>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-dim)' }}>
              No capture handle exposed for the selected surface. Try again and choose this tab.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
