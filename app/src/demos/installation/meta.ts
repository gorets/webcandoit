import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'installation',
  title: 'Installation',
  category: 'installation',
  description:
    'Captures the beforeinstallprompt event to trigger the install prompt, and reports installed/related-app state.',
  specUrl:
    'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable',
  isSupported: () => true,
  favorite: true,
};

export default meta;
