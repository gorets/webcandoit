const video = document.querySelector('#capture-preview');
const target = document.querySelector('#capture-target');
const startButton = document.querySelector('#start-capture');
const stopButton = document.querySelector('#stop-capture');
let stream = null;

function stopCapture() {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
  stream = null;
  video.srcObject = null;
}

startButton.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  } catch (err) {
    console.error('Could not start screen capture', err);
    return;
  }

  video.srcObject = stream;
  const [videoTrack] = stream.getVideoTracks();
  videoTrack.addEventListener('ended', stopCapture);

  if (
    typeof videoTrack.restrictTo !== 'function' ||
    typeof RestrictionTarget?.fromElement !== 'function'
  ) {
    console.warn('Element Capture is not available on this stream or browser.');
    return;
  }

  try {
    const restrictionTarget = await RestrictionTarget.fromElement(target);
    await videoTrack.restrictTo(restrictionTarget);
  } catch (err) {
    console.error('Failed to restrict capture to the target element', err);
  }
});

stopButton.addEventListener('click', stopCapture);
