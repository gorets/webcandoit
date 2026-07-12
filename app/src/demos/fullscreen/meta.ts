import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'fullscreen',
  title: 'Fullscreen',
  category: 'display',
  description: 'Request fullscreen for an element and exit it again using the Fullscreen API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API',
  isSupported: () =>
    typeof document !== 'undefined' &&
    'fullscreenEnabled' in document &&
    document.fullscreenEnabled,
};

export default meta;
