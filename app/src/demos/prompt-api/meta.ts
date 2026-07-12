import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'prompt-api',
  title: 'Prompt API',
  category: 'ai',
  description:
    'Chat with Gemini Nano, a small language model that runs fully on-device via the Prompt API — no server, no API key, nothing leaves the browser.',
  specUrl: 'https://developer.chrome.com/docs/ai/prompt-api',
  isSupported: () => typeof self !== 'undefined' && 'LanguageModel' in self,
  newFeature: true,
};

export default meta;
