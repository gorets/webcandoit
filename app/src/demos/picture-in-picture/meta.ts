import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'picture-in-picture',
  title: 'Picture-in-Picture',
  category: 'screen',
  description:
    'Pop a playing video out into a floating always-on-top window using the Picture-in-Picture API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API',
  isSupported: () =>
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    document.pictureInPictureEnabled,
};

export default meta;
