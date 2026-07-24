const HANDLE = 'my-app:capture-handle-demo';

// 1. A page advertises a handle so it can be recognised when captured.
navigator.mediaDevices.setCaptureHandleConfig({
  handle: HANDLE,
  exposeOrigin: true,
  permittedOrigins: ['*'],
});

// 2. The capturing side reads the handle back from the video track.
document.querySelector('#start-capture').addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const [track] = stream.getVideoTracks();

  function readHandle() {
    const captureHandle = track.getCaptureHandle();
    if (captureHandle?.handle === HANDLE) {
      console.log('Capturing my own tab, origin:', captureHandle.origin);
    } else {
      console.log('Capturing something else:', captureHandle);
    }
  }

  track.addEventListener('capturehandlechange', readHandle);
  readHandle();
});
