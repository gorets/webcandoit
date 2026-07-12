const container = document.querySelector('#box-container');
const shuffleButton = document.querySelector('#shuffle-button');

shuffleButton.addEventListener('click', () => {
  const apply = () => container.append(container.firstElementChild);

  if (!document.startViewTransition) {
    apply();
    return;
  }

  try {
    document.startViewTransition(apply);
  } catch (err) {
    console.error('View transition failed, applying instantly', err);
    apply();
  }
});
