import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-serial',
  title: 'Web Serial',
  category: 'hardware',
  description: 'Open a serial port chosen from the browser picker and read a few bytes from it.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API',
  isSupported: () => typeof navigator !== 'undefined' && 'serial' in navigator,
};

export default meta;
