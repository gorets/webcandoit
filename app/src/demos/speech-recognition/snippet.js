const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
const startButton = document.querySelector('#start-listening-button');
const stopButton = document.querySelector('#stop-listening-button');
const transcriptEl = document.querySelector('#transcript');

let recognition = null;

startButton.addEventListener('click', () => {
  if (!Ctor) {
    transcriptEl.textContent = 'Speech recognition is not available in this browser.';
    return;
  }

  recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? '';
      if (result.isFinal) final += transcript;
      else interim += transcript;
    }
    transcriptEl.textContent = final || interim;
  };

  recognition.onerror = (event) => {
    transcriptEl.textContent = `Speech recognition error: ${event.error}`;
  };

  recognition.start();
});

stopButton.addEventListener('click', () => {
  recognition?.stop();
});
