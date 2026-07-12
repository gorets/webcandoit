const textInput = document.querySelector('#translator-input');
const sourceSelect = document.querySelector('#translator-source');
const targetSelect = document.querySelector('#translator-target');
const translateButton = document.querySelector('#translator-run');
const output = document.querySelector('#translator-output');

let translator = null;
let translatorPair = null;

translateButton.addEventListener('click', async () => {
  const sourceLanguage = sourceSelect.value;
  const targetLanguage = targetSelect.value;
  const pair = `${sourceLanguage}:${targetLanguage}`;

  if (!translator || translatorPair !== pair) {
    translator?.destroy();

    const availability = await Translator.availability({ sourceLanguage, targetLanguage });
    if (availability === 'unavailable') {
      output.textContent = 'This language pair is not supported on-device.';
      return;
    }

    translator = await Translator.create({
      sourceLanguage,
      targetLanguage,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          output.textContent = `Downloading model… ${Math.round(e.loaded * 100)}%`;
        });
      },
    });
    translatorPair = pair;
  }

  output.textContent = await translator.translate(textInput.value);
});
