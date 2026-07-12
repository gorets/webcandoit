import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'payment-request',
  title: 'Payment Request',
  category: 'actions',
  description:
    'Build a PaymentRequest for a demo total and open the browser payment sheet, safely handling rejection of unknown payment methods.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API',
  isSupported: () => typeof window !== 'undefined' && 'PaymentRequest' in window,
  favorite: true,
};

export default meta;
