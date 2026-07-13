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
    expect(alert.textContent).toMatch(/NotSupportedError/);
    expect(alert.textContent).toMatch(/Google Pay isn't available here/i);
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
    expect(status.textContent).toMatch(/MASTERCARD/);
    expect(status.textContent).toMatch(/4444/);
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
    expect(status.textContent).toMatch(/dismissed/i);
  });
});
