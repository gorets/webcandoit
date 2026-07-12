const recordButton = document.querySelector('#record-button');
const stopButton = document.querySelector('#stop-button');
const playback = document.querySelector('#playback-audio');

let recorder;
let chunks = [];

recordButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      playback.src = URL.createObjectURL(blob);
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    recorder.start();
  } catch (err) {
    console.error('Could not start recording:', err);
  }
});

stopButton.addEventListener('click', () => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
});
