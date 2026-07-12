import { useState } from 'react';

const SCHEME = 'web+webcandoit';

export default function ProtocolHandlingDemo() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const register = () => {
    setError(null);
    setStatus(null);
    try {
      const handlerUrl = `${window.location.origin}/demo/protocol-handling?url=%s`;
      navigator.registerProtocolHandler(SCHEME, handlerUrl);
      setStatus(
        `Registered as a handler for "${SCHEME}:" links. Your browser may show its own permission prompt — accept it, then try the test link below.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not register the protocol handler: ${err.message}`
          : 'Could not register the protocol handler.',
      );
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        <code>registerProtocolHandler</code> lets a site ask to become the browser's handler for a
        custom <code>web+…</code> URI scheme. Once registered (and allowed by the browser), links
        using that scheme open here, with the link URL passed via the <code>%s</code> placeholder.
      </p>
      <button type="button" onClick={register}>
        Register protocol handler
      </button>
      <p>
        Test link (only opens here if registration succeeded and was allowed):{' '}
        <a href={`${SCHEME}://example`}>Open a {SCHEME} link</a>
      </p>
      {status && (
        <p role="status" style={{ color: 'var(--accent)' }}>
          {status}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
