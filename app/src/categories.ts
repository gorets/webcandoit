import type { DemoCategory } from './demos/types';

export const CATEGORY_ORDER: DemoCategory[] = [
  'installation',
  'ai',
  'notifications',
  'security',
  'display',
  'system',
  'actions',
  'network',
  'camera',
  'audio',
  'input',
  'graphics',
  'screen',
  'activity',
  'device',
  'hardware',
];

export const CATEGORY_LABELS: Record<DemoCategory, string> = {
  installation: 'Installation',
  ai: 'AI',
  notifications: 'Notifications',
  security: 'Security',
  display: 'Display',
  system: 'System',
  actions: 'Actions',
  network: 'Network',
  camera: 'Camera',
  audio: 'Audio',
  input: 'Input',
  graphics: 'Graphics',
  screen: 'Screen',
  activity: 'Activity',
  device: 'Device',
  hardware: 'Hardware',
};

export function categorySectionId(category: DemoCategory): string {
  return `cat-${category}`;
}
