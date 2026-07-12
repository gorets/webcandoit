const KNOWN_KEYS = ['title', 'text', 'url'];
const output = document.querySelector('#share-target-output');

const params = new URLSearchParams(window.location.search);
const received = {};
for (const key of KNOWN_KEYS) {
  const value = params.get(key);
  if (value) received[key] = value;
}
for (const [key, value] of params.entries()) {
  if (!KNOWN_KEYS.includes(key)) received[key] = value;
}

output.textContent =
  Object.keys(received).length > 0
    ? `Shared data found: ${JSON.stringify(received)}`
    : 'No shared data in the URL right now. Try ?title=Hello&text=World&url=https://example.com';
