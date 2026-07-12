import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'audio-playback',
  title: 'Audio & Media Session',
  category: 'audio',
  description:
    'Play a locally generated tone and expose play/pause/stop controls to the OS via the Media Session API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API',
  isSupported: () => 'mediaSession' in navigator,
};

export default meta;
