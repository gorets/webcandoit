const startButton = document.querySelector('#start-idle-detection');
const stopButton = document.querySelector('#stop-idle-detection');
const status = document.querySelector('#idle-status');
let controller = null;

startButton.addEventListener('click', async () => {
  try {
    const permission = await IdleDetector.requestPermission();
    if (permission !== 'granted') {
      status.textContent = 'Permission to monitor idle state was not granted.';
      return;
    }

    controller = new AbortController();
    const detector = new IdleDetector();
    detector.addEventListener('change', () => {
      status.textContent = `User: ${detector.userState}, screen: ${detector.screenState}`;
    });

    await detector.start({ threshold: 60000, signal: controller.signal });
    status.textContent = `User: ${detector.userState}, screen: ${detector.screenState}`;
  } catch (err) {
    console.error('Failed to start idle detection', err);
  }
});

stopButton.addEventListener('click', () => {
  controller?.abort();
  controller = null;
  status.textContent = '';
});
