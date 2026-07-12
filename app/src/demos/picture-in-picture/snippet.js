const video = document.querySelector('#pip-video');
const enterButton = document.querySelector('#enter-pip-button');
const exitButton = document.querySelector('#exit-pip-button');
const output = document.querySelector('#pip-output');

video.addEventListener('enterpictureinpicture', () => {
  output.textContent = 'Video is floating in a Picture-in-Picture window.';
});
video.addEventListener('leavepictureinpicture', () => {
  output.textContent = 'Picture-in-Picture is inactive.';
});

enterButton.addEventListener('click', async () => {
  try {
    await video.requestPictureInPicture();
  } catch (err) {
    output.textContent = `Could not enter Picture-in-Picture: ${err.message}`;
  }
});

exitButton.addEventListener('click', async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
  } catch (err) {
    output.textContent = `Could not exit Picture-in-Picture: ${err.message}`;
  }
});
