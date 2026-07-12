const installButton = document.querySelector('#install-button');

installButton.addEventListener('click', async () => {
  try {
    const result = await navigator.install();
    console.log('Install requested successfully.', result?.url ?? '');
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.log('Install was cancelled.');
      return;
    }
    console.error('Could not complete the install request.', err);
  }
});
