import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'page-focus',
  title: 'Page Focus',
  category: 'activity',
  description:
    'Track whether the window currently has focus using the focus and blur events and document.hasFocus(). Distinct from Page Visibility: a tab can be visible yet not focused.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/hasFocus',
  isSupported: () => typeof document !== 'undefined' && typeof document.hasFocus === 'function',
};

export default meta;
