const list = document.querySelector('#device-list');

async function refresh() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  list.innerHTML = '';
  for (const device of devices) {
    const li = document.createElement('li');
    // device.label is empty until the user grants camera/mic permission.
    li.textContent = `${device.kind}: ${device.label || '(label hidden)'}`;
    list.append(li);
  }
}

// Reveal labels by requesting permission once.
document.querySelector('#grant').addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  stream.getTracks().forEach((track) => {
    track.stop();
  });
  refresh();
});

// The list changes when devices are plugged in or removed.
navigator.mediaDevices.addEventListener('devicechange', refresh);

refresh();
