import { useEffect, useRef, useState } from 'react';

interface XRSessionLike extends EventTarget {
  end: () => Promise<void>;
}

interface XRSystemLike {
  isSessionSupported: (mode: string) => Promise<boolean>;
  requestSession: (mode: string) => Promise<XRSessionLike>;
}

function getXr(): XRSystemLike {
  return (navigator as Navigator & { xr: XRSystemLike }).xr;
}

function describeError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotSupportedError') {
      return 'This session mode is not supported on this device.';
    }
    if (err.name === 'SecurityError') return 'Blocked by browser security policy.';
    return `${err.name}: ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

interface SupportState {
  vr: boolean | null;
  ar: boolean | null;
}

export default function WebXrDemo() {
  const [support, setSupport] = useState<SupportState>({ vr: null, ar: null });
  const [checking, setChecking] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<XRSessionLike | null>(null);

  useEffect(() => {
    let cancelled = false;
    const xr = getXr();

    Promise.all([
      xr.isSessionSupported('immersive-vr').catch(() => false),
      xr.isSessionSupported('immersive-ar').catch(() => false),
    ]).then(([vr, ar]) => {
      if (cancelled) return;
      setSupport({ vr, ar });
      setChecking(false);
    });

    return () => {
      cancelled = true;
      sessionRef.current?.end().catch(() => {});
    };
  }, []);

  const startSession = async (mode: 'immersive-vr' | 'immersive-ar') => {
    setError(null);
    setStatus(null);
    try {
      const session = await getXr().requestSession(mode);
      sessionRef.current = session;
      setSessionActive(true);
      setStatus(`${mode} session active.`);
      session.addEventListener('end', () => {
        sessionRef.current = null;
        setSessionActive(false);
        setStatus('Session ended.');
      });
    } catch (err) {
      setError(describeError(err));
    }
  };

  const endSession = async () => {
    try {
      await sessionRef.current?.end();
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Starting a session requires XR hardware (a headset, or an AR-capable phone/browser) and a
        user gesture.
      </p>
      {checking ? (
        <div role="status">Checking session support…</div>
      ) : (
        <div
          role="status"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>immersive-vr</div>
            <div>{support.vr ? 'Supported' : 'Not supported'}</div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>immersive-ar</div>
            <div>{support.ar ? 'Supported' : 'Not supported'}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!sessionActive ? (
          <>
            <button
              type="button"
              onClick={() => startSession('immersive-vr')}
              disabled={checking || support.vr === false}
            >
              Start VR session
            </button>
            <button
              type="button"
              onClick={() => startSession('immersive-ar')}
              disabled={checking || support.ar === false}
            >
              Start AR session
            </button>
          </>
        ) : (
          <button type="button" onClick={endSession}>
            End session
          </button>
        )}
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {status && <div role="status">{status}</div>}
    </div>
  );
}
