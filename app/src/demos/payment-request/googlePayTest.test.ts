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
    const { gateway, gatewayMerchantId } =
      data.allowedPaymentMethods[0].tokenizationSpecification.parameters;
    expect(gateway).toBe('example');
    expect(gatewayMerchantId).toBe('exampleGatewayMerchantId');
  });
});
