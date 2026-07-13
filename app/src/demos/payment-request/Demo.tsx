import { useState } from 'react';
import { describeSuccess } from './format';
import { GOOGLE_PAY_TEST_METHOD } from './googlePayTest';

export default function PaymentRequestDemo() {
  const [outcome, setOutcome] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tryPayment = async () => {
    setError(null);
    setOutcome(null);
    setBusy(true);
    try {
      const details: PaymentDetailsInit = {
        total: {
          label: 'WebCanDoIt demo total',
          amount: { currency: 'USD', value: '1.00' },
        },
      };

      const request = new PaymentRequest([GOOGLE_PAY_TEST_METHOD], details);
      await request.canMakePayment().catch(() => null);

      const response = await request.show();
      await response.complete('success');
      setOutcome(describeSuccess(response.methodName, response.details));
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
        `${detail} — Google Pay isn't available here: try desktop Chrome or Android Chrome with a card saved to your Google account.`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-dim)' }}>
        This opens a real <code>PaymentRequest</code> using Google Pay's <code>TEST</code>{' '}
        environment for a $1.00 demo total — no money moves, but the payment sheet and the token it
        returns are genuine. Needs desktop Chrome or Android Chrome with a card saved to your Google
        account; other browsers will show the error below instead.
      </p>
      <button type="button" onClick={tryPayment} disabled={busy}>
        {busy ? 'Opening payment sheet…' : 'Try Payment Request'}
      </button>
      {outcome && (
        <p role="status" style={{ color: 'var(--accent)', whiteSpace: 'pre-wrap' }}>
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
