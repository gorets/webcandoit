const textInput = document.querySelector('#crypto-plaintext');
const runButton = document.querySelector('#crypto-run');
const output = document.querySelector('#crypto-output');

let key = null;

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

runButton.addEventListener('click', async () => {
  try {
    key ??= await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(textInput.value);

    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    const decrypted = new TextDecoder().decode(decryptedBuffer);

    output.textContent = `Ciphertext (hex): ${toHex(new Uint8Array(ciphertext))}\nDecrypted: ${decrypted}`;
  } catch (err) {
    console.error('Encryption or decryption failed', err);
    output.textContent = 'Encryption or decryption failed.';
  }
});
