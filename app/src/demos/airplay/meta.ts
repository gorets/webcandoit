import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'airplay',
  title: 'AirPlay / Remote Playback',
  category: 'screen',
  description:
    'Send a playing video to a nearby TV or speaker via AirPlay or the standard Remote Playback API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Remote_Playback_API',
  isSupported: () =>
    typeof HTMLVideoElement !== 'undefined' &&
    ('remote' in HTMLVideoElement.prototype ||
      'webkitShowPlaybackTargetPicker' in HTMLVideoElement.prototype),
};

export default meta;
