const openButton = document.querySelector('#open-pip-button');
const closeButton = document.querySelector('#close-pip-button');
const content = document.querySelector('#pip-content');
const placeholder = document.querySelector('#pip-placeholder');
let pipWindow = null;

openButton.addEventListener('click', async () => {
  try {
    pipWindow = await documentPictureInPicture.requestWindow({ width: 320, height: 220 });
    pipWindow.document.body.style.margin = '0';
    pipWindow.document.body.style.background = '#101018';
    pipWindow.document.body.style.color = '#e6e6f0';
    pipWindow.document.body.appendChild(content);
    pipWindow.addEventListener('pagehide', () => {
      placeholder.appendChild(content);
      pipWindow = null;
    });
  } catch (err) {
    console.error('Could not open the Picture-in-Picture window', err);
  }
});

closeButton.addEventListener('click', () => {
  pipWindow?.close();
});
