const output = document.querySelector('#wco-output');

function update() {
  const overlay = navigator.windowControlsOverlay;
  const rect = overlay.getTitlebarAreaRect();
  output.textContent = `Overlay visible: ${overlay.visible} — rect: ${JSON.stringify(rect)}`;
}

update();
navigator.windowControlsOverlay.addEventListener('geometrychange', update);
