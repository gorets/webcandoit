import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-locks',
  title: 'Web Locks API',
  category: 'system',
  description:
    'Coordinate work across tabs with a mutex-like lock using the Web Locks API — open this demo in two tabs to see real contention.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API',
  isSupported: () => typeof navigator !== 'undefined' && 'locks' in navigator,
  newFeature: true,
};

export default meta;
