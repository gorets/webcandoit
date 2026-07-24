// Query a permission's state without showing a prompt.
const status = await navigator.permissions.query({ name: 'geolocation' });

console.log(status.state); // 'granted' | 'denied' | 'prompt'

// Stay in sync when the user changes the setting later.
status.addEventListener('change', () => {
  console.log('geolocation is now', status.state);
});
