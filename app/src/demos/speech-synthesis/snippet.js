const textArea = document.querySelector('#speech-text');
const voiceSelect = document.querySelector('#voice-select');
const speakButton = document.querySelector('#speak-button');
const stopButton = document.querySelector('#stop-speaking-button');

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = voices
    .map((voice) => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
    .join('');
}

loadVoices();
speechSynthesis.addEventListener('voiceschanged', loadVoices);

speakButton.addEventListener('click', () => {
  if (!textArea.value.trim()) return;
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textArea.value);
    const chosenVoice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name === voiceSelect.value);
    if (chosenVoice) utterance.voice = chosenVoice;
    speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Could not start speech synthesis.', err);
  }
});

stopButton.addEventListener('click', () => {
  speechSynthesis.cancel();
});
