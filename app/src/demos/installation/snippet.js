const installButton = document.querySelector('#install-button');
const statusEl = document.querySelector('#install-status');

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.disabled = false;
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  statusEl.textContent = 'The app was installed.';
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) {
    statusEl.textContent = 'No install prompt is available right now.';
    return;
  }
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    statusEl.textContent =
      choice.outcome === 'accepted'
        ? 'User accepted the install prompt.'
        : 'User dismissed the install prompt.';
    deferredPrompt = null;
  } catch (err) {
    statusEl.textContent = err.message || 'Could not show the install prompt.';
  }
});

if (navigator.getInstalledRelatedApps) {
  navigator.getInstalledRelatedApps().then((apps) => {
    console.log('Installed related apps:', apps);
  });
}
