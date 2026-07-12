const countInput = document.querySelector('#badge-count');
const setButton = document.querySelector('#set-badge-button');
const clearButton = document.querySelector('#clear-badge-button');

setButton.addEventListener('click', async () => {
  try {
    await navigator.setAppBadge(Number(countInput.value) || 0);
  } catch (err) {
    console.error('Could not set the app badge:', err);
  }
});

clearButton.addEventListener('click', async () => {
  try {
    await navigator.clearAppBadge();
  } catch (err) {
    console.error('Could not clear the app badge:', err);
  }
});
