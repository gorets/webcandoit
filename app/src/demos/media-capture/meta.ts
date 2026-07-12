import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'media-capture',
  title: 'Media Capture (Camera)',
  category: 'camera',
  description: 'Access the device camera and preview a live video stream with getUserMedia.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia',
  isSupported: () =>
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    'getUserMedia' in navigator.mediaDevices,
  favorite: true,
};

export default meta;
