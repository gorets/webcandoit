const requestButton = document.querySelector('#serial-request-button');
const closeButton = document.querySelector('#serial-close-button');
const output = document.querySelector('#serial-output');

let port = null;

requestButton.addEventListener('click', async () => {
  try {
    port = await navigator.serial.requestPort();
    const info = port.getInfo();
    output.textContent = `Vendor: 0x${(info.usbVendorId ?? 0).toString(16)}, Product: 0x${(info.usbProductId ?? 0).toString(16)}`;

    await port.open({ baudRate: 9600 });
    const reader = port.readable.getReader();

    const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000));
    const result = await Promise.race([reader.read(), timeout]);

    if (result === 'timeout') {
      await reader.cancel();
      output.textContent += ' — no data received within 3 seconds.';
    } else if (!result.done) {
      output.textContent += ` — received: ${new TextDecoder().decode(result.value)}`;
    }
    reader.releaseLock();
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});

closeButton.addEventListener('click', async () => {
  await port?.close();
  port = null;
});
