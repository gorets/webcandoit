import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'element-capture',
  title: 'Element Capture',
  category: 'screen',
  description:
    'Restrict a screen-share track to a single DOM element using RestrictionTarget and restrictTo.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Element_Capture_API',
  isSupported: () =>
    typeof window !== 'undefined' &&
    'RestrictionTarget' in window &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    'getDisplayMedia' in navigator.mediaDevices,
};

export default meta;
