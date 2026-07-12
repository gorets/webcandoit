import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'shortcuts',
  title: 'App Shortcuts',
  category: 'installation',
  description:
    "Reads the web app manifest's shortcuts member, which surfaces quick actions on the installed app's icon.",
  specUrl:
    'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/shortcuts',
  isSupported: () => true,
  favorite: true,
  requiresInstall: true,
};

export default meta;
