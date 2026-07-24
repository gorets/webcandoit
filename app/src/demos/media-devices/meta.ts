import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'media-devices',
  title: 'Media Devices',
  category: 'device',
  description:
    'Enumerate the available cameras, microphones, and speakers with enumerateDevices, reveal their labels after a permission grant, and react to devices being plugged in or removed.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices',
  isSupported: () =>
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    'enumerateDevices' in navigator.mediaDevices,
};

export default meta;
