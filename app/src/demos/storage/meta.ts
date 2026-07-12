import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'storage',
  title: 'Storage & Quota',
  category: 'system',
  description:
    "Check this origin's storage usage against its quota, and request persistent storage.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Storage_API',
  isSupported: () => 'storage' in navigator && 'estimate' in navigator.storage,
};

export default meta;
