import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'mutation-observer',
  title: 'Mutation Observer',
  category: 'display',
  description:
    'Watch the DOM for structural changes — nodes added or removed, attributes and text edited — with MutationObserver, batched asynchronously for performance.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver',
  isSupported: () => typeof MutationObserver !== 'undefined',
};

export default meta;
