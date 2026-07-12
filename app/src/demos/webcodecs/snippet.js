const startButton = document.querySelector('#encode-button');
const canvas = document.querySelector('#encode-canvas');
const ctx = canvas.getContext('2d');

const FRAME_COUNT = 30;
const FRAME_RATE = 30;

startButton.addEventListener('click', () => {
  let chunkCount = 0;
  let totalBytes = 0;

  const encoder = new VideoEncoder({
    output: (chunk) => {
      chunkCount += 1;
      totalBytes += chunk.byteLength;
      console.log(`Chunk ${chunkCount} (${chunk.type}), total bytes: ${totalBytes}`);
    },
    error: (err) => console.error('Video encoding failed.', err),
  });

  encoder.configure({
    codec: 'vp8',
    width: canvas.width,
    height: canvas.height,
    bitrate: 500_000,
    framerate: FRAME_RATE,
  });

  let frameIndex = 0;
  function encodeNextFrame() {
    if (frameIndex >= FRAME_COUNT) {
      encoder.flush().then(() => encoder.close());
      return;
    }

    ctx.fillStyle = '#101826';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frame = new VideoFrame(canvas, {
      timestamp: Math.round((frameIndex * 1_000_000) / FRAME_RATE),
    });
    try {
      encoder.encode(frame, { keyFrame: frameIndex === 0 });
    } finally {
      frame.close();
    }

    frameIndex += 1;
    requestAnimationFrame(encodeNextFrame);
  }

  requestAnimationFrame(encodeNextFrame);
});
