const scanButton = document.querySelector('#nfc-scan-button');
const writeButton = document.querySelector('#nfc-write-button');
const output = document.querySelector('#nfc-output');

let controller = null;

scanButton.addEventListener('click', async () => {
  try {
    const reader = new NDEFReader();
    controller = new AbortController();

    reader.onreading = (event) => {
      const records = event.message.records.map((record) => {
        const view = record.data instanceof DataView ? record.data : new DataView(record.data);
        return new TextDecoder().decode(view);
      });
      output.textContent = `Serial: ${event.serialNumber || '(unknown)'} — ${records.join(', ')}`;
    };
    reader.onreadingerror = () => {
      output.textContent = 'Error reading an NFC tag. Try holding it steadier against the device.';
    };

    await reader.scan({ signal: controller.signal });
    output.textContent = 'Scanning for NFC tags. Bring a tag near the device.';
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});

writeButton.addEventListener('click', async () => {
  try {
    const reader = new NDEFReader();
    await reader.write('Hello from WebCanDoIt');
    output.textContent = 'Wrote text record to the tag.';
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
