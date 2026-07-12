const fileInput = document.querySelector('#barcode-image-input');
const resultsEl = document.querySelector('#barcode-results');

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  resultsEl.textContent = 'Detecting…';
  try {
    const bitmap = await createImageBitmap(file);
    const detector = new BarcodeDetector();
    const detected = await detector.detect(bitmap);
    bitmap.close();

    resultsEl.textContent = detected.length
      ? detected.map((d) => `${d.format}: ${d.rawValue}`).join('\n')
      : 'No barcodes found in this image.';
  } catch (_err) {
    resultsEl.textContent = 'Could not detect barcodes in this image. Try a different image.';
  }
});
