import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'home-screen-widgets',
  title: 'Home Screen Widgets',
  category: 'installation',
  description:
    'Explains how the manifest widgets member and service worker widget events power PWA home-screen widgets (Windows/Edge).',
  specUrl:
    'https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/widgets',
  isSupported: () => true,
  requiresInstall: true,
};

export default meta;
