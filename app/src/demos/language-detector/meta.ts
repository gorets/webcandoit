import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'language-detector',
  title: 'Language Detector API',
  category: 'ai',
  description:
    'Detect the language of any text on-device with the Language Detector API — desktop Chrome only, ranked results with confidence scores.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/LanguageDetector',
  isSupported: () => typeof self !== 'undefined' && 'LanguageDetector' in self,
  newFeature: true,
};

export default meta;
