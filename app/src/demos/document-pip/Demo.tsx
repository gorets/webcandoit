import { useCallback, useEffect, useRef, useState } from 'react';

interface DocumentPipWindow extends EventTarget {
  document: Document;
  close: () => void;
}

interface DocumentPipApi {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<DocumentPipWindow>;
}

export default function DocumentPipDemo() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pipWindowRef = useRef<DocumentPipWindow | null>(null);
  const [open, setOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const returnContentHome = useCallback(() => {
    if (
      contentRef.current &&
      placeholderRef.current &&
      !placeholderRef.current.contains(contentRef.current)
    ) {
      placeholderRef.current.appendChild(contentRef.current);
    }
  }, []);

  const handlePipClosed = useCallback(() => {
    pipWindowRef.current = null;
    returnContentHome();
    setOpen(false);
  }, [returnContentHome]);

  const openPip = useCallback(async () => {
    setError(null);
    try {
      const api = (window as unknown as { documentPictureInPicture: DocumentPipApi })
        .documentPictureInPicture;
      const pipWindow = await api.requestWindow({ width: 320, height: 220 });
      pipWindowRef.current = pipWindow;
      pipWindow.document.body.style.margin = '0';
      pipWindow.document.body.style.background = '#101018';
      pipWindow.document.body.style.color = '#e6e6f0';
      pipWindow.document.body.style.fontFamily = 'sans-serif';
      if (contentRef.current) {
        pipWindow.document.body.appendChild(contentRef.current);
      }
      pipWindow.addEventListener('pagehide', handlePipClosed);
      setOpen(true);
    } catch {
      setError('Could not open the Picture-in-Picture window.');
    }
  }, [handlePipClosed]);

  useEffect(() => {
    const button = closeButtonRef.current;
    if (!button) return;
    // The close button may live inside a different document once popped out,
    // so we bind a native listener directly rather than relying on React's
    // synthetic event delegation, which only covers the main document tree.
    const handleClick = () => {
      pipWindowRef.current?.close();
    };
    button.addEventListener('click', handleClick);
    return () => button.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(
    () => () => {
      pipWindowRef.current?.close();
      returnContentHome();
    },
    [returnContentHome],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={openPip} disabled={open}>
          Open pop-out window
        </button>
      </div>
      <div ref={placeholderRef} style={{ minHeight: '100px' }}>
        <div
          ref={contentRef}
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <p style={{ margin: 0 }}>This panel keeps ticking even inside the pop-out window.</p>
          <p role="status" style={{ margin: 0, color: 'var(--text-dim)' }}>
            Elapsed: {elapsed}s
          </p>
          <button type="button" ref={closeButtonRef} disabled={!open}>
            Close pop-out window
          </button>
        </div>
      </div>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {!error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          {open
            ? 'The panel above is rendered in a separate always-on-top window.'
            : 'Pop-out window is closed.'}
        </div>
      )}
    </div>
  );
}
