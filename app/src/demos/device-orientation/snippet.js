const startButton = document.querySelector('#start-orientation-button');
const output = document.querySelector('#orientation-output');

startButton.addEventListener('click', async () => {
  const handleEvent = (event) => {
    output.textContent = `alpha:${event.alpha?.toFixed(1)} beta:${event.beta?.toFixed(1)} gamma:${event.gamma?.toFixed(1)}`;
  };

  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') {
        output.textContent = 'Permission to access device orientation was denied.';
        return;
      }
    }
    window.addEventListener('deviceorientation', handleEvent);
  } catch (err) {
    output.textContent = `Could not start device orientation tracking: ${err.message}`;
  }
});
