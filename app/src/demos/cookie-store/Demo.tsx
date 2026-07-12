import { useCallback, useEffect, useState } from 'react';

interface CookieItem {
  name?: string;
  value?: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: string;
  expires?: string;
}

export default function CookieStoreDemo() {
  const [name, setName] = useState('demo-cookie');
  const [value, setValue] = useState('hello');
  const [cookies, setCookies] = useState<CookieItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCookies = useCallback(async () => {
    try {
      setError(null);
      const allCookies = await window.cookieStore.getAll();
      setCookies(allCookies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cookies.');
    }
  }, []);

  const handleSetCookie = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await window.cookieStore.set(name, value);
      await refreshCookies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set cookie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCookie = async (cookieName: string) => {
    try {
      setError(null);
      await window.cookieStore.delete(cookieName);
      await refreshCookies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete cookie.');
    }
  };

  useEffect(() => {
    refreshCookies();

    const handleChange = () => {
      refreshCookies();
    };

    window.cookieStore.addEventListener('change', handleChange);

    return () => {
      window.cookieStore.removeEventListener('change', handleChange);
    };
  }, [refreshCookies]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        Set a cookie by name and value, view all cookies, and observe changes from other tabs or
        documents.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: '500' }}>
            Cookie name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '0.5rem',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius)',
              border: `1px solid var(--surface-2)`,
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: '500' }}>
            Cookie value
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              padding: '0.5rem',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius)',
              border: `1px solid var(--surface-2)`,
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
            }}
          />
        </label>

        <button
          type="button"
          onClick={handleSetCookie}
          disabled={isLoading}
          style={{
            padding: '0.65rem 1rem',
            fontSize: '0.95rem',
            fontWeight: '500',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Setting...' : 'Set cookie'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--danger)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      <div
        role="status"
        style={{
          padding: '1rem',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)',
          minHeight: '5rem',
        }}
      >
        <p
          style={{
            color: 'var(--text)',
            fontSize: '0.9rem',
            fontWeight: '500',
            margin: '0 0 0.75rem 0',
          }}
        >
          Cookies ({cookies.length})
        </p>
        {cookies.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>
            No cookies visible to this document.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {cookies.map((cookie) => (
              <li
                key={cookie.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  backgroundColor: 'var(--surface-2)',
                  borderRadius: 'calc(var(--radius) / 2)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <code
                    style={{
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {cookie.name}={cookie.value}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => cookie.name && handleDeleteCookie(cookie.name)}
                  style={{
                    marginLeft: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'calc(var(--radius) / 2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
