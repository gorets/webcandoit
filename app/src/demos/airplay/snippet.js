const video = document.querySelector('#cast-video');
const castButton = document.querySelector('#cast-button');
const statusEl = document.querySelector('#cast-status');

if (video.remote) {
  video.remote
    .watchAvailability((isAvailable) => {
      statusEl.textContent = isAvailable
        ? 'A remote playback device is available.'
        : 'No remote playback device detected.';
    })
    .catch(() => {});

  video.remote.addEventListener('connect', () => {
    statusEl.textContent = 'Connected to a remote playback device.';
  });
  video.remote.addEventListener('disconnect', () => {
    statusEl.textContent = 'Disconnected from remote playback device.';
  });
}

castButton.addEventListener('click', async () => {
  try {
    if (typeof video.webkitShowPlaybackTargetPicker === 'function') {
      video.webkitShowPlaybackTargetPicker();
    } else if (video.remote) {
      await video.remote.prompt();
    } else {
      statusEl.textContent = 'No remote playback picker is available in this browser.';
    }
  } catch (err) {
    statusEl.textContent =
      err.name === 'NotFoundError'
        ? 'No AirPlay or casting devices were found.'
        : 'Could not open the casting device picker.';
  }
});
