import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'device-posture',
  title: 'Device Posture',
  category: 'device',
  description:
    'Detect whether a foldable device is folded or in continuous posture, live, via the Device Posture API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API',
  isSupported: () => typeof navigator !== 'undefined' && 'devicePosture' in navigator,
};

export default meta;
