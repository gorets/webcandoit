const showButton = document.querySelector('#vk-show');
const hideButton = document.querySelector('#vk-hide');
const status = document.querySelector('#vk-status');

const keyboard = navigator.virtualKeyboard;

try {
  keyboard.overlaysContent = true;
} catch (err) {
  console.error('Could not enable content overlay', err);
}

const update = () => {
  const rect = keyboard.boundingRect;
  status.textContent = rect.height > 0 ? `open: ${JSON.stringify(rect)}` : 'closed';
};

update();
keyboard.addEventListener('geometrychange', update);

showButton.addEventListener('click', () => keyboard.show());
hideButton.addEventListener('click', () => keyboard.hide());
