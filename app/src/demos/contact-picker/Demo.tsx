import { useState } from 'react';

interface ContactInfoLike {
  name?: string[];
  email?: string[];
  tel?: string[];
}

interface ContactsManagerLike {
  select: (properties: string[], options?: { multiple?: boolean }) => Promise<ContactInfoLike[]>;
}

interface NavigatorWithContacts extends Navigator {
  contacts: ContactsManagerLike;
}

export default function ContactPickerDemo() {
  const [contacts, setContacts] = useState<ContactInfoLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePick = async () => {
    setError(null);
    setLoading(true);
    try {
      const nav = navigator as NavigatorWithContacts;
      const picked = await nav.contacts.select(['name', 'email', 'tel'], { multiple: true });
      setContacts(picked);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError(null);
      } else if (err instanceof DOMException && err.name === 'SecurityError') {
        setError(
          'Contact access was blocked. This demo must run in a secure, user-activated context.',
        );
      } else {
        setError('Could not access contacts.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <button type="button" onClick={handlePick} disabled={loading}>
        {loading ? 'Opening picker…' : 'Choose contacts…'}
      </button>
      {error && (
        <div role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {contacts !== null && (
        <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {contacts.length === 0 ? (
            <div style={{ color: 'var(--text-dim)' }}>No contacts selected.</div>
          ) : (
            contacts.map((c) => (
              <div
                key={
                  [...(c.name ?? []), ...(c.email ?? []), ...(c.tel ?? [])].join('|') || 'contact'
                }
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.name?.join(', ') || 'Unnamed contact'}</div>
                {c.email && c.email.length > 0 && (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    {c.email.join(', ')}
                  </div>
                )}
                {c.tel && c.tel.length > 0 && (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    {c.tel.join(', ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
