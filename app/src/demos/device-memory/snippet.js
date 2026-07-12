const output = document.querySelector('#device-memory-output');
const memory = navigator.deviceMemory;

output.textContent =
  memory === undefined
    ? 'Device memory information is not available in this browser.'
    : `Approximate device memory: ${memory} GB (rounded to the nearest power of two for privacy).`;
