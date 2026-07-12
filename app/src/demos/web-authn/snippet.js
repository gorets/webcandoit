const registerButton = document.querySelector('#webauthn-register');
const signInButton = document.querySelector('#webauthn-signin');
const status = document.querySelector('#webauthn-status');

function randomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

registerButton.addEventListener('click', async () => {
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: 'WebCanDoIt' },
        user: {
          id: randomBytes(16),
          name: 'demo-user@whatpwacando.today',
          displayName: 'Demo User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        timeout: 60000,
        attestation: 'none',
      },
    });
    status.textContent = `Passkey created: ${credential.id}`;
  } catch (err) {
    console.error('Could not create a passkey', err);
    status.textContent = 'Could not create a passkey.';
  }
});

signInButton.addEventListener('click', async () => {
  try {
    const credential = await navigator.credentials.get({
      publicKey: { challenge: randomBytes(32), timeout: 60000 },
    });
    status.textContent = `Got assertion: ${credential.id}`;
  } catch (err) {
    console.error('Could not get an assertion', err);
    status.textContent = 'Could not get an assertion.';
  }
});
