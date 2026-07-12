const fileInput = document.querySelector('#text-image-input');
const preview = document.querySelector('#text-preview');
const results = document.querySelector('#text-results');

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  preview.src = URL.createObjectURL(file);
  results.textContent = 'Detecting…';

  try {
    const bitmap = await createImageBitmap(file);
    const detector = new TextDetector();
    const detected = await detector.detect(bitmap);
    bitmap.close();
    results.textContent =
      detected.length === 0
        ? 'No text found in this image.'
        : detected.map((d) => d.rawValue).join(', ');
  } catch (err) {
    console.error('Text detection failed', err);
    results.textContent = 'Could not detect text in this image.';
  }
});
