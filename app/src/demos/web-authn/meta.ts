import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'web-authn',
  title: 'Web Authentication (Passkeys)',
  category: 'security',
  description:
    "Web Authentication (WebAuthn) enables passwordless sign-in through your device's fingerprint reader, face recognition, or a security key — entirely client-side, no server involved.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API',
  isSupported: () =>
    typeof navigator !== 'undefined' &&
    !!navigator.credentials &&
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential,
  favorite: true,
};

export default meta;
