const lockBox = document.querySelector('#pointer-lock-box');
const unlockButton = document.querySelector('#pointer-unlock-button');
const statusEl = document.querySelector('#pointer-status');

document.addEventListener('keydown', (event) => {
  const modifiers = [
    event.ctrlKey && 'Ctrl',
    event.shiftKey && 'Shift',
    event.altKey && 'Alt',
    event.metaKey && 'Meta',
  ].filter(Boolean);
  console.log(`key=${event.key} code=${event.code} modifiers=${modifiers.join('+') || 'none'}`);
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === lockBox;
  statusEl.textContent = locked ? 'Pointer locked' : 'Pointer unlocked';
});

document.addEventListener('pointerlockerror', () => {
  statusEl.textContent = 'Pointer lock request failed.';
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement !== lockBox) return;
  statusEl.textContent = `movementX=${event.movementX}, movementY=${event.movementY}`;
});

lockBox.addEventListener('click', async () => {
  try {
    await lockBox.requestPointerLock();
  } catch (err) {
    statusEl.textContent = err.message || 'Could not lock the pointer.';
  }
});

unlockButton.addEventListener('click', () => {
  document.exitPointerLock();
});
