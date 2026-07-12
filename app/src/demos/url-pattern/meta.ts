import type { DemoMeta } from '../types';

declare class URLPattern {
  constructor(input: { pathname?: string } | string, baseURL?: string);
}

const meta: DemoMeta = {
  slug: 'url-pattern',
  title: 'URLPattern API',
  category: 'system',
  description:
    'Match and extract named parts of a URL against a pattern with the URLPattern API — the routing primitive browsers already ship, no router library needed.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API',
  isSupported: () => typeof URLPattern !== 'undefined',
  newFeature: true,
};

export default meta;
