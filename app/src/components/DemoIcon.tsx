import type { DemoCategory } from '../demos/types';
import { IconSvg } from './IconSvg';
import { CATEGORY_LUCIDE_ICONS, DEMO_LUCIDE_ICONS } from './icons/lucide-map';

const FACE_DETECTION_ICON = (
  <>
    <circle cx="12" cy="13" r="8" />
    <path d="M5.3 10.5c1-4.3 4.2-6.8 7-6.2a7 7 0 0 1 3.7 2" />
    <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
  </>
);

export function DemoIcon({
  slug,
  category,
  size = 18,
}: {
  slug: string;
  category: DemoCategory;
  size?: number;
}) {
  if (slug === 'face-detection') {
    return <IconSvg size={size}>{FACE_DETECTION_ICON}</IconSvg>;
  }
  const Icon = DEMO_LUCIDE_ICONS[slug] ?? CATEGORY_LUCIDE_ICONS[category];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
