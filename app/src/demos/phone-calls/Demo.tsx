import { useMemo, useState } from 'react';

export default function PhoneCallsDemo() {
  const [phone, setPhone] = useState('+1 555 0100');
  const [message, setMessage] = useState('Hello from WebCanDoIt!');

  const sanitized = useMemo(() => {
    const trimmed = phone.trim();
    const plus = trimmed.startsWith('+') ? '+' : '';
    const digits = trimmed.replace(/\D/g, '');
    return `${plus}${digits}`;
  }, [phone]);

  const isValid = sanitized.replace('+', '').length >= 3;

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        There is no JavaScript API for placing calls or texts — instead, an anchor with a{' '}
        <code>tel:</code> or <code>sms:</code> URI scheme asks the OS to open the dialer or
        messaging app. On desktop browsers without a handler configured, nothing may happen.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px' }}>
        <label>
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          SMS message
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
      </div>
      {isValid ? (
        <p style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href={`tel:${sanitized}`}>Call {sanitized}</a>
          <a href={`sms:${sanitized}?body=${encodeURIComponent(message)}`}>Text {sanitized}</a>
        </p>
      ) : (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          Enter a valid phone number to generate links.
        </p>
      )}
    </div>
  );
}
