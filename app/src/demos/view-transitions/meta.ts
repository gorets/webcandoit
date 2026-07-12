import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'view-transitions',
  title: 'View Transitions',
  category: 'display',
  description: 'Animate DOM state changes smoothly using the View Transitions API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API',
  isSupported: () => typeof document !== 'undefined' && 'startViewTransition' in document,
};

export default meta;
