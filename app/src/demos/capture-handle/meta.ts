import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'capture-handle',
  title: 'Capture Handle',
  category: 'screen',
  description:
    'Identify the tab being screen-captured with the Capture Handle API. A page advertises a handle via setCaptureHandleConfig, and the capturing app reads it with track.getCaptureHandle().',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getCaptureHandle',
  isSupported: () =>
    typeof MediaStreamTrack !== 'undefined' &&
    'getCaptureHandle' in MediaStreamTrack.prototype &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    'setCaptureHandleConfig' in navigator.mediaDevices,
  newFeature: true,
};

export default meta;
