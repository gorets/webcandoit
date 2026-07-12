const output = document.querySelector('#pressure-state');

if (typeof PressureObserver === 'undefined') {
  output.textContent = 'The Compute Pressure API is not available in this browser.';
} else {
  const observer = new PressureObserver((records) => {
    const latest = records[records.length - 1];
    if (latest) output.textContent = `CPU pressure: ${latest.state}`;
  });

  observer.observe('cpu').catch(() => {
    output.textContent = 'Could not start monitoring CPU pressure.';
  });
}
