import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'battery-status',
  title: 'Battery Status',
  category: 'device',
  description:
    "Read the device's battery level and charging state, and watch them update live via the Battery Status API.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API',
  isSupported: () => typeof navigator !== 'undefined' && 'getBattery' in navigator,
};

export default meta;
