import { useState } from 'react';

interface EyeDropperResultLike {
  sRGBHex: string;
}

interface EyeDropperLike {
  open: () => Promise<EyeDropperResultLike>;
}

interface EyeDropperConstructor {
  new (): EyeDropperLike;
}

export default function EyeDropperDemo() {
  const [color, setColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const handlePick = async () => {
    setError(null);
    setPicking(true);
    try {
      const EyeDropperCtor = (window as unknown as { EyeDropper: EyeDropperConstructor })
        .EyeDropper;
      const eyeDropper = new EyeDropperCtor();
      const result = await eyeDropper.open();
      setColor(result.sRGBHex);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user cancelled, nothing to report
      } else {
        setError('Could not pick a color.');
      }
    } finally {
      setPicking(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button type="button" onClick={handlePick} disabled={picking}>
        {picking ? 'Pick a pixel…' : 'Open eyedropper'}
      </button>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {color && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius)',
              background: color,
              border: '1px solid var(--surface-2)',
            }}
          />
          <span style={{ fontFamily: 'monospace' }}>{color}</span>
        </div>
      )}
    </div>
  );
}
