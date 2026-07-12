import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'network-info',
  title: 'Network Information',
  category: 'network',
  description:
    'Inspect the current connection type, downlink speed, round-trip time and data-saver preference.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API',
  isSupported: () => typeof navigator !== 'undefined' && 'connection' in navigator,
  favorite: true,
};

export default meta;
