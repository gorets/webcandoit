import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'keyboard-mouse',
  title: 'Keyboard & Pointer Lock',
  category: 'input',
  description:
    'Inspect raw keyboard events and capture unbounded mouse movement deltas using the Pointer Lock API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API',
  isSupported: () => typeof document !== 'undefined' && 'pointerLockElement' in document,
};

export default meta;
