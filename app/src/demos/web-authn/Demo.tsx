import { useState } from 'react';

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(length));
  crypto.getRandomValues(bytes);
  return bytes;
}

function describeError(err: unknown, fallback: string): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError') {
      return 'Cancelled or not allowed — the ceremony was dismissed, timed out, or blocked.';
    }
    return `${err.name}: ${err.message}`;
  }
  return err instanceof Error ? err.message : fallback;
}

export default function WebAuthnDemo() {
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [assertionId, setAssertionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const register = async () => {
    setError(null);
    setStatus(null);
    try {
      const publicKey: PublicKeyCredentialCreationOptions = {
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
      };

      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        setError('No credential was created.');
        return;
      }
      setCredentialId(credential.id);
      setStatus(
        'Passkey created locally. This is a client-only demo — nothing was sent to a server.',
      );
    } catch (err) {
      setError(describeError(err, 'Could not create a passkey.'));
    }
  };

  const getAssertion = async () => {
    setError(null);
    setStatus(null);
    try {
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: randomBytes(32),
        timeout: 60000,
      };

      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        setError('No credential was returned.');
        return;
      }
      setAssertionId(credential.id);
      setStatus('Got an assertion from the authenticator.');
    } catch (err) {
      setError(describeError(err, 'Could not get an assertion.'));
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        This runs a real WebAuthn ceremony entirely in the browser — a random challenge and user id
        are generated locally, and nothing is verified by a server. In a production app, the
        challenge and the resulting attestation/assertion would be sent to a backend for
        verification and storage.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={register}>
          Create passkey (register)
        </button>
        <button type="button" onClick={getAssertion}>
          Get assertion (sign in)
        </button>
      </div>
      {credentialId && (
        <p role="status">
          Credential ID: <code>{credentialId}</code>
        </p>
      )}
      {assertionId && (
        <p role="status">
          Assertion credential ID: <code>{assertionId}</code>
        </p>
      )}
      {status && (
        <p role="status" style={{ color: 'var(--accent)' }}>
          {status}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
