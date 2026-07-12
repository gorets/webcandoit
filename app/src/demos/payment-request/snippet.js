const payButton = document.querySelector('#pay-button');
const output = document.querySelector('#payment-output');

payButton.addEventListener('click', async () => {
  const methods = [
    { supportedMethods: 'https://example.com/pay' },
    { supportedMethods: 'basic-card' },
  ];
  const details = {
    total: { label: 'WebCanDoIt demo total', amount: { currency: 'USD', value: '1.00' } },
  };

  try {
    const request = new PaymentRequest(methods, details);
    const canMakePayment = await request.canMakePayment().catch(() => null);
    const response = await request.show();
    await response.complete('success');
    output.textContent = `Payment completed via "${response.methodName}". canMakePayment: ${canMakePayment}`;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      output.textContent = 'Payment sheet was dismissed.';
      return;
    }
    output.textContent = `Payment Request failed: ${err.message}`;
  }
});
