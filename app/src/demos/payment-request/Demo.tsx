import { useState } from 'react';

export default function PaymentRequestDemo() {
  const [outcome, setOutcome] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tryPayment = async () => {
    setError(null);
    setOutcome(null);
    setBusy(true);
    try {
      const methods: PaymentMethodData[] = [
        { supportedMethods: 'https://example.com/pay' },
        { supportedMethods: 'basic-card' },
      ];
      const details: PaymentDetailsInit = {
        total: {
          label: 'WebCanDoIt demo total',
          amount: { currency: 'USD', value: '1.00' },
        },
      };

      const request = new PaymentRequest(methods, details);
      const canMakePayment = await request.canMakePayment().catch(() => null);

      const response = await request.show();
      await response.complete('success');
      setOutcome(
        `Payment completed via "${response.methodName}". canMakePayment reported: ${
          canMakePayment === null ? 'unknown' : canMakePayment
        }.`,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setOutcome('Payment sheet was dismissed.');
        return;
      }
      const detail =
        err instanceof DOMException || err instanceof Error
          ? `${err.name}: ${err.message}`
          : 'Payment Request failed.';
      setError(
        `${detail} — most browsers reject the placeholder payment methods used in this demo, which is expected without a real merchant integration.`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        This builds a real <code>PaymentRequest</code> for a $1.00 demo total using placeholder
        payment methods (no real merchant account). Since no real payment handler is registered,
        most browsers will reject it or show an empty sheet — that failure is caught and explained
        below, not a crash.
      </p>
      <button type="button" onClick={tryPayment} disabled={busy}>
        {busy ? 'Opening payment sheet…' : 'Try Payment Request'}
      </button>
      {outcome && (
        <p role="status" style={{ color: 'var(--accent)' }}>
          {outcome}
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
