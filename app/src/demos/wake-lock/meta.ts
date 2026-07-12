import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'wake-lock',
  title: 'Screen Wake Lock',
  category: 'display',
  description: 'Prevent the screen from dimming or locking using the Screen Wake Lock API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API',
  isSupported: () => 'wakeLock' in navigator,
  favorite: true,
};

export default meta;
