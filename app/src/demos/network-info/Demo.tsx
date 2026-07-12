import { useEffect, useState } from 'react';

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NetworkState {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export default function NetworkInfoDemo() {
  const [info, setInfo] = useState<NetworkState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike })
      .connection;

    if (!connection) {
      setError('The Network Information API is not available in this browser.');
      return;
    }

    const update = () => {
      setInfo({
        effectiveType: connection.effectiveType ?? 'unknown',
        downlink: connection.downlink ?? 0,
        rtt: connection.rtt ?? 0,
        saveData: connection.saveData ?? false,
      });
    };

    update();
    connection.addEventListener('change', update);

    return () => {
      connection.removeEventListener('change', update);
    };
  }, []);

  if (error) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  if (!info) {
    return <div role="status">Reading network information…</div>;
  }

  return (
    <div role="status" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
      <div
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.75rem' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Effective type</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{info.effectiveType}</div>
      </div>
      <div
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.75rem' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Downlink</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{info.downlink} Mbps</div>
      </div>
      <div
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.75rem' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Round-trip time</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{info.rtt} ms</div>
      </div>
      <div
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.75rem' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Data saver</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{info.saveData ? 'On' : 'Off'}</div>
      </div>
    </div>
  );
}
