const video = document.querySelector('#screen-capture-video');
const startButton = document.querySelector('#start-capture-button');
const stopButton = document.querySelector('#stop-capture-button');
let stream = null;

function stopStream() {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
  stream = null;
  video.srcObject = null;
}

startButton.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    video.srcObject = stream;
    for (const track of stream.getVideoTracks()) {
      track.addEventListener('ended', stopStream);
    }
  } catch (err) {
    console.error('Could not start screen capture:', err.message);
  }
});

stopButton.addEventListener('click', stopStream);
