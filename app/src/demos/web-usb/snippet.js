const requestButton = document.querySelector('#usb-request-button');
const openButton = document.querySelector('#usb-open-button');
const closeButton = document.querySelector('#usb-close-button');
const output = document.querySelector('#usb-output');

let device = null;

requestButton.addEventListener('click', async () => {
  try {
    device = await navigator.usb.requestDevice({ filters: [] });
    output.textContent = `${device.productName || '(unnamed device)'} — Vendor: 0x${device.vendorId.toString(16)}, Product: 0x${device.productId.toString(16)}`;
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});

openButton.addEventListener('click', async () => {
  try {
    await device?.open();
    output.textContent += ' — opened.';
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});

closeButton.addEventListener('click', async () => {
  try {
    await device?.close();
    output.textContent += ' — closed.';
  } catch (err) {
    output.textContent = `Error: ${err.message}`;
  }
});
