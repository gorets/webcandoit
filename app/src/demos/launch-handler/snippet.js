const statusEl = document.querySelector('#launch-status');

if ('launchQueue' in window) {
  let launchCount = 0;
  window.launchQueue.setConsumer((launchParams) => {
    launchCount += 1;
    statusEl.textContent = `Observed ${launchCount} launch(es). Latest target URL: ${launchParams.targetURL}`;
  });
}
