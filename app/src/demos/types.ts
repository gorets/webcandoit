export type DemoCategory =
  | 'installation'
  | 'ai'
  | 'notifications'
  | 'security'
  | 'display'
  | 'system'
  | 'actions'
  | 'network'
  | 'camera'
  | 'audio'
  | 'input'
  | 'graphics'
  | 'screen'
  | 'activity'
  | 'device'
  | 'hardware';

export interface DemoMeta {
  slug: string;
  title: string;
  category: DemoCategory;
  description: string;
  specUrl: string;
  isSupported: () => boolean;
  requiresBackend?: boolean;
  requiresInstall?: boolean;
  favorite?: boolean;
  newFeature?: boolean;
}
