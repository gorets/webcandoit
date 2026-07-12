import { useState } from 'react';

function friendlyClipboardError(err: unknown): string {
  if (err instanceof DOMException && err.name === 'NotAllowedError') {
    return 'Clipboard permission was denied. Try clicking the button again after granting access.';
  }
  return 'Clipboard operation failed.';
}

export default function ClipboardDemo() {
  const [text, setText] = useState('Hello from WebCanDoIt!');
  const [readValue, setReadValue] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWrite = async () => {
    setError(null);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Text copied to clipboard.');
    } catch (err) {
      setError(friendlyClipboardError(err));
    }
  };

  const handleRead = async () => {
    setError(null);
    try {
      const value = await navigator.clipboard.readText();
      setReadValue(value);
      setStatus('Read text from clipboard.');
    } catch (err) {
      setError(friendlyClipboardError(err));
    }
  };

  const handleCopyImage = async () => {
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no-context');
      const gradient = ctx.createLinearGradient(0, 0, 200, 200);
      gradient.addColorStop(0, '#6c5ce7');
      gradient.addColorStop(1, '#00cec9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText('PWA', 70, 105);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('no-blob');

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setStatus('Image copied to clipboard.');
    } catch (err) {
      if (err instanceof Error && (err.message === 'no-context' || err.message === 'no-blob')) {
        setError('Could not generate the image to copy.');
        return;
      }
      setError(friendlyClipboardError(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label htmlFor="clipboard-text" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        Text to copy
      </label>
      <textarea
        id="clipboard-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleWrite}>
          Copy text
        </button>
        <button type="button" onClick={handleRead}>
          Paste text
        </button>
        <button type="button" onClick={handleCopyImage}>
          Copy generated image
        </button>
      </div>
      {readValue !== null && (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
          }}
        >
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Clipboard contents</div>
          <div>{readValue || '(empty)'}</div>
        </div>
      )}
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {status && !error && <div role="status">{status}</div>}
    </div>
  );
}
