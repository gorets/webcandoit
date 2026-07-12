const requestButton = document.querySelector('#screens-request-button');
const output = document.querySelector('#screens-output');

console.log('Multi-screen environment detected:', screen.isExtended ?? false);

requestButton.addEventListener('click', async () => {
  try {
    const details = await window.getScreenDetails();
    const render = () =>
      (output.textContent = details.screens
        .map((s) => `${s.label}: ${s.width}x${s.height} (${s.isPrimary ? 'primary' : 'secondary'})`)
        .join('\n'));

    render();
    details.addEventListener('screenschange', render);
  } catch (err) {
    output.textContent =
      err.name === 'NotAllowedError'
        ? 'Permission to view display information was denied.'
        : `Error: ${err.message}`;
  }
});
