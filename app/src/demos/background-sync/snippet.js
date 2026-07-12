const registerButton = document.querySelector('#register-sync-button');
const statusEl = document.querySelector('#sync-status');

registerButton.addEventListener('click', async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('demo-sync');
    statusEl.textContent =
      'Registered sync tag "demo-sync". It will fire in the service worker once connectivity returns.';
  } catch (_err) {
    statusEl.textContent = 'Registering the sync tag failed in this browser.';
  }
});
