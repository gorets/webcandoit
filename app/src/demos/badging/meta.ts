import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'badging',
  title: 'App Badging',
  category: 'notifications',
  description: 'Set or clear a numeric badge on the installed app icon using the Badging API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Badging_API',
  isSupported: () => typeof navigator !== 'undefined' && 'setAppBadge' in navigator,
  requiresInstall: true,
};

export default meta;
