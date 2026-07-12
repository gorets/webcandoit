const statusEl = document.querySelector('#network-status');

const connection = navigator.connection;

if (!connection) {
  statusEl.textContent = 'The Network Information API is not available in this browser.';
} else {
  function update() {
    statusEl.textContent =
      `Effective type: ${connection.effectiveType ?? 'unknown'}, ` +
      `Downlink: ${connection.downlink ?? 0} Mbps, ` +
      `RTT: ${connection.rtt ?? 0} ms, ` +
      `Data saver: ${connection.saveData ? 'On' : 'Off'}`;
  }

  update();
  connection.addEventListener('change', update);
}
