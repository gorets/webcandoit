import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'local-font-access',
  title: 'Local Font Access',
  category: 'system',
  description: "List the fonts installed on the user's system using the Local Font Access API.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts',
  isSupported: () => typeof window !== 'undefined' && 'queryLocalFonts' in window,
};

export default meta;
