const requestButton = document.querySelector('#hid-request');
const closeButton = document.querySelector('#hid-close');
const status = document.querySelector('#hid-status');

let openedDevice = null;

requestButton.addEventListener('click', async () => {
  try {
    const [device] = await navigator.hid.requestDevice({ filters: [] });
    if (!device) {
      status.textContent = 'No device selected.';
      return;
    }

    await device.open();
    openedDevice = device;
    status.textContent = `Opened "${device.productName || '(unnamed device)'}" — ${device.collections.length} report collection(s).`;
  } catch (err) {
    console.error('WebHID request failed', err);
    status.textContent = 'Could not open a HID device.';
  }
});

closeButton.addEventListener('click', async () => {
  try {
    await openedDevice?.close();
    status.textContent = 'Device closed.';
    openedDevice = null;
  } catch (err) {
    console.error('Could not close HID device', err);
  }
});
