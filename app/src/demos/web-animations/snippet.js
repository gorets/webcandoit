const box = document.querySelector('#box');

const animation = box.animate(
  [
    { transform: 'translateX(0)' },
    { transform: 'translateX(220px)' },
    { transform: 'translateX(0)' },
  ],
  { duration: 2500, iterations: Infinity, easing: 'ease-in-out' },
);

// Full runtime control over the running animation:
document.querySelector('#pause').addEventListener('click', () => animation.pause());
document.querySelector('#play').addEventListener('click', () => animation.play());
document.querySelector('#faster').addEventListener('click', () => {
  animation.playbackRate *= 1.5;
});
