import { useEffect, useRef, useState } from 'react';

// The Idle Detection API is not part of TypeScript's bundled DOM lib, so we
// describe the minimal shape we need locally and cast at the call site.
type IdleUserState = 'active' | 'idle';
type IdleScreenState = 'locked' | 'unlocked';

interface IdleDetectorInstance extends EventTarget {
  readonly userState: IdleUserState;
  readonly screenState: IdleScreenState;
  start(options: { threshold: number; signal: AbortSignal }): Promise<void>;
}

interface IdleDetectorConstructor {
  new (): IdleDetectorInstance;
  requestPermission(): Promise<'granted' | 'denied' | 'prompt'>;
}

function getIdleDetectorConstructor(): IdleDetectorConstructor {
  return (window as unknown as { IdleDetector: IdleDetectorConstructor }).IdleDetector;
}

type Status = 'idle' | 'requesting' | 'running' | 'error';

export default function IdleDetectionDemo() {
  const [userState, setUserState] = useState<IdleUserState | null>(null);
  const [screenState, setScreenState] = useState<IdleScreenState | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function start() {
    setError(null);
    setStatus('requesting');
    try {
      const IdleDetector = getIdleDetectorConstructor();
      const permission = await IdleDetector.requestPermission();
      if (permission !== 'granted') {
        setError('Permission to monitor idle state was not granted.');
        setStatus('error');
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const detector = new IdleDetector();
      detector.addEventListener('change', () => {
        setUserState(detector.userState);
        setScreenState(detector.screenState);
      });

      await detector.start({ threshold: 60000, signal: controller.signal });
      setUserState(detector.userState);
      setScreenState(detector.screenState);
      setStatus('running');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start idle detection.');
      setStatus('error');
    }
  }

  function stop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus('idle');
    setUserState(null);
    setScreenState(null);
  }

  return (
    <div>
      <p>
        The Idle Detection API reports when the user stops interacting with their device and when
        the screen is locked. This requires a permission prompt and a minimum threshold of 60
        seconds of inactivity before "idle" is reported.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={start}
          disabled={status === 'requesting' || status === 'running'}
        >
          Start monitoring
        </button>
        <button type="button" onClick={stop} disabled={status !== 'running'}>
          Stop
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
      {status === 'running' && (
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
            User state: <strong>{userState ?? 'unknown'}</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            Screen state: <strong>{screenState ?? 'unknown'}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
