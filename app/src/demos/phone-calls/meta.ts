import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'phone-calls',
  title: 'Phone Calls & SMS',
  category: 'actions',
  description:
    'Generate tel: and sms: links from a phone number to open the device dialer or messaging app.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a',
  isSupported: () => true,
};

export default meta;
