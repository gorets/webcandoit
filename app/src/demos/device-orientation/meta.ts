import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'device-orientation',
  title: 'Device Orientation',
  category: 'device',
  description:
    "Read the device's physical orientation in space — alpha, beta and gamma angles — as it moves.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent',
  isSupported: () => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
};

export default meta;
