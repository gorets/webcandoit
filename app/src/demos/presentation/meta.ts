import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'presentation',
  title: 'Presentation (Cast)',
  category: 'screen',
  description:
    'Discover and connect to a second-screen display, like a Chromecast, using the Presentation API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Presentation_API',
  isSupported: () => typeof window !== 'undefined' && 'PresentationRequest' in window,
};

export default meta;
