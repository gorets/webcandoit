import { useCallback, useEffect, useState } from 'react';

const DEMO_CACHE_NAME = 'pwa-demo-cache';
const MAX_ENTRIES_SHOWN = 8;

export default function OfflineDemo() {
  const [cacheNames, setCacheNames] = useState<string[] | null>(null);
  const [selectedCache, setSelectedCache] = useState<string | null>(null);
  const [entries, setEntries] = useState<string[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const [addUrl, setAddUrl] = useState('/manifest.webmanifest');
  const [addResult, setAddResult] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshCacheNames = useCallback(async () => {
    setListError(null);
    try {
      const names = await caches.keys();
      setCacheNames(names);
    } catch {
      setListError('Could not list caches in this browser.');
    }
  }, []);

  useEffect(() => {
    void refreshCacheNames();
  }, [refreshCacheNames]);

  const handleSelectCache = async (name: string) => {
    setSelectedCache(name);
    setEntriesError(null);
    try {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      setEntries(requests.slice(0, MAX_ENTRIES_SHOWN).map((r) => r.url));
    } catch {
      setEntries([]);
      setEntriesError('Could not read entries for that cache.');
    }
  };

  const handleAddToCache = async () => {
    setAddError(null);
    setAddResult(null);
    setBusy(true);
    try {
      const cache = await caches.open(DEMO_CACHE_NAME);
      await cache.add(addUrl);
      const match = await cache.match(addUrl);
      if (match) {
        setAddResult(`Cached and read back "${addUrl}" — response status ${match.status}.`);
      } else {
        setAddResult(`Cached "${addUrl}" but could not read it back.`);
      }
      await refreshCacheNames();
      if (selectedCache === DEMO_CACHE_NAME) {
        await handleSelectCache(DEMO_CACHE_NAME);
      }
    } catch {
      setAddError(
        `Could not cache "${addUrl}" — make sure the URL exists and is reachable (same-origin or CORS-enabled).`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ color: 'var(--text-dim)' }}>
        In the production build, the service worker precaches the app shell into Cache Storage so
        the app keeps working offline. This demo talks to the same Cache Storage API directly, so in
        dev mode you'll only see caches you create here.
      </p>

      {listError && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {listError}
        </div>
      )}

      <div
        role="status"
        style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.75rem' }}
      >
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Caches on this origin
        </div>
        {cacheNames === null ? (
          <div>Loading…</div>
        ) : cacheNames.length === 0 ? (
          <div>No caches yet.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {cacheNames.map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => void handleSelectCache(name)}
                style={{
                  background: selectedCache === name ? 'var(--accent)' : 'var(--surface-2)',
                  color: selectedCache === name ? 'var(--bg)' : 'var(--text)',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCache && (
        <div
          role="status"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
          }}
        >
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            First {MAX_ENTRIES_SHOWN} entries in "{selectedCache}"
          </div>
          {entriesError && <div style={{ color: 'var(--danger)' }}>{entriesError}</div>}
          {!entriesError && entries.length === 0 && <div>No cached requests.</div>}
          {entries.map((url) => (
            <div
              key={url}
              style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem' }}
            >
              {url}
            </div>
          ))}
        </div>
      )}

      <label htmlFor="offline-url" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        URL to fetch and cache
      </label>
      <input
        id="offline-url"
        type="text"
        value={addUrl}
        onChange={(e) => setAddUrl(e.target.value)}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem',
        }}
      />
      <button type="button" onClick={handleAddToCache} disabled={busy || addUrl.trim() === ''}>
        {busy ? 'Caching…' : `Cache into "${DEMO_CACHE_NAME}" and read back`}
      </button>

      {addError && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {addError}
        </div>
      )}
      {addResult && (
        <div role="status" style={{ color: 'var(--accent)' }}>
          {addResult}
        </div>
      )}
    </div>
  );
}
