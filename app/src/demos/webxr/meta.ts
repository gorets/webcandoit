import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'webxr',
  title: 'WebXR (AR/VR)',
  category: 'graphics',
  description: 'Check for immersive VR/AR session support and start a minimal WebXR session.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API',
  isSupported: () => typeof navigator !== 'undefined' && 'xr' in navigator,
};

export default meta;
