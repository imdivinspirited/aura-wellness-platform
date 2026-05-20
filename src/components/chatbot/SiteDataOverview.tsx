import { searchIndex, type SearchIndexItem } from '@/data/searchIndex';
import { Link } from 'react-router-dom';

type SectionKey =
  | 'programs'
  | 'services'
  | 'sevaCareers'
  | 'events'
  | 'exploreConnect'
  | 'other';

interface SnapshotItem extends SearchIndexItem {
  status: 'complete' | 'incomplete';
  missingFields: string[];
}

interface SectionSnapshot {
  key: SectionKey;
  label: string;
  items: SnapshotItem[];
}

function classifyItem(item: SearchIndexItem): SnapshotItem {
  const missingFields: string[] = [];

  if (!item.title || !item.title.trim()) {
    missingFields.push('title');
  }
  if (!item.description || !item.description.trim()) {
    missingFields.push('description');
  }
  if (!item.image) {
    missingFields.push('image');
  }

  const status: 'complete' | 'incomplete' = missingFields.length === 0 ? 'complete' : 'incomplete';

  return {
    ...item,
    status,
    missingFields,
  };
}

function groupKeyForUrl(url: string): SectionKey {
  if (url.startsWith('/programs')) return 'programs';
  if (url.startsWith('/services')) return 'services';
  if (url.startsWith('/seva-careers')) return 'sevaCareers';
  if (url.startsWith('/events')) return 'events';
  if (url.startsWith('/explore') || url.startsWith('/connect')) return 'exploreConnect';
  return 'other';
}

const SECTION_LABELS: Record<SectionKey, string> = {
  programs: 'Programs',
  services: 'Services',
  sevaCareers: 'Seva & Careers',
  events: 'Events',
  exploreConnect: 'Explore & Connect',
  other: 'Other',
};

function buildSnapshot(): SectionSnapshot[] {
  const bySection = new Map<SectionKey, SnapshotItem[]>();

  for (const raw of searchIndex) {
    const classified = classifyItem(raw);
    const key = groupKeyForUrl(raw.url);
    if (!bySection.has(key)) {
      bySection.set(key, []);
    }
    bySection.get(key)!.push(classified);
  }

  return (Array.from(bySection.entries()) as [SectionKey, SnapshotItem[]][])
    .sort(([a], [b]) => {
      const order: SectionKey[] = [
        'programs',
        'services',
        'sevaCareers',
        'events',
        'exploreConnect',
        'other',
      ];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([key, items]) => ({
      key,
      label: SECTION_LABELS[key],
      items: items.sort((a, b) => a.title.localeCompare(b.title)),
    }));
}

export function SiteDataOverview() {
  const sections = buildSnapshot();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-3">
        <h3 className="text-sm font-semibold mb-1">Website data snapshot</h3>
        <p className="text-xs text-muted-foreground">
          This view reflects the current navigation and search data used by the site. Items marked
          as complete have title, description, and image configured. Incomplete items show which
          pieces are still missing.
        </p>
      </div>

      {sections.map((section) => {
        const complete = section.items.filter((i) => i.status === 'complete');
        const incomplete = section.items.filter((i) => i.status === 'incomplete');

        return (
          <div key={section.key} className="rounded-2xl border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{section.label}</h4>
              <span className="text-[11px] text-muted-foreground">
                {complete.length} complete
                {incomplete.length > 0 ? ` · ${incomplete.length} incomplete` : ''}
              </span>
            </div>

            {complete.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Complete entries
                </p>
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {complete.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={item.url}
                          className="font-medium text-primary hover:underline block truncate"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t mt-2 pt-2">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                Incomplete entries
              </p>
              {incomplete.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  No incomplete items detected in this section based on current search data.
                </p>
              ) : (
                <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {incomplete.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={item.url}
                          className="font-medium text-primary hover:underline block truncate"
                        >
                          {item.title || item.id}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          Missing: {item.missingFields.join(', ')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

