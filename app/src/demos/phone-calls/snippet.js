const phoneInput = document.querySelector('#phone-input');
const messageInput = document.querySelector('#sms-message-input');
const callLink = document.querySelector('#call-link');
const textLink = document.querySelector('#text-link');

function sanitize(value) {
  const trimmed = value.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D/g, '');
}

function updateLinks() {
  const sanitized = sanitize(phoneInput.value);
  callLink.href = `tel:${sanitized}`;
  textLink.href = `sms:${sanitized}?body=${encodeURIComponent(messageInput.value)}`;
}

phoneInput.addEventListener('input', updateLinks);
messageInput.addEventListener('input', updateLinks);
updateLinks();
