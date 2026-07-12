import { useMemo } from 'react';

const sampleManifestSnippet = {
  share_target: {
    action: '/share-target',
    method: 'POST',
    enctype: 'multipart/form-data',
    params: {
      title: 'title',
      text: 'text',
      url: 'url',
      files: [
        {
          name: 'files',
          accept: ['image/*', '.pdf'],
        },
      ],
    },
  },
};

const KNOWN_KEYS = ['title', 'text', 'url'];

export default function ShareTargetDemo() {
  const received = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    const entries: Record<string, string> = {};
    for (const key of KNOWN_KEYS) {
      const value = params.get(key);
      if (value) entries[key] = value;
    }
    for (const [key, value] of params.entries()) {
      if (!KNOWN_KEYS.includes(key)) entries[key] = value;
    }
    return entries;
  }, []);

  const hasReceivedData = Object.keys(received).length > 0;

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        The manifest's <code>share_target</code> field lets an installed PWA appear as a destination
        in the OS's native share sheet — the OS <em>sends</em> a share (title, text, URL, and/or
        files) to the app by opening it with that data, either as URL query parameters (GET) or a
        POST body. This is the receiving counterpart to the "Web Share" demo, which only lets this
        page <em>send</em> a share out.
      </p>
      <p style={{ color: 'var(--text-dim)' }}>
        Sample <code>share_target</code> manifest snippet:
      </p>
      <pre
        style={{
          background: 'var(--surface-2)',
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(sampleManifestSnippet, null, 2)}
      </pre>
      <p style={{ color: 'var(--text-dim)' }}>
        This app's manifest doesn't declare a <code>share_target</code> yet — wiring one up needs a
        server-side handler to receive the POST, which is coming in a later phase. Below, this demo
        reads <code>title</code>/<code>text</code>/<code>url</code> straight from the current page's
        URL query string, so you can see the receiving side work today by visiting this page with
        those parameters set manually.
      </p>
      <div role="status">
        {hasReceivedData ? (
          <div>
            <p style={{ color: 'var(--accent)' }}>Shared data found in the current URL:</p>
            <pre
              style={{
                background: 'var(--surface-2)',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(received, null, 2)}
            </pre>
          </div>
        ) : (
          <p style={{ color: 'var(--text-dim)' }}>
            No shared data in the URL right now. Try appending, e.g.,{' '}
            <code>?title=Hello&amp;text=World&amp;url=https://example.com</code> to this page's
            address and reloading.
          </p>
        )}
      </div>
    </div>
  );
}
