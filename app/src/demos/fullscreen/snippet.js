const box = document.querySelector('#fullscreen-box');
const enterButton = document.querySelector('#enter-fullscreen');
const exitButton = document.querySelector('#exit-fullscreen');
const status = document.querySelector('#fullscreen-status');

document.addEventListener('fullscreenchange', () => {
  status.textContent = document.fullscreenElement === box ? 'Fullscreen: Yes' : 'Fullscreen: No';
});

enterButton.addEventListener('click', async () => {
  try {
    await box.requestFullscreen();
  } catch (err) {
    console.error('Failed to enter fullscreen', err);
  }
});

exitButton.addEventListener('click', async () => {
  try {
    await document.exitFullscreen();
  } catch (err) {
    console.error('Failed to exit fullscreen', err);
  }
});
