const usageEl = document.querySelector('#storage-usage');
const persistButton = document.querySelector('#request-persist-button');

(async () => {
  try {
    const [estimate, isPersisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted(),
    ]);
    usageEl.textContent = `Usage: ${estimate.usage} / ${estimate.quota} bytes, persisted: ${isPersisted}`;
  } catch (_err) {
    usageEl.textContent = 'Could not read storage estimate in this browser.';
  }
})();

persistButton.addEventListener('click', async () => {
  try {
    const granted = await navigator.storage.persist();
    usageEl.textContent = granted
      ? 'Persistent storage granted.'
      : 'The browser declined to grant persistent storage right now.';
  } catch (err) {
    usageEl.textContent = `Requesting persistent storage failed: ${err.message}`;
  }
});
