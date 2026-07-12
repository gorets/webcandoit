import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-nfc',
  title: 'Web NFC',
  category: 'hardware',
  description: 'Scan nearby NFC tags and write a text record to one using the Web NFC API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API',
  isSupported: () => typeof window !== 'undefined' && 'NDEFReader' in window,
};

export default meta;
