import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'speech-synthesis',
  title: 'Speech Synthesis',
  category: 'audio',
  description: 'Convert typed text to speech using one of the voices installed on this device.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis',
  isSupported: () => 'speechSynthesis' in window,
};

export default meta;
