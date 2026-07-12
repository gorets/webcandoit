const startButton = document.querySelector('#start-casting-button');
const stopButton = document.querySelector('#stop-casting-button');
const output = document.querySelector('#presentation-output');

const RECEIVER_URL = 'https://example.com/receiver.html';
const request = new PresentationRequest([RECEIVER_URL]);
let connection = null;

request.getAvailability().then((availability) => {
  output.textContent = availability.value
    ? 'A casting device is available nearby.'
    : 'No casting devices detected nearby.';
  availability.addEventListener('change', () => {
    output.textContent = availability.value
      ? 'A casting device is available nearby.'
      : 'No casting devices detected nearby.';
  });
});

startButton.addEventListener('click', async () => {
  try {
    connection = await request.start();
    output.textContent = 'Connected to a presentation display.';
    connection.addEventListener('close', () => (output.textContent = 'Presentation closed.'));
    connection.addEventListener(
      'terminate',
      () => (output.textContent = 'Presentation terminated.'),
    );
  } catch (err) {
    output.textContent = `Could not start a presentation session: ${err.message}`;
  }
});

stopButton.addEventListener('click', () => {
  connection?.terminate();
  connection = null;
});
