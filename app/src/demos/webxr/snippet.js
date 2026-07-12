const vrButton = document.querySelector('#xr-vr-button');
const arButton = document.querySelector('#xr-ar-button');
const endButton = document.querySelector('#xr-end-button');

let session = null;

Promise.all([
  navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
  navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
]).then(([vrSupported, arSupported]) => {
  vrButton.disabled = !vrSupported;
  arButton.disabled = !arSupported;
});

async function startSession(mode) {
  try {
    session = await navigator.xr.requestSession(mode);
    session.addEventListener('end', () => {
      session = null;
      console.log('Session ended.');
    });
    console.log(`${mode} session active.`);
  } catch (err) {
    console.error('Could not start XR session.', err);
  }
}

vrButton.addEventListener('click', () => startSession('immersive-vr'));
arButton.addEventListener('click', () => startSession('immersive-ar'));
endButton.addEventListener('click', () => session?.end());
