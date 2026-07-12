import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'viewport',
  title: 'Visual Viewport',
  category: 'display',
  description:
    'Track the size, scale, and offset of the visible viewport as the on-screen keyboard opens or the page is pinch-zoomed.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport',
  isSupported: () =>
    typeof window !== 'undefined' && 'visualViewport' in window && !!window.visualViewport,
};

export default meta;
