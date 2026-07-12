import { useEffect, useRef, useState } from 'react';

// The Window Management API is not part of TypeScript's bundled DOM lib, so
// we describe the minimal shape we need locally and cast at the call site.
interface ScreenDetailedLike {
  label: string;
  width: number;
  height: number;
  isPrimary: boolean;
  isInternal: boolean;
}

interface ScreenDetailsLike extends EventTarget {
  readonly screens: ScreenDetailedLike[];
}

function getScreenDetails(): Promise<ScreenDetailsLike> {
  return (
    window as unknown as { getScreenDetails: () => Promise<ScreenDetailsLike> }
  ).getScreenDetails();
}

type Status = 'idle' | 'requesting' | 'granted' | 'error';

export default function WindowManagementDemo() {
  const [status, setStatus] = useState<Status>('idle');
  const [screens, setScreens] = useState<ScreenDetailedLike[]>([]);
  const [error, setError] = useState<string | null>(null);
  const detailsRef = useRef<ScreenDetailsLike | null>(null);
  const updateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (detailsRef.current && updateRef.current) {
        detailsRef.current.removeEventListener('screenschange', updateRef.current);
      }
      detailsRef.current = null;
      updateRef.current = null;
    };
  }, []);

  async function requestDetails() {
    setError(null);
    setStatus('requesting');
    try {
      const details = await getScreenDetails();
      detailsRef.current = details;
      setScreens([...details.screens]);
      setStatus('granted');

      const update = () => setScreens([...details.screens]);
      updateRef.current = update;
      details.addEventListener('screenschange', update);
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError') {
        setError('Permission to view display information was denied.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not read screen details.');
      }
      setStatus('error');
    }
  }

  return (
    <div>
      <p>
        The Window Management API lets a page enumerate every connected display after the user
        grants a permission prompt. <code>screen.isExtended</code> hints whether multiple screens
        are available without asking for permission.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        Multi-screen environment detected (<code>screen.isExtended</code>):{' '}
        <strong>{String((screen as Screen & { isExtended?: boolean }).isExtended ?? false)}</strong>
      </p>
      <button
        type="button"
        onClick={requestDetails}
        disabled={status === 'requesting'}
        style={{ marginTop: '0.5rem' }}
      >
        Request screen details
      </button>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)', marginTop: '1rem' }}>
          {error}
        </p>
      )}
      {status === 'granted' && (
        <div role="status" style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
          {screens.map((s, i) => (
            <div
              key={`${s.label}-${s.width}x${s.height}-${s.isPrimary}-${s.isInternal}`}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
              }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>{s.label || `Screen ${i + 1}`}</p>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)' }}>
                {s.width} × {s.height}px · {s.isPrimary ? 'primary' : 'secondary'} ·{' '}
                {s.isInternal ? 'internal' : 'external'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
