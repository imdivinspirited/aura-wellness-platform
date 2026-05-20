import { cn } from '@/lib/utils';
import { ToolbarConciergeGlyph } from '@/components/icons/ToolbarGlyphSet';

type OperatorIconSize = 'toolbar' | 'sm' | 'md' | 'lg' | 'hero';

const glyphSize: Record<OperatorIconSize, string> = {
  toolbar: 'h-5 w-5 min-h-5 min-w-5',
  sm: 'h-6 w-6 min-h-6 min-w-6',
  md: 'h-7 w-7 min-h-7 min-w-7',
  lg: 'h-10 w-10 min-h-10 min-w-10',
  hero: 'h-20 w-20 min-h-20 min-w-20 sm:h-24 sm:w-24 sm:min-h-24 sm:min-w-24',
};

/**
 * Concierge — same premium double-bubble SVG at every size (toolbar hover uses parent `group`).
 */
export function OperatorChatGlyph({
  className,
  size = 'md',
}: {
  className?: string;
  size?: OperatorIconSize;
}) {
  return <ToolbarConciergeGlyph className={cn(glyphSize[size], className)} />;
}

type OperatorIconProps = {
  size?: OperatorIconSize;
  className?: string;
};

export function OperatorIcon({ size = 'md', className }: OperatorIconProps) {
  return <OperatorChatGlyph size={size} className={className} />;
}
