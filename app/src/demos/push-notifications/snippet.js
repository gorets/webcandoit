const subscribeButton = document.querySelector('#subscribe-button');
const showLocalButton = document.querySelector('#show-local-button');
const output = document.querySelector('#push-output');

async function generatePlaceholderApplicationServerKey() {
  const keyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ]);
  const raw = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  return new Uint8Array(raw);
}

subscribeButton.addEventListener('click', async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      output.textContent = 'Notification permission was not granted.';
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const applicationServerKey = await generatePlaceholderApplicationServerKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    output.textContent = JSON.stringify(subscription.toJSON(), null, 2);
  } catch (err) {
    output.textContent = `Push subscription failed: ${err.message}`;
  }
});

showLocalButton.addEventListener('click', async () => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Push demo notification', {
    body: 'This is shown locally by the service worker — no server or push message involved.',
    tag: 'push-demo-local',
  });
});
