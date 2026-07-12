const acquireButton = document.querySelector('#lock-acquire');
const status = document.querySelector('#lock-status');

acquireButton.addEventListener('click', async () => {
  status.textContent = 'Requesting lock…';
  try {
    await navigator.locks.request('webcandoit-demo-lock', async () => {
      status.textContent = 'Lock held for 3 seconds…';
      await new Promise((resolve) => setTimeout(resolve, 3000));
    });
    status.textContent = 'Lock released.';
  } catch (error) {
    status.textContent = `Error: ${error instanceof Error ? error.message : 'Failed to acquire lock'}`;
  }
});
