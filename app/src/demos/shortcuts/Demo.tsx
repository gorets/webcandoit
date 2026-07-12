import { useEffect, useState } from 'react';

interface ManifestShortcut {
  name: string;
  url: string;
  description?: string;
}

interface ManifestLike {
  shortcuts?: ManifestShortcut[];
}

export default function ShortcutsDemo() {
  const [shortcuts, setShortcuts] = useState<ManifestShortcut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/manifest.webmanifest')
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest request failed (${res.status}).`);
        return res.json() as Promise<ManifestLike>;
      })
      .then((manifest) => {
        if (cancelled) return;
        setShortcuts(manifest.shortcuts ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load the web app manifest.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        App shortcuts are declared in the <code>shortcuts</code> array of the web app manifest. Once
        the app is installed, long-pressing (mobile) or right-clicking (desktop) its icon shows
        these as quick actions that jump straight to a given URL.
      </p>
      <p>
        <a
          href="/manifest.webmanifest"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          View this app's manifest
        </a>
      </p>
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {shortcuts === null && !error && (
        <p role="status" style={{ color: 'var(--text-dim)' }}>
          Loading manifest…
        </p>
      )}
      {shortcuts !== null && shortcuts.length === 0 && (
        <p role="status" style={{ color: 'var(--text-dim)' }}>
          This app's manifest does not declare any shortcuts right now. When present, each entry has
          a <code>name</code> and a <code>url</code>, and optionally an <code>icons</code> array —
          for example: <code>{'{ "name": "New note", "url": "/new" }'}</code>.
        </p>
      )}
      {shortcuts !== null && shortcuts.length > 0 && (
        <ul
          role="status"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0 }}
        >
          {shortcuts.map((shortcut) => (
            <li
              key={shortcut.url}
              style={{
                listStyle: 'none',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
              }}
            >
              <div style={{ fontWeight: 600 }}>{shortcut.name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9em' }}>{shortcut.url}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
