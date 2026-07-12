import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'webcodecs',
  title: 'WebCodecs',
  category: 'graphics',
  description:
    'Encode video frames from a canvas animation into compressed chunks using the WebCodecs API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API',
  isSupported: () => typeof window !== 'undefined' && 'VideoEncoder' in window,
};

export default meta;
