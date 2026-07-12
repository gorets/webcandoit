import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'vibration',
  title: 'Vibration',
  category: 'device',
  description:
    'Make the device vibrate with a single pulse or a custom pattern using the Vibration API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API',
  isSupported: () => typeof navigator !== 'undefined' && 'vibrate' in navigator,
  favorite: true,
};

export default meta;
