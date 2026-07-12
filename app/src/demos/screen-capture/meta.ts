import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'screen-capture',
  title: 'Screen Capture',
  category: 'screen',
  description: 'Capture the screen, a window, or a tab and preview it live with getDisplayMedia.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API',
  isSupported: () =>
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    'getDisplayMedia' in navigator.mediaDevices,
};

export default meta;
