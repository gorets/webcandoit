import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'translator',
  title: 'Translator API',
  category: 'ai',
  description:
    'Translate text between languages entirely on-device with the Translator API — desktop Chrome only, no server round-trip.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs',
  isSupported: () => typeof self !== 'undefined' && 'Translator' in self,
  newFeature: true,
};

export default meta;
