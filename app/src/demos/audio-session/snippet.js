const select = document.querySelector('#audio-session-type');
const statusEl = document.querySelector('#audio-session-status');

const session = navigator.audioSession;

function updateStatus() {
  statusEl.textContent = `Type: ${session.type} · State: ${session.state}`;
}

if (session) {
  select.value = session.type;
  updateStatus();
  session.addEventListener('statechange', updateStatus);

  select.addEventListener('change', () => {
    try {
      session.type = select.value;
      updateStatus();
    } catch (err) {
      console.error('Could not set the audio session type:', err);
    }
  });
} else {
  statusEl.textContent = 'The Audio Session API is not available in this browser.';
}
