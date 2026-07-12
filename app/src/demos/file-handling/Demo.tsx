import { useEffect, useState } from 'react';

interface LaunchParamsLike {
  files: FileSystemFileHandleLike[];
  targetURL?: string;
}

interface FileSystemFileHandleLike {
  name: string;
  getFile: () => Promise<File>;
}

interface LaunchQueueLike {
  setConsumer: (consumer: (params: LaunchParamsLike) => void) => void;
}

interface LaunchQueueWindow {
  launchQueue: LaunchQueueLike;
}

interface LaunchedFile {
  name: string;
  size: number;
  preview: string;
}

const MANIFEST_SNIPPET = `{
  "file_handlers": [
    {
      "action": "/open-file",
      "accept": {
        "text/plain": [".txt"],
        "text/markdown": [".md"]
      }
    }
  ]
}`;

export default function FileHandlingDemo() {
  const [files, setFiles] = useState<LaunchedFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const launchQueue = (window as unknown as LaunchQueueWindow).launchQueue;
    if (!launchQueue) return;

    launchQueue.setConsumer((params) => {
      if (!params.files || params.files.length === 0) {
        setFiles([]);
        return;
      }
      Promise.all(
        params.files.map(async (handle) => {
          const file = await handle.getFile();
          const text = await file.text();
          return {
            name: handle.name,
            size: file.size,
            preview: text.slice(0, 300),
          };
        }),
      )
        .then(setFiles)
        .catch(() => setError('Could not read one or more launch files.'));
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        File Handling lets an installed PWA register itself as a handler for specific file types via
        the <code>file_handlers</code> field in its web app manifest. When the OS opens a matching
        file with this app, the browser starts (or focuses) the app and delivers the file through{' '}
        <code>window.launchQueue.setConsumer()</code> instead of a normal navigation.
      </p>
      <pre
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          overflowX: 'auto',
          fontSize: '0.85rem',
        }}
      >
        {MANIFEST_SNIPPET}
      </pre>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {files === null && !error && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          Waiting for launch files… This page was opened normally, so none are queued yet. To see
          this in action, install the app and open a matching file with it from your OS file
          manager.
        </div>
      )}
      {files !== null && files.length === 0 && (
        <div role="status" style={{ color: 'var(--text-dim)' }}>
          No launch files were delivered for this session.
        </div>
      )}
      {files !== null && files.length > 0 && (
        <ul
          role="status"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0 }}
        >
          {files.map((f) => (
            <li
              key={f.name}
              style={{
                listStyle: 'none',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {f.name} <span style={{ color: 'var(--text-dim)' }}>({f.size} bytes)</span>
              </div>
              <pre style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                {f.preview}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
