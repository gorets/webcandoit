import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'face-detection',
  title: 'Face Detection',
  category: 'camera',
  description: 'Pick an image and locate faces in it with the FaceDetector API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/FaceDetector',
  isSupported: () => typeof window !== 'undefined' && 'FaceDetector' in window,
};

export default meta;
