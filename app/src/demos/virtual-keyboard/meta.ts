import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'virtual-keyboard',
  title: 'Virtual Keyboard',
  category: 'input',
  description:
    'Overlay the on-screen keyboard on top of the page content and track its bounding rect via the VirtualKeyboard API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/VirtualKeyboard_API',
  isSupported: () => typeof navigator !== 'undefined' && 'virtualKeyboard' in navigator,
};

export default meta;
