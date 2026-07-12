import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'document-pip',
  title: 'Document Picture-in-Picture',
  category: 'screen',
  description:
    'Move a live piece of the page into an always-on-top pop-out window using the Document Picture-in-Picture API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API',
  isSupported: () => typeof window !== 'undefined' && 'documentPictureInPicture' in window,
};

export default meta;
