import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'eyedropper',
  title: 'EyeDropper',
  category: 'input',
  description: 'Pick a color from anywhere on the screen using the EyeDropper API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API',
  isSupported: () => typeof window !== 'undefined' && 'EyeDropper' in window,
};

export default meta;
