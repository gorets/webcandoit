window.addEventListener('gamepadconnected', (event) => {
  console.log('Connected:', event.gamepad.id);
});

// Gamepad state is a snapshot — poll it every frame.
function poll() {
  const pad = navigator.getGamepads().find((p) => p !== null);
  if (pad) {
    const pressed = pad.buttons.map((b, i) => (b.pressed ? i : null)).filter((i) => i !== null);
    if (pressed.length) console.log('Pressed buttons:', pressed);
    console.log('Left stick:', pad.axes[0].toFixed(2), pad.axes[1].toFixed(2));
  }
  requestAnimationFrame(poll);
}

requestAnimationFrame(poll);
