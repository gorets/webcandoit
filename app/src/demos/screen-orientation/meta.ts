import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'screen-orientation',
  title: 'Screen Orientation',
  category: 'device',
  description:
    'Read the current screen orientation, listen for changes, and try locking the orientation to portrait.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API',
  isSupported: () => typeof screen !== 'undefined' && 'orientation' in screen,
};

export default meta;
