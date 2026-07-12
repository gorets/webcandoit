import type { DemoCategory } from '../demos/types';
import { CATEGORY_LUCIDE_ICONS } from './icons/lucide-map';

export function CategoryIcon({ category, size = 18 }: { category: DemoCategory; size?: number }) {
  const Icon = CATEGORY_LUCIDE_ICONS[category];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
