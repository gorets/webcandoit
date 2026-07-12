import { useState } from 'react';

async function gzip(text: string): Promise<Blob> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).blob();
}

async function gunzip(blob: Blob): Promise<string> {
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

export default function CompressionDemo() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog. '.repeat(20));
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [matches, setMatches] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRun = async () => {
    setError(null);
    setBusy(true);
    try {
      const originalBytes = new TextEncoder().encode(input).length;
      const compressedBlob = await gzip(input);
      const roundTripped = await gunzip(compressedBlob);

      setOriginalSize(originalBytes);
      setCompressedSize(compressedBlob.size);
      setMatches(roundTripped === input);
    } catch {
      setError('Compression failed in this browser.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label htmlFor="compression-input" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        Text to compress
      </label>
      <textarea
        id="compression-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          fontFamily: 'monospace',
          resize: 'vertical',
        }}
      />
      <button type="button" onClick={handleRun} disabled={busy}>
        {busy ? 'Compressing…' : 'Gzip and verify round trip'}
      </button>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {originalSize !== null && compressedSize !== null && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div>Original size: {originalSize} bytes</div>
          <div>Compressed size: {compressedSize} bytes</div>
          <div>
            Ratio:{' '}
            {originalSize > 0 ? `${Math.round((compressedSize / originalSize) * 100)}%` : '—'}
          </div>
          <div style={{ color: matches ? 'var(--accent)' : 'var(--danger)' }}>
            {matches
              ? 'Round trip verified — decompressed text matches the original.'
              : 'Round trip mismatch!'}
          </div>
        </div>
      )}
    </div>
  );
}
