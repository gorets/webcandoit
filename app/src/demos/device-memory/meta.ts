import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'device-memory',
  title: 'Device Memory',
  category: 'device',
  description:
    "Read the device's approximate amount of RAM in gigabytes via the Device Memory API.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Device_Memory_API',
  isSupported: () => typeof navigator !== 'undefined' && 'deviceMemory' in navigator,
};

export default meta;
