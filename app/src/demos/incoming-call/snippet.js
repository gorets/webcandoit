const simulateButton = document.querySelector('#simulate-call');

simulateButton.addEventListener('click', async () => {
  try {
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      console.warn('Notification permission was not granted.');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Incoming call', {
      body: 'Alice is calling…',
      requireInteraction: true,
      tag: 'call',
      renotify: true,
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' },
      ],
    });
  } catch (err) {
    console.error('Could not show call notification', err);
  }
});
