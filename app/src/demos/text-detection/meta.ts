import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'text-detection',
  title: 'Text Detection',
  category: 'camera',
  description: 'Pick an image and detect blocks of text in it with the TextDetector API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/TextDetector',
  isSupported: () => typeof window !== 'undefined' && 'TextDetector' in window,
};

export default meta;
