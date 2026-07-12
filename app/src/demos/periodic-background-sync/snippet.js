const registerButton = document.querySelector('#register-sync-button');
const output = document.querySelector('#sync-output');

const SYNC_TAG = 'demo-periodic';
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

registerButton.addEventListener('click', async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const permission = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (permission.state !== 'granted') {
      output.textContent = 'Permission not granted for periodic background sync.';
      return;
    }
    await registration.periodicSync.register(SYNC_TAG, { minInterval: MIN_INTERVAL_MS });
    const tags = await registration.periodicSync.getTags();
    output.textContent = `Registered "${SYNC_TAG}". Current tags: ${tags.join(', ')}`;
  } catch (err) {
    output.textContent = `Registering periodic sync failed: ${err.message}`;
  }
});
