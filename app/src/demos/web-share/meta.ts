import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-share',
  title: 'Web Share',
  category: 'actions',
  description:
    'Open the native OS share sheet to share a title, text, and URL — or a generated file — using the Web Share API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share',
  isSupported: () => typeof navigator !== 'undefined' && 'share' in navigator,
  favorite: true,
};

export default meta;
