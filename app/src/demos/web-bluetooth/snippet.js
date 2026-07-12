const requestButton = document.querySelector('#bluetooth-request');
const status = document.querySelector('#bluetooth-status');

requestButton.addEventListener('click', async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service'],
    });
    status.textContent = `Selected ${device.name ?? '(unnamed device)'}. Connecting…`;

    const server = await device.gatt.connect();
    status.textContent = 'Connected via GATT.';

    try {
      const service = await server.getPrimaryService('battery_service');
      const characteristic = await service.getCharacteristic('battery_level');
      const value = await characteristic.readValue();
      status.textContent = `Battery level: ${value.getUint8(0)}%`;
    } catch {
      status.textContent = 'Connected, but no battery service was found on this device.';
    }
  } catch (err) {
    console.error('Web Bluetooth request failed', err);
    status.textContent = 'Could not connect to a Bluetooth device.';
  }
});
