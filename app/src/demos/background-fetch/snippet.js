const startButton = document.querySelector('#start-fetch-button');
const statusEl = document.querySelector('#fetch-status');

startButton.addEventListener('click', async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const bgFetch = await registration.backgroundFetch.fetch(
      'demo-fetch',
      ['/manifest.webmanifest'],
      { title: 'Demo download', downloadTotal: 1000 },
    );
    statusEl.textContent = `Started background fetch "${bgFetch.id}"`;
  } catch (_err) {
    statusEl.textContent = 'Starting the background fetch failed in this browser.';
  }
});
