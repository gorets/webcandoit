import { useEffect, useRef, useState } from 'react';

type PressureState = 'nominal' | 'fair' | 'serious' | 'critical';

interface PressureRecordLike {
  source: string;
  state: PressureState;
  time: number;
}

type PressureObserverCallback = (records: PressureRecordLike[]) => void;

interface PressureObserverLike {
  observe: (source: string) => Promise<void>;
  disconnect: () => void;
}

interface PressureObserverConstructorLike {
  new (callback: PressureObserverCallback): PressureObserverLike;
}

const STATE_COLORS: Record<PressureState, string> = {
  nominal: '#4caf50',
  fair: '#ffb300',
  serious: '#ff7043',
  critical: 'var(--danger)',
};

export default function ComputePressureDemo() {
  const [state, setState] = useState<PressureState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<PressureObserverLike | null>(null);

  useEffect(() => {
    const PressureObserverCtor = (
      globalThis as typeof globalThis & { PressureObserver?: PressureObserverConstructorLike }
    ).PressureObserver;

    if (!PressureObserverCtor) {
      setError('The Compute Pressure API is not available in this browser.');
      return;
    }

    const observer = new PressureObserverCtor((records) => {
      const latest = records[records.length - 1];
      if (latest) setState(latest.state);
    });
    observerRef.current = observer;

    observer.observe('cpu').catch(() => {
      setError('Could not start monitoring CPU pressure.');
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (error) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div
      role="status"
      style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem' }}
    >
      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>CPU pressure state</div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: state ? STATE_COLORS[state] : 'var(--text)',
          textTransform: 'capitalize',
        }}
      >
        {state ?? 'Measuring…'}
      </div>
    </div>
  );
}
