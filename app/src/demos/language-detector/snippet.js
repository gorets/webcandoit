const textInput = document.querySelector('#language-detector-input');
const detectButton = document.querySelector('#language-detector-run');
const output = document.querySelector('#language-detector-output');

let detector;

detectButton.addEventListener('click', async () => {
  try {
    if (!detector) {
      const availability = await LanguageDetector.availability();
      if (availability === 'unavailable') {
        output.textContent = 'The on-device language model is not available on this device.';
        return;
      }
      detector = await LanguageDetector.create({
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (e) => {
            output.textContent = `Downloading model… ${Math.round(e.loaded * 100)}%`;
          });
        },
      });
    }

    const results = await detector.detect(textInput.value);
    output.textContent = results
      .slice(0, 5)
      .map((r) => `${r.detectedLanguage} (${Math.round(r.confidence * 100)}%)`)
      .join(', ');
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
