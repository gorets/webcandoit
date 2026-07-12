const statusEl = document.querySelector('#online-status');
const historyEl = document.querySelector('#online-history');

statusEl.textContent = navigator.onLine ? 'Online' : 'Offline';

function logEvent(status) {
  const item = document.createElement('li');
  item.textContent = `${status} — ${new Date().toLocaleTimeString()}`;
  historyEl.prepend(item);
}

window.addEventListener('online', () => {
  statusEl.textContent = 'Online';
  logEvent('online');
});

window.addEventListener('offline', () => {
  statusEl.textContent = 'Offline';
  logEvent('offline');
});
