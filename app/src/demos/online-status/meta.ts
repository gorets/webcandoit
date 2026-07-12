import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'online-status',
  title: 'Online Status',
  category: 'network',
  description:
    'Track network connectivity in real time using navigator.onLine and the online/offline events.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine',
  isSupported: () => 'onLine' in navigator,
  favorite: true,
};

export default meta;
