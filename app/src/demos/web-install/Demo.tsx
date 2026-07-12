import { useState } from 'react';

interface InstallResult {
  url?: string;
}

interface NavigatorWithInstall extends Navigator {
  install: (params?: { manifestId?: string; installUrl?: string }) => Promise<InstallResult>;
}

export default function WebInstallDemo() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const install = async () => {
    setStatus(null);
    setError(null);
    try {
      const nav = navigator as NavigatorWithInstall;
      const result = await nav.install();
      setStatus(`Install requested successfully.${result?.url ? ` (${result.url})` : ''}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('Install was cancelled.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not complete the install request.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        The Web Install API (<code>navigator.install()</code>) is a very new, experimental proposal
        from the WICG that lets a page trigger installation directly, without relying on the
        browser's own install-prompt UI. As of writing it ships only behind flags or origin trials
        in a subset of Chromium builds, so this call is likely to fail outside those environments —
        that is expected, not a bug in this demo.
      </p>
      <div>
        <button type="button" onClick={install}>
          Call navigator.install()
        </button>
      </div>
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
