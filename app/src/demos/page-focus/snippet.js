const stateEl = document.querySelector('#focus-state');
const focusCountEl = document.querySelector('#focus-count');
const blurCountEl = document.querySelector('#blur-count');

let focusCount = 0;
let blurCount = 0;

window.addEventListener('focus', () => {
  focusCount += 1;
  stateEl.textContent = 'focused';
  focusCountEl.textContent = String(focusCount);
});

window.addEventListener('blur', () => {
  blurCount += 1;
  stateEl.textContent = 'not focused';
  blurCountEl.textContent = String(blurCount);
});

// document.hasFocus() gives the current state without waiting for an event.
stateEl.textContent = document.hasFocus() ? 'focused' : 'not focused';
