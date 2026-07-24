import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-audio',
  title: 'Web Audio API',
  category: 'audio',
  description:
    'Synthesize and shape sound in real time with the Web Audio API. Generate a tone with an oscillator, control frequency and gain, and visualize it with an analyser.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
  isSupported: () =>
    typeof window !== 'undefined' &&
    ('AudioContext' in window ||
      'webkitAudioContext' in (window as Window & { webkitAudioContext?: unknown })),
};

export default meta;
