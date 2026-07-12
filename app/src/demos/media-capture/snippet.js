const video = document.querySelector('#video');
const startButton = document.querySelector('#start-camera-button');
const stopButton = document.querySelector('#stop-camera-button');
const statusEl = document.querySelector('#camera-status');

let stream = null;

startButton.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    statusEl.textContent = 'Camera is live.';
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      statusEl.textContent = 'Camera permission was denied.';
    } else if (err.name === 'NotFoundError') {
      statusEl.textContent = 'No camera was found on this device.';
    } else {
      statusEl.textContent = 'Could not start the camera.';
    }
  }
});

stopButton.addEventListener('click', () => {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
  stream = null;
  video.srcObject = null;
  statusEl.textContent = 'Camera is stopped.';
});
