import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'clipboard',
  title: 'Clipboard',
  category: 'input',
  description:
    'Write and read text, and copy an image, to and from the system clipboard using the Clipboard API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API',
  isSupported: () => typeof navigator !== 'undefined' && !!navigator.clipboard,
};

export default meta;
