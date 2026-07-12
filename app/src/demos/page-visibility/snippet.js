const stateEl = document.querySelector('#visibility-state');
const hiddenCountEl = document.querySelector('#hidden-count');

let hiddenCount = 0;

document.addEventListener('visibilitychange', () => {
  stateEl.textContent = document.visibilityState;
  if (document.visibilityState === 'hidden') {
    hiddenCount += 1;
    hiddenCountEl.textContent = String(hiddenCount);
  }
});

stateEl.textContent = document.visibilityState;
