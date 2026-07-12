const samplePayload = {
  web_push: 8030,
  notification: {
    title: 'Example Notification',
    body: 'This is an example notification body.',
    icon: 'icon.png',
    navigate: 'https://example.com',
  },
};

const output = document.querySelector('#push-support');
output.textContent = `Push API present in this browser: ${'PushManager' in window ? 'yes' : 'no'}`;

const payloadEl = document.querySelector('#push-payload');
payloadEl.textContent = JSON.stringify(samplePayload, null, 2);
