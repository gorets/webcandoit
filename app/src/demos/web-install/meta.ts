import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-install',
  title: 'Web Install API',
  category: 'installation',
  description:
    'Calls the experimental navigator.install() to install the current app without a browser-driven prompt.',
  specUrl: 'https://github.com/WICG/web-install',
  isSupported: () => typeof navigator !== 'undefined' && 'install' in navigator,
};

export default meta;
