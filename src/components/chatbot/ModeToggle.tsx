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

// Mode toggle UI has been removed – chatbot now runs in platform-only mode.
export function ModeToggle() {
  return null;
}

export function getSourceLabel(source: string | undefined): string {
  if (!source) return '';
  return SOURCE_LABELS[source] || source;
}
