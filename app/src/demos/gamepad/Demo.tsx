import { useEffect, useRef, useState } from 'react';

interface Snapshot {
  id: string;
  buttons: number[];
  axes: number[];
}

export default function GamepadDemo() {
  const rafRef = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const poll = () => {
      const pads = navigator.getGamepads();
      const pad = pads.find((p): p is Gamepad => p !== null);
      if (pad) {
        setSnapshot({
          id: pad.id,
          buttons: pad.buttons.map((b) => b.value),
          axes: [...pad.axes],
        });
      } else {
        setSnapshot(null);
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0 }}>
        Connect a controller and press any button to wake it up, then move the sticks and hold
        buttons.
      </p>
      {!snapshot ? (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          No gamepad detected. Press a button on a connected controller.
        </div>
      ) : (
        <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{snapshot.id}</div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Buttons
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {snapshot.buttons.map((value, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length button list
                  key={index}
                  style={{
                    minWidth: '1.9rem',
                    textAlign: 'center',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.8rem',
                    background: value > 0.1 ? 'var(--accent)' : 'var(--surface)',
                    color: value > 0.1 ? '#000' : 'inherit',
                  }}
                >
                  {index}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Axes
            </div>
            <div style={{ display: 'grid', gap: '0.3rem' }}>
              {snapshot.axes.map((value, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length axis list
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '3rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    axis {index}
                  </span>
                  <div
                    style={{
                      position: 'relative',
                      flex: 1,
                      height: '0.5rem',
                      background: 'var(--surface)',
                      borderRadius: '999px',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        width: '0.5rem',
                        borderRadius: '999px',
                        background: 'var(--accent)',
                        left: `calc(${((value + 1) / 2) * 100}% - 0.25rem)`,
                      }}
                    />
                  </div>
                  <span style={{ width: '3rem', fontSize: '0.8rem', textAlign: 'right' }}>
                    {value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
