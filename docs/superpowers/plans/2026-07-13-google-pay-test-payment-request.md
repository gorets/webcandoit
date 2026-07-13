# Payment Request — Google Pay TEST Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `payment-request` demo's guaranteed-to-fail placeholder payment methods
(`basic-card`, `https://example.com/pay`) with Google Pay's `TEST` environment, so the demo opens a
real, working payment sheet in supported browsers instead of only demonstrating error handling.

**Architecture:** Two new small, pure-logic modules (`googlePayTest.ts` for the Google Pay method
config, `format.ts` for response-formatting helpers) get unit tests with no DOM/PaymentRequest
dependency. `Demo.tsx` is then updated to use both modules and gets component tests that stub
`window.PaymentRequest` to drive the success/error/abort paths without a real browser payment
sheet.

**Tech Stack:** React 19 + TypeScript, Vitest + `@testing-library/react` (existing project
tooling, no new dependencies).

## Global Constraints

- Google Pay `TEST` environment only — no real Google merchant registration, no server changes,
  no new dependencies.
- Drop `basic-card` entirely (deprecated, removed from current Chrome).
- Use the test gateway exactly: `gateway: 'example'`, `gatewayMerchantId: 'exampleGatewayMerchantId'`.
- `AbortError` (user dismissed the sheet) keeps its existing "Payment sheet was dismissed." message
  — unchanged behavior, don't touch that branch's copy.
- Non-abort errors get updated copy referencing Google Pay/Chrome, not "placeholder methods."
- Success formatting must never throw on an unexpected/missing `details` shape — always fall back
  to a `methodName`-only message.
- No new automated test attempts to drive a real Google Pay sheet — stub `PaymentRequest` in
  component tests instead (a live sheet needs a real Google account + saved card + user gesture,
  consistent with this project's existing approach to hardware/native-UI APIs).
- Existing Playwright smoke test (`e2e/smoke.spec.ts`) is not modified.

---

### Task 1: Google Pay TEST method config + response-formatting helpers

**Files:**
- Create: `app/src/demos/payment-request/googlePayTest.ts`
- Create: `app/src/demos/payment-request/googlePayTest.test.ts`
- Create: `app/src/demos/payment-request/format.ts`
- Create: `app/src/demos/payment-request/format.test.ts`

**Interfaces:**
- Produces: `GOOGLE_PAY_TEST_METHOD: PaymentMethodData` (exported from `googlePayTest.ts`) — the
  sole entry for the `methods` array passed to `new PaymentRequest(...)` in Task 2.
- Produces: `maskToken(token: string): string` and
  `describeSuccess(methodName: string, details: unknown): string` (exported from `format.ts`) —
  consumed directly by `Demo.tsx` in Task 2.

- [ ] **Step 1: Write the failing tests for `format.ts`**

Create `app/src/demos/payment-request/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { describeSuccess, maskToken } from './format';

describe('maskToken', () => {
  it('returns short tokens unchanged', () => {
    expect(maskToken('short-token')).toBe('short-token');
  });

  it('masks long tokens, keeping the first 30 and last 10 characters', () => {
    const token = 'a'.repeat(30) + 'b'.repeat(20) + 'c'.repeat(10);
    const masked = maskToken(token);
    expect(masked.startsWith('a'.repeat(30))).toBe(true);
    expect(masked.endsWith('c'.repeat(10))).toBe(true);
    expect(masked).toContain('…');
    expect(masked.length).toBeLessThan(token.length);
  });
});

describe('describeSuccess', () => {
  it('formats card network, last 4, and a masked token when present', () => {
    const details = {
      paymentMethodData: {
        info: { cardNetwork: 'MASTERCARD', cardDetails: '4444' },
        tokenizationData: { token: 'x'.repeat(60) },
      },
    };
    const result = describeSuccess('https://google.com/pay', details);
    expect(result).toContain('Google Pay (TEST)');
    expect(result).toContain('MASTERCARD');
    expect(result).toContain('4444');
    expect(result).toContain('Token:');
  });

  it('falls back to a methodName-only message when details are missing expected fields', () => {
    expect(describeSuccess('https://google.com/pay', undefined)).toBe(
      'Payment completed via "https://google.com/pay".',
    );
  });

  it('falls back when details is present but incomplete', () => {
    const details = { paymentMethodData: { info: { cardNetwork: 'VISA' } } };
    expect(describeSuccess('https://google.com/pay', details)).toBe(
      'Payment completed via "https://google.com/pay".',
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -w app -- run src/demos/payment-request/format.test.ts`
Expected: FAIL — `Cannot find module './format'` (file doesn't exist yet).

- [ ] **Step 3: Implement `format.ts`**

Create `app/src/demos/payment-request/format.ts`:

```ts
export interface GooglePayResponseDetails {
  paymentMethodData?: {
    info?: {
      cardNetwork?: string;
      cardDetails?: string;
    };
    tokenizationData?: {
      token?: string;
    };
  };
}

const TOKEN_HEAD = 30;
const TOKEN_TAIL = 10;

export function maskToken(token: string): string {
  if (token.length <= TOKEN_HEAD + TOKEN_TAIL + 1) {
    return token;
  }
  return `${token.slice(0, TOKEN_HEAD)}…${token.slice(-TOKEN_TAIL)}`;
}

export function describeSuccess(methodName: string, details: unknown): string {
  const paymentMethodData = (details as GooglePayResponseDetails | undefined)?.paymentMethodData;
  const cardNetwork = paymentMethodData?.info?.cardNetwork;
  const cardDetails = paymentMethodData?.info?.cardDetails;
  const token = paymentMethodData?.tokenizationData?.token;

  if (cardNetwork && cardDetails && token) {
    return `Payment authorized via Google Pay (TEST) — ${cardNetwork} •••• ${cardDetails}\nToken: ${maskToken(token)}`;
  }

  return `Payment completed via "${methodName}".`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -w app -- run src/demos/payment-request/format.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing test for `googlePayTest.ts`**

Create `app/src/demos/payment-request/googlePayTest.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { GOOGLE_PAY_TEST_METHOD } from './googlePayTest';

describe('GOOGLE_PAY_TEST_METHOD', () => {
  it('targets the Google Pay payment method with the TEST environment', () => {
    expect(GOOGLE_PAY_TEST_METHOD.supportedMethods).toBe('https://google.com/pay');
    const data = GOOGLE_PAY_TEST_METHOD.data as Record<string, unknown>;
    expect(data.environment).toBe('TEST');
  });

  it('uses the documented test gateway, not a real payment processor', () => {
    const data = GOOGLE_PAY_TEST_METHOD.data as {
      allowedPaymentMethods: Array<{
        tokenizationSpecification: { parameters: { gateway: string; gatewayMerchantId: string } };
      }>;
    };
    const { gateway, gatewayMerchantId } = data.allowedPaymentMethods[0].tokenizationSpecification.parameters;
    expect(gateway).toBe('example');
    expect(gatewayMerchantId).toBe('exampleGatewayMerchantId');
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm run test -w app -- run src/demos/payment-request/googlePayTest.test.ts`
Expected: FAIL — `Cannot find module './googlePayTest'` (file doesn't exist yet).

- [ ] **Step 7: Implement `googlePayTest.ts`**

Create `app/src/demos/payment-request/googlePayTest.ts`:

```ts
export const GOOGLE_PAY_TEST_METHOD: PaymentMethodData = {
  supportedMethods: 'https://google.com/pay',
  data: {
    environment: 'TEST',
    apiVersion: 2,
    apiVersionMinor: 0,
    merchantInfo: { merchantName: 'WebCanDoIt Demo' },
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      },
    ],
  },
};
```

- [ ] **Step 8: Run both new test files and typecheck**

Run: `npm run test -w app -- run src/demos/payment-request`
Expected: PASS (7 tests total across `format.test.ts` and `googlePayTest.test.ts`).

Run: `npm run typecheck -w app`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add app/src/demos/payment-request/googlePayTest.ts app/src/demos/payment-request/googlePayTest.test.ts app/src/demos/payment-request/format.ts app/src/demos/payment-request/format.test.ts
git commit -m "Add Google Pay TEST method config and response-formatting helpers"
```

---

### Task 2: Wire Google Pay TEST into the Demo component

**Files:**
- Modify: `app/src/demos/payment-request/Demo.tsx`
- Modify: `app/src/demos/payment-request/meta.ts`
- Create: `app/src/demos/payment-request/Demo.test.tsx`

**Interfaces:**
- Consumes: `GOOGLE_PAY_TEST_METHOD` from `./googlePayTest` (Task 1).
- Consumes: `describeSuccess(methodName: string, details: unknown): string` from `./format`
  (Task 1).

- [ ] **Step 1: Write the failing component tests**

Create `app/src/demos/payment-request/Demo.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaymentRequestDemo from './Demo';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PaymentRequestDemo', () => {
  it('explains the Google Pay TEST flow and shows a Try button', () => {
    render(<PaymentRequestDemo />);
    expect(screen.getByText(/Google Pay/)).toBeDefined();
    expect(screen.getByRole('button', { name: /try payment request/i })).toBeDefined();
  });

  it('shows an explanatory error when Google Pay is unsupported', async () => {
    class FakePaymentRequest {
      canMakePayment() {
        return Promise.resolve(false);
      }
      show() {
        return Promise.reject(new DOMException('no handler available', 'NotSupportedError'));
      }
    }
    vi.stubGlobal('PaymentRequest', FakePaymentRequest);

    render(<PaymentRequestDemo />);
    fireEvent.click(screen.getByRole('button', { name: /try payment request/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/NotSupportedError/);
    expect(alert).toHaveTextContent(/Google Pay isn't available here/i);
  });

  it('shows card network, last 4 digits, and a masked token on success', async () => {
    class FakePaymentRequest {
      canMakePayment() {
        return Promise.resolve(true);
      }
      show() {
        return Promise.resolve({
          methodName: 'https://google.com/pay',
          details: {
            paymentMethodData: {
              info: { cardNetwork: 'MASTERCARD', cardDetails: '4444' },
              tokenizationData: { token: 'x'.repeat(60) },
            },
          },
          complete: () => Promise.resolve(),
        });
      }
    }
    vi.stubGlobal('PaymentRequest', FakePaymentRequest);

    render(<PaymentRequestDemo />);
    fireEvent.click(screen.getByRole('button', { name: /try payment request/i }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/MASTERCARD/);
    expect(status).toHaveTextContent(/4444/);
  });

  it('shows a dismissal message when the user cancels the sheet', async () => {
    class FakePaymentRequest {
      canMakePayment() {
        return Promise.resolve(true);
      }
      show() {
        return Promise.reject(new DOMException('cancelled', 'AbortError'));
      }
    }
    vi.stubGlobal('PaymentRequest', FakePaymentRequest);

    render(<PaymentRequestDemo />);
    fireEvent.click(screen.getByRole('button', { name: /try payment request/i }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/dismissed/i);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -w app -- run src/demos/payment-request/Demo.test.tsx`
Expected: FAIL — the first test fails because the current copy doesn't mention "Google Pay", and
the success/error tests fail because `Demo.tsx` still builds the old placeholder `methods` array
and old copy.

- [ ] **Step 3: Update `Demo.tsx`**

Replace the full contents of `app/src/demos/payment-request/Demo.tsx`:

```tsx
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
        environment for a $1.00 demo total — no money moves, but the payment sheet and the token
        it returns are genuine. Needs desktop Chrome or Android Chrome with a card saved to your
        Google account; other browsers will show the error below instead.
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
```

- [ ] **Step 4: Update `meta.ts` description**

In `app/src/demos/payment-request/meta.ts`, replace the `description` field:

```ts
  description:
    "Open a real Google Pay TEST-environment payment sheet via PaymentRequest — a genuine payment flow with no money moving.",
```

(Leave every other field in `meta.ts` — `slug`, `title`, `category`, `specUrl`, `isSupported`,
`favorite` — unchanged.)

- [ ] **Step 5: Run the component tests to verify they pass**

Run: `npm run test -w app -- run src/demos/payment-request/Demo.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Run the full app test suite and typecheck**

Run: `npm run test -w app`
Expected: PASS, no regressions in other demo/page tests.

Run: `npm run typecheck -w app`
Expected: no errors.

- [ ] **Step 7: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add app/src/demos/payment-request/Demo.tsx app/src/demos/payment-request/Demo.test.tsx app/src/demos/payment-request/meta.ts
git commit -m "Show a real Google Pay TEST payment sheet in the payment-request demo"
```

---

## Manual verification (not automated)

After both tasks land, verify on a real browser (dev server or deployed site) per the spec's
Testing section — this can't be scripted in CI:

- **Desktop Chrome with a card saved to a Google account:** click "Try Payment Request" → real
  Google Pay sheet opens → pick the test card → UI shows `Payment authorized via Google Pay
  (TEST) — <network> •••• <last4>` and a masked `Token: ...` line.
- **Safari:** click "Try Payment Request" → UI shows the red error text mentioning Google Pay
  isn't available here.
- **Dismiss the sheet** (open it, then cancel) in a supported browser → UI shows "Payment sheet
  was dismissed."
