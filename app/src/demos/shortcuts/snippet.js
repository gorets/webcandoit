const list = document.querySelector('#shortcuts-list');
const status = document.querySelector('#shortcuts-status');

fetch('/manifest.webmanifest')
  .then((res) => {
    if (!res.ok) throw new Error(`Manifest request failed (${res.status}).`);
    return res.json();
  })
  .then((manifest) => {
    const shortcuts = manifest.shortcuts ?? [];
    if (shortcuts.length === 0) {
      status.textContent = 'This app manifest does not declare any shortcuts right now.';
      return;
    }
    list.innerHTML = shortcuts
      .map((shortcut) => `<li>${shortcut.name} — ${shortcut.url}</li>`)
      .join('');
  })
  .catch((err) => {
    status.textContent = err.message || 'Could not load the web app manifest.';
  });
