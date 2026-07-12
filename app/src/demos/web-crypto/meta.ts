import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-crypto',
  title: 'Web Crypto (Encryption)',
  category: 'security',
  description:
    'Encrypt and decrypt text in the browser with AES-GCM using the Web Crypto API — the key and ciphertext never leave the page.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API',
  isSupported: () => typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle,
};

export default meta;
