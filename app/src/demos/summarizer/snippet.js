const textInput = document.querySelector('#summarizer-input');
const lengthSelect = document.querySelector('#summarizer-length');
const summarizeButton = document.querySelector('#summarizer-run');
const output = document.querySelector('#summarizer-output');

summarizeButton.addEventListener('click', async () => {
  const availability = await Summarizer.availability();
  if (availability === 'unavailable') {
    output.textContent = 'Summarizer is not available on this device.';
    return;
  }

  output.textContent = 'Summarizing…';

  const summarizer = await Summarizer.create({
    type: 'tldr',
    format: 'plain-text',
    length: lengthSelect.value, // 'short' | 'medium' | 'long'
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        output.textContent = `Downloading model… ${Math.round(e.loaded * 100)}%`;
      });
    },
  });

  output.textContent = await summarizer.summarize(textInput.value);
  summarizer.destroy();
});
