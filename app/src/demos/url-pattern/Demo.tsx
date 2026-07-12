import { useMemo, useState } from 'react';

interface URLPatternInit {
  pathname?: string;
  hostname?: string;
  protocol?: string;
  search?: string;
  hash?: string;
}

interface URLPatternComponentResult {
  groups: Record<string, string | undefined>;
}

interface URLPatternResult {
  pathname: URLPatternComponentResult;
  search?: URLPatternComponentResult;
  hash?: URLPatternComponentResult;
  hostname?: URLPatternComponentResult;
  protocol?: URLPatternComponentResult;
}

declare class URLPattern {
  constructor(input: URLPatternInit | string, baseURL?: string);
  exec(input: string | { pathname?: string }, baseURL?: string): URLPatternResult | null;
  test(input: string | { pathname?: string }, baseURL?: string): boolean;
}

export default function URLPatternDemo() {
  const [patternInput, setPatternInput] = useState('/demo/:category/:slug');
  const [testUrl, setTestUrl] = useState('/demo/hardware/web-bluetooth');

  const result = useMemo(() => {
    try {
      const pattern = new URLPattern({ pathname: patternInput });
      const match = pattern.exec(testUrl, 'https://example.com');
      return {
        matched: match !== null,
        groups: match?.pathname.groups ?? null,
        error: null,
      };
    } catch (err) {
      return {
        matched: false,
        groups: null,
        error: err instanceof Error ? err.message : 'Invalid pattern',
      };
    }
  }, [patternInput, testUrl]);

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        Enter a pathname pattern with named groups (e.g., <code>/users/:id</code>) and a test URL to
        match it against. Invalid patterns will show an error.
      </p>

      <div style={{ marginTop: '1rem' }}>
        <label>
          <div style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Pattern (pathname)</div>
          <input
            type="text"
            value={patternInput}
            onChange={(e) => setPatternInput(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '480px',
              padding: '0.5rem',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--surface)',
              borderRadius: 'var(--radius)',
            }}
          />
        </label>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>
          <div style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Test URL</div>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '480px',
              padding: '0.5rem',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--surface)',
              borderRadius: 'var(--radius)',
            }}
          />
        </label>
      </div>

      {result.error && (
        <div
          role="alert"
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: 'var(--danger)',
            color: 'var(--text)',
            borderRadius: 'var(--radius)',
            fontSize: '0.9rem',
          }}
        >
          Invalid pattern: {result.error}
        </div>
      )}

      {!result.error && (
        <div
          role="status"
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: result.matched ? 'var(--accent)' : 'var(--surface)',
            color: 'var(--text)',
            borderRadius: 'var(--radius)',
          }}
        >
          {result.matched ? 'Match: Yes' : 'Match: No'}
        </div>
      )}

      {result.matched && result.groups && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Captured groups:</p>
          <pre
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text)',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              overflow: 'auto',
              maxWidth: '480px',
              fontSize: '0.9rem',
            }}
          >
            {JSON.stringify(result.groups, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
