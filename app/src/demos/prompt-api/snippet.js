const promptInput = document.querySelector('#prompt-input');
const startButton = document.querySelector('#prompt-start');
const sendButton = document.querySelector('#prompt-send');
const output = document.querySelector('#prompt-output');

let session;

startButton.addEventListener('click', async () => {
  const availability = await LanguageModel.availability();
  if (availability === 'unavailable') {
    output.textContent = 'The on-device model is not available on this device.';
    return;
  }

  session = await LanguageModel.create({
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', (e) => {
        output.textContent = `Downloading model… ${Math.round(e.loaded * 100)}%`;
      });
    },
  });
  output.textContent = 'Model ready — type a prompt and send it.';
});

sendButton.addEventListener('click', async () => {
  if (!session || !promptInput.value) return;
  try {
    output.textContent = await session.prompt(promptInput.value);
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
