import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'compression',
  title: 'Compression Streams',
  category: 'system',
  description:
    'Gzip text with CompressionStream, then verify a round trip through DecompressionStream.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API',
  isSupported: () => typeof window !== 'undefined' && 'CompressionStream' in window,
};

export default meta;
