import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'cookie-store',
  title: 'Cookie Store API',
  category: 'system',
  description:
    'Read, write, and observe cookies asynchronously with the Cookie Store API — no more parsing document.cookie by hand.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API',
  isSupported: () => typeof window !== 'undefined' && 'cookieStore' in window,
  newFeature: true,
};

export default meta;
