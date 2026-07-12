const statusEl = document.querySelector('#orientation-status');
const lockButton = document.querySelector('#lock-portrait-button');
const unlockButton = document.querySelector('#unlock-button');

function render() {
  statusEl.textContent = `Type: ${screen.orientation.type}, Angle: ${screen.orientation.angle}°`;
}

render();
screen.orientation.addEventListener('change', render);

lockButton.addEventListener('click', async () => {
  try {
    await screen.orientation.lock('portrait');
  } catch (err) {
    statusEl.textContent = `${err.message} (orientation lock usually requires fullscreen mode, and is restricted on many platforms).`;
  }
});

unlockButton.addEventListener('click', () => {
  try {
    screen.orientation.unlock();
  } catch (err) {
    statusEl.textContent = err.message;
  }
});
