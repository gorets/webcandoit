const pulseButton = document.querySelector('#vibrate-pulse');
const patternButton = document.querySelector('#vibrate-pattern');

pulseButton.addEventListener('click', () => navigator.vibrate(200));
patternButton.addEventListener('click', () => navigator.vibrate([100, 50, 100, 50, 300]));
