import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'protocol-handling',
  title: 'Protocol Handling',
  category: 'system',
  description:
    'Register this site as a handler for a custom "web+webcandoit" URI scheme using registerProtocolHandler.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/registerProtocolHandler',
  isSupported: () => typeof navigator !== 'undefined' && 'registerProtocolHandler' in navigator,
};

export default meta;
