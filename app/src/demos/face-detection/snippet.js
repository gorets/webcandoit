const fileInput = document.querySelector('#face-image-input');
const preview = document.querySelector('#face-preview');
const status = document.querySelector('#face-status');

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  preview.src = URL.createObjectURL(file);
  status.textContent = 'Detecting…';

  try {
    const bitmap = await createImageBitmap(file);
    const detector = new FaceDetector({ fastMode: true });
    const faces = await detector.detect(bitmap);
    bitmap.close();
    status.textContent =
      faces.length === 0 ? 'No faces found in this image.' : `Found ${faces.length} face(s).`;
  } catch (err) {
    console.error('Face detection failed', err);
    status.textContent = 'Could not detect faces in this image.';
  }
});
