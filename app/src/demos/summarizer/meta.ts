import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'summarizer',
  title: 'Summarizer API',
  category: 'ai',
  description:
    'Summarize any pasted text on-device with the Summarizer API — the model runs locally, nothing you paste leaves the browser.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Summarizer_API',
  isSupported: () => typeof self !== 'undefined' && 'Summarizer' in self,
  newFeature: true,
};

export default meta;
