import { useEffect, useRef, useState } from 'react';

interface MotionData {
  acceleration: { x: number | null; y: number | null; z: number | null } | null;
  rotationRate: { alpha: number | null; beta: number | null; gamma: number | null } | null;
}

type DeviceMotionEventCtorLike = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export default function DeviceMotionDemo() {
  const [motion, setMotion] = useState<MotionData | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        window.removeEventListener('devicemotion', handlerRef.current);
      }
    };
  }, []);

  const start = async () => {
    setError(null);
    const ctor = DeviceMotionEvent as DeviceMotionEventCtorLike;

    const handleEvent = (event: DeviceMotionEvent) => {
      setMotion({
        acceleration: event.acceleration
          ? { x: event.acceleration.x, y: event.acceleration.y, z: event.acceleration.z }
          : null,
        rotationRate: event.rotationRate
          ? {
              alpha: event.rotationRate.alpha,
              beta: event.rotationRate.beta,
              gamma: event.rotationRate.gamma,
            }
          : null,
      });
    };

    try {
      if (typeof ctor.requestPermission === 'function') {
        const result = await ctor.requestPermission();
        if (result !== 'granted') {
          setError('Permission to access device motion was denied.');
          return;
        }
      }
      handlerRef.current = handleEvent;
      window.addEventListener('devicemotion', handleEvent);
      setListening(true);
    } catch {
      setError('Could not start device motion tracking.');
    }
  };

  const format = (value: number | null | undefined) =>
    value === null || value === undefined ? '—' : value.toFixed(2);

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
        <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Acceleration (m/s²)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                x: {format(motion?.acceleration?.x)}
              </div>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                y: {format(motion?.acceleration?.y)}
              </div>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                z: {format(motion?.acceleration?.z)}
              </div>
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Rotation rate (°/s)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                α: {format(motion?.rotationRate?.alpha)}
              </div>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                β: {format(motion?.rotationRate?.beta)}
              </div>
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                γ: {format(motion?.rotationRate?.gamma)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
