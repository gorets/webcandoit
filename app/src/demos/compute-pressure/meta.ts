import type { DemoMeta } from '../types';

const meta: DemoMeta = {
  slug: 'compute-pressure',
  title: 'Compute Pressure',
  category: 'activity',
  description:
    "Monitor the CPU's current pressure state — nominal, fair, serious or critical — live.",
  specUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Compute_Pressure_API',
  isSupported: () => typeof globalThis !== 'undefined' && 'PressureObserver' in globalThis,
};

export default meta;
