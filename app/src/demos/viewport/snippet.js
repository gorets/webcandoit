const status = document.querySelector('#viewport-status');
const viewport = window.visualViewport;

if (!viewport) {
  status.textContent = 'The Visual Viewport API is not available in this browser.';
} else {
  const update = () => {
    status.textContent = `width: ${viewport.width.toFixed(1)}, height: ${viewport.height.toFixed(1)}, scale: ${viewport.scale.toFixed(2)}x, offset: (${viewport.offsetLeft.toFixed(1)}, ${viewport.offsetTop.toFixed(1)})`;
  };

  update();
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
}
