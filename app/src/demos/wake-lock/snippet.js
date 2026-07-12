const acquireButton = document.querySelector('#wake-lock-acquire');
const releaseButton = document.querySelector('#wake-lock-release');
const status = document.querySelector('#wake-lock-status');

let sentinel = null;

acquireButton.addEventListener('click', async () => {
  try {
    sentinel = await navigator.wakeLock.request('screen');
    status.textContent = 'Active';
    sentinel.addEventListener('release', () => {
      status.textContent = 'Inactive';
      sentinel = null;
    });
  } catch (err) {
    console.error('Failed to acquire wake lock', err);
    status.textContent = 'Failed to acquire wake lock.';
  }
});

releaseButton.addEventListener('click', async () => {
  try {
    await sentinel?.release();
  } catch (err) {
    console.error('Failed to release wake lock', err);
  }
});
