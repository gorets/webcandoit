const startButton = document.querySelector('#start-motion-button');
const output = document.querySelector('#motion-output');

startButton.addEventListener('click', async () => {
  const handleEvent = (event) => {
    const a = event.acceleration || {};
    const r = event.rotationRate || {};
    output.textContent =
      `acceleration x:${a.x?.toFixed(2)} y:${a.y?.toFixed(2)} z:${a.z?.toFixed(2)} | ` +
      `rotation α:${r.alpha?.toFixed(2)} β:${r.beta?.toFixed(2)} γ:${r.gamma?.toFixed(2)}`;
  };

  try {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== 'granted') {
        output.textContent = 'Permission to access device motion was denied.';
        return;
      }
    }
    window.addEventListener('devicemotion', handleEvent);
  } catch (err) {
    output.textContent = `Could not start device motion tracking: ${err.message}`;
  }
});
