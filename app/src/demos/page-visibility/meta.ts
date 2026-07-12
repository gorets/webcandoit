import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'page-visibility',
  title: 'Page Visibility',
  category: 'activity',
  description:
    'Detect when the page is hidden or visible using the Page Visibility API, and count how many times it has been hidden.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API',
  isSupported: () => typeof document !== 'undefined' && 'visibilityState' in document,
};

export default meta;
