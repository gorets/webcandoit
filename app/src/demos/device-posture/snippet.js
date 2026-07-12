const output = document.querySelector('#posture-output');
const devicePosture = navigator.devicePosture;

if (!devicePosture) {
  output.textContent = 'The Device Posture API is not available in this browser.';
} else {
  const update = () => {
    output.textContent = `Current posture: ${devicePosture.type}`;
  };
  update();
  devicePosture.addEventListener('change', update);
}
