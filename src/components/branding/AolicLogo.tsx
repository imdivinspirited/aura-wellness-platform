import type { CSSProperties } from 'react';
import { useResolvedThemeMode } from '@/hooks/useResolvedThemeMode';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';

// Light UI: full-colour mark · Dark UI: white mark (swap constants again if artwork/names don’t match).
const SRC_FOR_LIGHT_UI = '/images/logos/aolic_logo.png';
const SRC_FOR_DARK_UI = '/images/logos/aolic_logo_white.png';

export type AolicLogoProps = {
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Default: pick from Settings theme. Use `onDark` for always-dark surfaces (e.g. footer band). */
  variant?: 'auto' | 'onDark';
};

/**
 * Theme-aware mark: coloured logo in light UI, white logo in dark UI (`onDark` = dark-surface footer, etc.).
 * Uses Settings theme via `useResolvedThemeMode`, not Tailwind `dark:` alone.
 */
export function AolicLogo({ alt, className, style, variant = 'auto' }: AolicLogoProps) {
  const theme = useUserStore((s) => s.appearance.theme);
  const resolved = useResolvedThemeMode(theme);
  const src = variant === 'onDark' || resolved === 'dark' ? SRC_FOR_DARK_UI : SRC_FOR_LIGHT_UI;

  return (
    <img
      src={src}
      alt={alt}
      className={cn(className)}
      style={style}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}
