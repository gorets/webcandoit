import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'navigation-api',
  title: 'Navigation API',
  category: 'system',
  description:
    'Inspect and control the session history with the modern Navigation API — a unified successor to the History and popstate APIs, with a full list of entries and a single navigate event.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API',
  isSupported: () => typeof window !== 'undefined' && 'navigation' in window,
  newFeature: true,
};

export default meta;
