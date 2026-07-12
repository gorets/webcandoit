const surface = document.querySelector('#touch-surface');
const statusEl = document.querySelector('#touch-status');

const PALETTE = ['#ff6b6b', '#4dabf7', '#69db7c', '#ffd43b', '#da77f2', '#ff922b', '#38d9a9'];
const dots = new Map();

function colorForPointer(pointerId) {
  return PALETTE[Math.abs(pointerId) % PALETTE.length];
}

function updateDot(event) {
  const rect = surface.getBoundingClientRect();
  let dot = dots.get(event.pointerId);
  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'touch-dot';
    dot.style.background = colorForPointer(event.pointerId);
    dot.style.position = 'absolute';
    surface.append(dot);
    dots.set(event.pointerId, dot);
  }
  dot.style.left = `${event.clientX - rect.left}px`;
  dot.style.top = `${event.clientY - rect.top}px`;
  statusEl.textContent = `Active pointers: ${dots.size}`;
}

function removeDot(event) {
  dots.get(event.pointerId)?.remove();
  dots.delete(event.pointerId);
  statusEl.textContent = `Active pointers: ${dots.size}`;
}

surface.addEventListener('pointerdown', (event) => {
  surface.setPointerCapture(event.pointerId);
  updateDot(event);
});
surface.addEventListener('pointermove', (event) => {
  if (!dots.has(event.pointerId)) return;
  updateDot(event);
});
surface.addEventListener('pointerup', removeDot);
surface.addEventListener('pointercancel', removeDot);
