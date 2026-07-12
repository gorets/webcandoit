const textArea = document.querySelector('#clipboard-text');
const writeButton = document.querySelector('#copy-text-button');
const readButton = document.querySelector('#paste-text-button');
const copyImageButton = document.querySelector('#copy-image-button');
const output = document.querySelector('#clipboard-output');

writeButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(textArea.value);
    output.textContent = 'Text copied to clipboard.';
  } catch (err) {
    output.textContent = `Clipboard write failed: ${err.message}`;
  }
});

readButton.addEventListener('click', async () => {
  try {
    const value = await navigator.clipboard.readText();
    output.textContent = `Clipboard contents: ${value || '(empty)'}`;
  } catch (err) {
    output.textContent = `Clipboard read failed: ${err.message}`;
  }
});

copyImageButton.addEventListener('click', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 200, 200);
  gradient.addColorStop(0, '#6c5ce7');
  gradient.addColorStop(1, '#00cec9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.fillText('PWA', 70, 105);

  try {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    output.textContent = 'Image copied to clipboard.';
  } catch (err) {
    output.textContent = `Clipboard image copy failed: ${err.message}`;
  }
});
