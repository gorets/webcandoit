import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'intersection-observer',
  title: 'Intersection Observer',
  category: 'display',
  description:
    'Efficiently detect when an element enters or leaves the viewport (or a scroll container) with IntersectionObserver — the basis of lazy-loading and scroll-triggered effects.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
  isSupported: () => typeof IntersectionObserver !== 'undefined',
};

export default meta;
