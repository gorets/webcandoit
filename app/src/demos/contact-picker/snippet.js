const pickButton = document.querySelector('#pick-contacts-button');
const output = document.querySelector('#contacts-output');

pickButton.addEventListener('click', async () => {
  try {
    const contacts = await navigator.contacts.select(['name', 'email', 'tel'], { multiple: true });
    output.textContent = contacts.length
      ? contacts.map((c) => c.name?.join(', ') || 'Unnamed contact').join('\n')
      : 'No contacts selected.';
  } catch (err) {
    if (err.name === 'AbortError') return;
    output.textContent =
      err.name === 'SecurityError'
        ? 'Contact access was blocked. This must run in a secure, user-activated context.'
        : 'Could not access contacts.';
  }
});
