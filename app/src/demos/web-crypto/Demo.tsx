import { useRef, useState } from 'react';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export default function WebCryptoDemo() {
  const [plaintext, setPlaintext] = useState('The quick brown fox jumps over the lazy dog.');
  const [ivHex, setIvHex] = useState<string | null>(null);
  const [cipherHex, setCipherHex] = useState<string | null>(null);
  const [cipherBase64, setCipherBase64] = useState<string | null>(null);
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [matches, setMatches] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);

  const getKey = async (): Promise<CryptoKey> => {
    if (!keyRef.current) {
      keyRef.current = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
      ]);
    }
    return keyRef.current;
  };

  const run = async () => {
    setError(null);
    setDecrypted(null);
    setMatches(null);
    try {
      const key = await getKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const data = new TextEncoder().encode(plaintext);

      const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
      const cipherBytes = new Uint8Array(ciphertext);
      setIvHex(toHex(iv));
      setCipherHex(toHex(cipherBytes));
      setCipherBase64(toBase64(cipherBytes));

      const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      setDecrypted(decryptedText);
      setMatches(decryptedText === plaintext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption or decryption failed.');
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        A fresh AES-256-GCM key is generated once per session, kept only in memory. Each run uses a
        new random 96-bit IV to encrypt the text below, then decrypts it back to prove the
        round-trip works.
      </p>
      <label>
        Plaintext
        <textarea
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          rows={4}
          style={{ display: 'block', width: '100%', maxWidth: '480px' }}
        />
      </label>
      <p>
        <button type="button" onClick={run}>
          Encrypt, then decrypt
        </button>
      </p>
      {cipherHex && (
        <div role="status" style={{ wordBreak: 'break-all' }}>
          <p>
            IV (hex): <code>{ivHex}</code>
          </p>
          <p>
            Ciphertext (hex): <code>{cipherHex}</code>
          </p>
          <p>
            Ciphertext (base64): <code>{cipherBase64}</code>
          </p>
          <p>
            Decrypted: <code>{decrypted}</code>
          </p>
          <p style={{ color: matches ? 'var(--accent)' : 'var(--danger)' }}>
            {matches ? 'Round-trip matches the original text.' : 'Round-trip did NOT match.'}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
