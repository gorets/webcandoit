import { useEffect, useState } from 'react';

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface BatteryState {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '∞';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${remMins}m`;
}

export default function BatteryStatusDemo() {
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let manager: BatteryManagerLike | null = null;
    let cancelled = false;

    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> };

    const update = () => {
      if (!manager) return;
      setBattery({
        level: manager.level,
        charging: manager.charging,
        chargingTime: manager.chargingTime,
        dischargingTime: manager.dischargingTime,
      });
    };

    if (!nav.getBattery) {
      setError('The Battery Status API is not available in this browser.');
      return;
    }

    nav
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        manager = b;
        update();
        b.addEventListener('levelchange', update);
        b.addEventListener('chargingchange', update);
        b.addEventListener('chargingtimechange', update);
        b.addEventListener('dischargingtimechange', update);
      })
      .catch(() => {
        if (!cancelled) setError('Could not access battery information.');
      });

    return () => {
      cancelled = true;
      if (manager) {
        manager.removeEventListener('levelchange', update);
        manager.removeEventListener('chargingchange', update);
        manager.removeEventListener('chargingtimechange', update);
        manager.removeEventListener('dischargingtimechange', update);
      }
    };
  }, []);

  if (error) {
    return (
      <div role="alert" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  if (!battery) {
    return <div role="status">Reading battery status…</div>;
  }

  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
        }}
      >
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{Math.round(battery.level * 100)}%</div>
        <div style={{ color: 'var(--text-dim)' }}>
          {battery.charging ? 'Charging' : 'Not charging'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div
          style={{
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
          }}
        >
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Charging time</div>
          <div>{battery.charging ? formatTime(battery.chargingTime) : '—'}</div>
        </div>
        <div
          style={{
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
          }}
        >
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Discharging time</div>
          <div>{!battery.charging ? formatTime(battery.dischargingTime) : '—'}</div>
        </div>
      </div>
    </div>
  );
}
