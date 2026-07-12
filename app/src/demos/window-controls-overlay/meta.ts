import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'window-controls-overlay',
  title: 'Window Controls Overlay',
  category: 'display',
  description:
    'Read the titlebar area geometry and overlay visibility exposed to an installed, windowed PWA.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API',
  isSupported: () => typeof navigator !== 'undefined' && 'windowControlsOverlay' in navigator,
  requiresInstall: true,
};

export default meta;
