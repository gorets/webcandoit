import { useEffect, useState } from 'react';

// Names outside the standard PermissionName union still work in browsers that
// support them; unsupported ones reject and we mark them accordingly.
const PERMISSION_NAMES = [
  'geolocation',
  'notifications',
  'camera',
  'microphone',
  'clipboard-read',
  'persistent-storage',
] as const;

type Status = PermissionState | 'unsupported';

const COLORS: Record<Status, string> = {
  granted: 'var(--accent)',
  denied: 'var(--danger)',
  prompt: 'var(--text-dim)',
  unsupported: 'var(--text-dim)',
};

export default function PermissionsDemo() {
  const [states, setStates] = useState<Record<string, Status>>({});

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    let cancelled = false;

    for (const name of PERMISSION_NAMES) {
      navigator.permissions
        .query({ name: name as PermissionName })
        .then((status) => {
          if (cancelled) return;
          const update = () => setStates((prev) => ({ ...prev, [name]: status.state }));
          update();
          status.addEventListener('change', update);
          cleanups.push(() => status.removeEventListener('change', update));
        })
        .catch(() => {
          if (!cancelled) setStates((prev) => ({ ...prev, [name]: 'unsupported' }));
        });
    }

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => {
        fn();
      });
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        These states are read without prompting. Grant or revoke a permission in your browser and
        watch the value update instantly via the <code>change</code> event.
      </p>
      <ul
        role="status"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.4rem' }}
      >
        {PERMISSION_NAMES.map((name) => {
          const state = states[name] ?? 'prompt';
          return (
            <li
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '0.6rem 0.9rem',
              }}
            >
              <span>{name}</span>
              <strong style={{ color: COLORS[state] }}>{state}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
