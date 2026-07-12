import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'barcode-detection',
  title: 'Barcode Detection',
  category: 'camera',
  description: 'Pick an image and decode any barcodes or QR codes in it with BarcodeDetector.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API',
  isSupported: () => typeof window !== 'undefined' && 'BarcodeDetector' in window,
  favorite: true,
};

export default meta;
