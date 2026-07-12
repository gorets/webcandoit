import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'webgpu',
  title: 'WebGPU',
  category: 'graphics',
  description:
    'Request a GPU adapter and device, then render a cleared canvas with the WebGPU API.',
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API',
  isSupported: () => typeof navigator !== 'undefined' && 'gpu' in navigator,
};

export default meta;
