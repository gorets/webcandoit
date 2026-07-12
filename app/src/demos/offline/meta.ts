import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'offline',
  title: 'Offline (Cache Storage)',
  category: 'network',
  description:
    'The Cache Storage API lets web apps work offline — list what the service worker has cached, browse cached requests, and cache a URL yourself.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Cache',
  isSupported: () => 'caches' in window,
  favorite: true,
};

export default meta;
