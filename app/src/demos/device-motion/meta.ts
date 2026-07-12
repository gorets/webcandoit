import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'device-motion',
  title: 'Device Motion',
  category: 'device',
  description:
    "Track the device's acceleration and rotation rate live using the Device Motion API.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent',
  isSupported: () => typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
};

export default meta;
