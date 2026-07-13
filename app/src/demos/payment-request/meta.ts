import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'payment-request',
  title: 'Payment Request',
  category: 'actions',
  description:
    'Open a real Google Pay TEST-environment payment sheet via PaymentRequest — a genuine payment flow with no money moving.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API',
  isSupported: () => typeof window !== 'undefined' && 'PaymentRequest' in window,
  favorite: true,
};

export default meta;
