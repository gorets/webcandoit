const payButton = document.querySelector('#pay-button');
const output = document.querySelector('#payment-output');

payButton.addEventListener('click', async () => {
  const googlePayTestMethod = {
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
            parameters: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
          },
        },
      ],
    },
  };
  const details = {
    total: { label: 'WebCanDoIt demo total', amount: { currency: 'USD', value: '1.00' } },
  };

  try {
    const request = new PaymentRequest([googlePayTestMethod], details);
    await request.canMakePayment().catch(() => null);
    const response = await request.show();
    await response.complete('success');
    const info = response.details?.paymentMethodData?.info;
    output.textContent = info?.cardNetwork
      ? `Payment authorized via Google Pay (TEST) — ${info.cardNetwork} •••• ${info.cardDetails}`
      : `Payment completed via "${response.methodName}".`;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      output.textContent = 'Payment sheet was dismissed.';
      return;
    }
    output.textContent = `${err.name}: ${err.message} — Google Pay isn't available here: try desktop Chrome or Android Chrome with a card saved to your Google account.`;
  }
});
