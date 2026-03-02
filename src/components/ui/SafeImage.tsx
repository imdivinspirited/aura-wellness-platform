import * as React from 'react';
import { IMAGE_CATEGORY_DEFAULTS, normalizePublicImagePath, type ImageCategory } from '@/lib/media/imageDefaults';
import { cn } from '@/lib/utils';

export type SafeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  category: ImageCategory;
  /**
   * Optional explicit fallback, otherwise category default is used.
   */
  fallbackSrc?: string;
};

/**
 * SafeImage
 *
 * - If src missing -> category default
 * - If src fails to load -> category default, then /placeholder.svg
 * - Normalizes legacy public paths (e.g. /images/shops -> /images/shopping)
 */
export function SafeImage({
  src,
  category,
  fallbackSrc,
  className,
  alt,
  ...rest
}: SafeImageProps) {
  const categoryDefault = fallbackSrc || IMAGE_CATEGORY_DEFAULTS[category];
  const initial = normalizePublicImagePath(src) || categoryDefault;
  const [currentSrc, setCurrentSrc] = React.useState<string>(initial);

  React.useEffect(() => {
    setCurrentSrc(normalizePublicImagePath(src) || categoryDefault);
  }, [src, categoryDefault]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const next =
      img.src.endsWith(categoryDefault) || img.src.endsWith('/placeholder.svg')
        ? '/placeholder.svg'
        : categoryDefault;
    // Avoid infinite loops
    if (img.src.endsWith(next)) return;
    setCurrentSrc(next);
  };

  return (
    <img
      src={currentSrc}
      alt={alt ?? ''}
      className={cn(className)}
      onError={handleError}
      {...rest}
    />
  );
}

