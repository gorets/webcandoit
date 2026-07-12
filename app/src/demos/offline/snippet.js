const cacheListEl = document.querySelector('#cache-list');
const entriesEl = document.querySelector('#cache-entries');
const urlInput = document.querySelector('#cache-url-input');
const addButton = document.querySelector('#cache-add-button');
const statusEl = document.querySelector('#cache-status');

const DEMO_CACHE_NAME = 'pwa-demo-cache';

async function showCacheEntries(name) {
  const cache = await caches.open(name);
  const requests = await cache.keys();
  entriesEl.textContent =
    requests
      .slice(0, 8)
      .map((r) => r.url)
      .join('\n') || 'No cached requests.';
}

async function refreshCacheNames() {
  const names = await caches.keys();
  cacheListEl.innerHTML = '';
  for (const name of names) {
    const button = document.createElement('button');
    button.textContent = name;
    button.addEventListener('click', () => showCacheEntries(name));
    cacheListEl.append(button);
  }
}

addButton.addEventListener('click', async () => {
  const url = urlInput.value;
  try {
    const cache = await caches.open(DEMO_CACHE_NAME);
    await cache.add(url);
    const match = await cache.match(url);
    statusEl.textContent = match
      ? `Cached and read back "${url}" — status ${match.status}.`
      : `Cached "${url}" but could not read it back.`;
    await refreshCacheNames();
  } catch {
    statusEl.textContent = `Could not cache "${url}".`;
  }
});

refreshCacheNames();
