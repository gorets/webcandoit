const editor = document.querySelector('#fs-editor');
const openButton = document.querySelector('#fs-open');
const saveButton = document.querySelector('#fs-save');
const textFileTypes = [{ description: 'Text files', accept: { 'text/plain': ['.txt'] } }];
let fileHandle = null;

openButton.addEventListener('click', async () => {
  try {
    [fileHandle] = await window.showOpenFilePicker({ types: textFileTypes });
    const file = await fileHandle.getFile();
    editor.value = await file.text();
  } catch (err) {
    if (err.name !== 'AbortError') console.error('Could not open the file', err);
  }
});

saveButton.addEventListener('click', async () => {
  try {
    if (!fileHandle) {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: 'untitled.txt',
        types: textFileTypes,
      });
    }
    const writable = await fileHandle.createWritable();
    await writable.write(editor.value);
    await writable.close();
  } catch (err) {
    if (err.name !== 'AbortError') console.error('Could not save the file', err);
  }
});
