import { useEffect, useRef, useState } from 'react';

interface Orientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

type DeviceOrientationEventCtorLike = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export default function DeviceOrientationDemo() {
  const [orientation, setOrientation] = useState<Orientation | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        window.removeEventListener('deviceorientation', handlerRef.current);
      }
    };
  }, []);

  const start = async () => {
    setError(null);
    const ctor = DeviceOrientationEvent as DeviceOrientationEventCtorLike;

    const handleEvent = (event: DeviceOrientationEvent) => {
      setOrientation({ alpha: event.alpha, beta: event.beta, gamma: event.gamma });
    };

    try {
      if (typeof ctor.requestPermission === 'function') {
        const result = await ctor.requestPermission();
        if (result !== 'granted') {
          setError('Permission to access device orientation was denied.');
          return;
        }
      }
      handlerRef.current = handleEvent;
      window.addEventListener('deviceorientation', handleEvent);
      setListening(true);
    } catch {
      setError('Could not start device orientation tracking.');
    }
  };

  const format = (value: number | null) => (value === null ? '—' : value.toFixed(1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {!listening && (
        <button type="button" onClick={start}>
          Start listening
        </button>
      )}
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {listening && (
        <div
          role="status"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Alpha (z)</div>
            <div>{format(orientation?.alpha ?? null)}°</div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Beta (x)</div>
            <div>{format(orientation?.beta ?? null)}°</div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Gamma (y)</div>
            <div>{format(orientation?.gamma ?? null)}°</div>
          </div>
        </div>
      )}
    </div>
  );
}
