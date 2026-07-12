const requestButton = document.querySelector('#request-permission-button');
const showButton = document.querySelector('#show-notification-button');
const statusEl = document.querySelector('#notification-status');

requestButton.addEventListener('click', async () => {
  try {
    const permission = await Notification.requestPermission();
    statusEl.textContent = `Permission: ${permission}`;
  } catch {
    statusEl.textContent = 'Could not request notification permission.';
  }
});

showButton.addEventListener('click', async () => {
  if (Notification.permission !== 'granted') {
    statusEl.textContent = 'Request permission first.';
    return;
  }
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active) {
      await registration.showNotification('Hello from WebCanDoIt', {
        body: 'This notification was shown through the active service worker.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
      });
    } else {
      new Notification('Hello from WebCanDoIt', {
        body: 'Shown directly — no active service worker in this session.',
        icon: '/icons/icon-192.png',
      });
    }
    statusEl.textContent = 'Notification shown.';
  } catch (err) {
    statusEl.textContent = err.message || 'Could not show the notification.';
  }
});
