import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-bluetooth',
  title: 'Web Bluetooth',
  category: 'hardware',
  description:
    'Pair a nearby Bluetooth device via the browser chooser and read its GATT battery level if available.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API',
  isSupported: () => typeof navigator !== 'undefined' && 'bluetooth' in navigator,
};

export default meta;
