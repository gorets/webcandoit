import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-usb',
  title: 'WebUSB',
  category: 'hardware',
  description: 'Pick a USB device from the browser chooser and open/close a connection to it.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API',
  isSupported: () => typeof navigator !== 'undefined' && 'usb' in navigator,
};

export default meta;
