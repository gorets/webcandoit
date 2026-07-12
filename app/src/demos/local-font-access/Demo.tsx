import { useState } from 'react';

interface FontDataLike {
  postscriptName: string;
  fullName: string;
  family: string;
  style: string;
}

interface LocalFontAccessWindow {
  queryLocalFonts: () => Promise<FontDataLike[]>;
}

const DISPLAY_CAP = 200;

export default function LocalFontAccessDemo() {
  const [fonts, setFonts] = useState<FontDataLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await (window as unknown as LocalFontAccessWindow).queryLocalFonts();
      setFonts(list);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Permission to access local fonts was denied.');
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        setError(null);
      } else {
        setError('Could not read local fonts.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button type="button" onClick={handleQuery} disabled={loading}>
        {loading ? 'Requesting permission…' : 'List local fonts'}
      </button>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {fonts !== null && (
        <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: 'var(--text-dim)' }}>
            Found {fonts.length} font{fonts.length === 1 ? '' : 's'}
            {fonts.length > DISPLAY_CAP ? ` (showing first ${DISPLAY_CAP})` : ''}.
          </div>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
              maxHeight: '320px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {fonts.slice(0, DISPLAY_CAP).map((f) => (
              <div
                key={f.postscriptName}
                style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
              >
                <span>{f.family}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  {f.postscriptName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
