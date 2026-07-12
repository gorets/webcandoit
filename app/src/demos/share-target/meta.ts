import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'share-target',
  title: 'Web Share Target',
  category: 'actions',
  description:
    'Explains how the manifest "share_target" field lets an installed PWA receive shares from the OS share sheet, and shows any shared data present in the current URL.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target',
  isSupported: () => true,
  requiresBackend: true,
  requiresInstall: true,
};

export default meta;
