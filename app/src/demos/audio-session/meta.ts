import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'audio-session',
  title: 'Audio Session',
  category: 'audio',
  description:
    'Read and set the current audio session type (e.g. playback, ambient, transient) via the Audio Session API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/AudioSession',
  isSupported: () => 'audioSession' in navigator,
};

export default meta;
