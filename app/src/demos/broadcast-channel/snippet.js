const channel = new BroadcastChannel('my-app-channel');
const input = document.querySelector('#message');
const log = document.querySelector('#log');

// Messages from other tabs/windows of the same origin arrive here.
channel.onmessage = (event) => {
  const li = document.createElement('li');
  li.textContent = `received: ${event.data}`;
  log.prepend(li);
};

document.querySelector('#send').addEventListener('click', () => {
  channel.postMessage(input.value);
  input.value = '';
});

// Remember to close the channel when done: channel.close();
