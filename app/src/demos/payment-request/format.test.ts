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
