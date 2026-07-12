const pickButton = document.querySelector('#pick-color');
const swatch = document.querySelector('#color-swatch');

pickButton.addEventListener('click', async () => {
  try {
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    swatch.style.background = result.sRGBHex;
    swatch.textContent = result.sRGBHex;
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Could not pick a color', err);
    }
  }
});
