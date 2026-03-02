import { cn } from '@/lib/utils';

const SOURCE_LABELS: Record<string, string> = {
  website: '📍 Source: Website',
  text_file: '📁 Knowledge Base',
  external_link: '🔗 External Source',
  global: '🌐 Global Answer',
  fallback: '⚠️ Fallback',
  greeting: '🙏 Greeting',
  platform: '📁 Platform',
  web: 'Answer from web 🌐',
};

export function ModeToggle({
  mode,
  onModeChange,
  className,
}: {
  mode: 'platform' | 'global';
  onModeChange: (m: 'platform' | 'global') => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex rounded-xl bg-[#1A1A2E]/10 p-1 dark:bg-white/10',
        className
      )}
      role="tablist"
      aria-label="Chat mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'platform'}
        onClick={() => onModeChange('platform')}
        className={cn(
          'relative flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-300',
          mode === 'platform'
            ? 'text-white'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="relative z-10">🏠 Platform Only</span>
        {mode === 'platform' && (
          <span
            className="absolute inset-0 rounded-lg bg-[#FF6B35] shadow"
            style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        )}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'global'}
        onClick={() => onModeChange('global')}
        className={cn(
          'relative flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-300',
          mode === 'global'
            ? 'text-white'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="relative z-10">🌐 Global Search</span>
        {mode === 'global' && (
          <span
            className="absolute inset-0 rounded-lg bg-[#FF6B35] shadow"
            style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        )}
      </button>
    </div>
  );
}

export function getSourceLabel(source: string | undefined): string {
  if (!source) return '';
  return SOURCE_LABELS[source] || source;
}
