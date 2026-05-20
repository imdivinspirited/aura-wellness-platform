/**
 * Site search — Fuse + advanced query (phrases, excludes, category:), sort, highlights,
 * autocomplete, related by tags, saved/trending hints, click signals.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  Loader2,
  ArrowRight,
  Sparkles,
  Bookmark,
  TrendingUp,
  Mic,
  Eraser,
  ThumbsUp,
  ThumbsDown,
  Link2,
  Share2,
  Download,
  LayoutList,
  LayoutGrid,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  Printer,
  Volume2,
  ImageIcon,
  Grid3x3,
  BarChart3,
} from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFuseSearch } from '@/lib/search/hooks/useFuseSearch';
import type { FuseSearchResult, SearchSortMode } from '@/lib/search/hooks/useFuseSearch';
import { getRecentSearches } from '@/lib/search/utils/recentSearches';
import {
  addSavedSearchQuery,
  getSavedSearchQueries,
  removeSavedSearchQuery,
} from '@/lib/search/savedSearchesStorage';
import { getTopClickedPaths } from '@/lib/search/clickSignals';
import { searchIndex } from '@/data/searchIndex';
import { HighlightedText } from '@/components/search/HighlightedText';
import { useTranslation } from '@/lib/i18n';
import { getPopularQueries, getTotalRecordedSearchEvents } from '@/lib/search/searchAnalytics';
import { getFeedbackForUrl, setFeedbackForUrl, type FeedbackValue } from '@/lib/search/searchFeedback';
import { categoryBadgeClass } from '@/lib/search/categoryStyles';
import { getSafeSearchEnabled, setSafeSearchEnabled } from '@/lib/search/safeSearchSettings';
import { detectSensitiveQueryInput } from '@/lib/search/queryPiiWarning';
import { getZeroResultQueries, getApproximateCtr } from '@/lib/search/searchAnalytics';
import { isBookmarked, toggleBookmark } from '@/lib/search/searchBookmarks';
import { SearchCapabilityMatrix } from '@/components/search/SearchCapabilityMatrix';
import { urlPathBreadcrumb } from '@/lib/search/urlBreadcrumb';
import { getClientIdentifier, getRateLimitRetryAfterMs } from '@/lib/search/utils/rateLimiting';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SITE_SEARCH_SERVER =
  import.meta.env.VITE_SITE_SEARCH_SERVER === 'true' || import.meta.env.VITE_SITE_SEARCH_SERVER === '1';
/** Slightly longer debounce when Elasticsearch backs search — fewer cancelled in-flight requests. */
const SEARCH_DEBOUNCE_MS = SITE_SEARCH_SERVER ? 200 : 120;

function titleForUrl(url: string): string {
  return searchIndex.find((i) => i.url === url)?.title ?? url;
}

const quickLinks = [
  { to: '/programs', labelKey: 'search.quickPrograms' as const },
  { to: '/events', labelKey: 'search.quickEvents' as const },
  { to: '/services/stay', labelKey: 'search.quickStay' as const },
  { to: '/explore', labelKey: 'search.quickExplore' as const },
  { to: '/services', labelKey: 'search.quickServices' as const },
  { to: '/connect', labelKey: 'search.quickConnect' as const },
];

function resultAbsoluteUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function exportResultsCsv(rows: FuseSearchResult[]): void {
  const header = 'title,category,url,description\n';
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const body = rows
    .map((r) =>
      [esc(r.title), esc(r.category), esc(resultAbsoluteUrl(r.url)), esc(r.description ?? '')].join(','),
    )
    .join('\n');
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aolic-search-results.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggest, setShowSuggest] = useState(false);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  type ResultLayout = 'list' | 'compact' | 'grid';
  const [resultLayout, setResultLayout] = useState<ResultLayout>('list');
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const [rateLimitUiTick, setRateLimitUiTick] = useState(0);
  const [feedbackTick, setFeedbackTick] = useState(0);
  const [listening, setListening] = useState(false);
  const [voiceInterim, setVoiceInterim] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  /** Synced immediately on start/stop — avoids double `start()` before React re-renders `listening`. */
  const voiceActiveRef = useRef(false);
  const [safeOn, setSafeOn] = useState(() =>
    typeof window !== 'undefined' ? getSafeSearchEnabled() : false,
  );
  const [capMatrixOpen, setCapMatrixOpen] = useState(false);
  const [bookmarkTick, setBookmarkTick] = useState(0);
  const [discoverMoreOpen, setDiscoverMoreOpen] = useState(false);
  const [searchToolsOpen, setSearchToolsOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    pagedResults,
    page,
    setPage,
    pageSize,
    setPageSize,
    allowedPageSizes,
    totalPages,
    isLoading,
    rateLimited,
    rateLimitRetryAfterMs,
    clear,
    recordResultClick,
    total,
    sortBy,
    setSortBy,
    highlightTerms,
    suggestions,
    relatedResults,
    relatedQueryChips,
    corrections,
  } = useFuseSearch(SEARCH_DEBOUNCE_MS, safeOn, bookmarkTick + feedbackTick);

  const piiKind = useMemo(() => detectSensitiveQueryInput(query), [query]);

  const showResults = results.length > 0 && query.trim().length > 0;
  const recentSearches = getRecentSearches(5);

  const trending = useMemo(() => {
    if (typeof window === 'undefined' || !open) return [];
    return getTopClickedPaths(6);
  }, [open]);

  const popularQueries = useMemo(() => {
    if (typeof window === 'undefined' || !open) return [];
    return getPopularQueries(8);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSavedQueries(getSavedSearchQueries());
      setSafeOn(getSafeSearchEnabled());
    }
  }, [open]);

  /** DNS prefetch for API origin when modal opens — helps first server search when VITE_API_BASE_URL is absolute. */
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    try {
      const base = import.meta.env.VITE_API_BASE_URL?.trim();
      if (!base || !/^https?:\/\//i.test(base)) return;
      const u = new URL(base);
      const id = `dns-prefetch-search-api-${u.host}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'dns-prefetch';
      link.href = `${u.protocol}//${u.host}`;
      document.head.appendChild(link);
    } catch {
      /* ignore */
    }
  }, [open]);

  const zeroQueries = useMemo(() => {
    if (typeof window === 'undefined' || !open) return [];
    return getZeroResultQueries(10);
  }, [open, query]);

  const approxCtr = useMemo(() => {
    if (typeof window === 'undefined' || !open) return 0;
    return getApproximateCtr();
  }, [open, total]);

  const totalSearchEvents = useMemo(() => {
    if (typeof window === 'undefined' || !open) return 0;
    return getTotalRecordedSearchEvents();
  }, [open, query, total]);

  useEffect(() => {
    if (!open || !showResults || page >= totalPages) return;
    const nextStart = page * pageSize;
    const slice = results.slice(nextStart, nextStart + pageSize);
    const urls = slice.map((r) => r.image).filter(Boolean) as string[];
    if (urls.length === 0) return;

    const run = () => {
      for (const src of urls) {
        const img = new Image();
        img.src = src;
      }
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run);
      return () => cancelIdleCallback(id);
    }
    const to = setTimeout(run, 200);
    return () => clearTimeout(to);
  }, [open, showResults, page, pageSize, totalPages, results]);

  useEffect(() => {
    setSuggestIndex(-1);
  }, [query]);

  useEffect(() => {
    if (!open || !rateLimited) return;
    const id = window.setInterval(() => setRateLimitUiTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [open, rateLimited]);

  const liveRateLimitRetryMs = useMemo(() => {
    if (!rateLimited) return rateLimitRetryAfterMs;
    return getRateLimitRetryAfterMs(getClientIdentifier());
  }, [rateLimited, rateLimitRetryAfterMs, rateLimitUiTick]);

  useEffect(() => {
    if (open && inputRef.current) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    clear();
    setSelectedIndex(-1);
    setShowSuggest(false);
    setSuggestIndex(-1);
    return undefined;
  }, [open, clear]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [page, showResults]);

  const totalItems = showResults ? pagedResults.length : query.length === 0 ? recentSearches.length : 0;

  const handleResultClick = useCallback(
    (result: FuseSearchResult) => {
      recordResultClick(result.url);
      navigate(result.url);
      onOpenChange(false);
      clear();
    },
    [navigate, onOpenChange, clear, recordResultClick],
  );

  const handleRecentClick = useCallback(
    (recentQuery: string) => {
      setQuery(recentQuery);
      inputRef.current?.focus();
    },
    [setQuery],
  );

  const applySuggestion = useCallback(
    (text: string) => {
      setQuery(text);
      setShowSuggest(false);
      setSuggestIndex(-1);
      inputRef.current?.focus();
    },
    [setQuery],
  );

  const handleSaveSearch = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) return;
    addSavedSearchQuery(q);
    setSavedQueries(getSavedSearchQueries());
  }, [query]);

  const handleRemoveSaved = useCallback((q: string) => {
    removeSavedSearchQuery(q);
    setSavedQueries(getSavedSearchQueries());
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const suggestOpen = showSuggest && suggestions.length > 0;
      if (suggestOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSuggestIndex((prev) => Math.min(suggestions.length - 1, prev + 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSuggestIndex((prev) => Math.max(-1, prev - 1));
          return;
        }
        if (e.key === 'Enter' && suggestIndex >= 0 && suggestions[suggestIndex]) {
          e.preventDefault();
          applySuggestion(suggestions[suggestIndex]);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowSuggest(false);
          setSuggestIndex(-1);
          return;
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (showResults && pagedResults[selectedIndex]) {
          handleResultClick(pagedResults[selectedIndex]);
        } else if (query.length === 0) {
          const recentItem = recentSearches[selectedIndex];
          if (recentItem?.query) {
            setQuery(recentItem.query);
            setSelectedIndex(-1);
          }
        }
      } else if (e.key === 'Escape') {
        if (showSuggest) {
          setShowSuggest(false);
          setSuggestIndex(-1);
        } else {
          onOpenChange(false);
        }
      }
    },
    [
      selectedIndex,
      showResults,
      pagedResults,
      query,
      totalItems,
      onOpenChange,
      setQuery,
      recentSearches,
      handleResultClick,
      showSuggest,
      suggestions,
      suggestIndex,
      applySuggestion,
    ],
  );

  const handleQuickNav = useCallback(
    (path: string) => {
      navigate(path);
      onOpenChange(false);
      clear();
    },
    [navigate, onOpenChange, clear],
  );

  const handleTrendingClick = useCallback(
    (url: string) => {
      navigate(url);
      onOpenChange(false);
      clear();
    },
    [navigate, onOpenChange, clear],
  );

  const handlePrintResults = useCallback(() => {
    window.print();
  }, []);

  const speakSnippet = useCallback((e: React.MouseEvent, text: string, title: string) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${title}. ${text.slice(0, 500)}`);
    u.lang = document.documentElement.lang || 'en-US';
    window.speechSynthesis.speak(u);
  }, []);

  const handleBookmarkToggle = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    toggleBookmark(url);
    setBookmarkTick((x) => x + 1);
  }, []);

  const handleImagePicked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const base = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      setQuery((prev) => (prev ? `${prev} ${base}` : base));
      e.target.value = '';
    },
    [setQuery],
  );

  const sortLabel = (mode: SearchSortMode) => {
    if (mode === 'title') return t('search.sortTitle');
    if (mode === 'category') return t('search.sortCategory');
    if (mode === 'popularity') return t('search.sortPopularity');
    if (mode === 'freshness') return t('search.sortFreshness');
    return t('search.sortRelevance');
  };

  const stopVoiceInput = useCallback(() => {
    voiceActiveRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try {
        rec.abort();
      } catch {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
    }
    setListening(false);
    setVoiceInterim('');
  }, []);

  const startVoiceInput = useCallback(() => {
    if (voiceActiveRef.current) {
      stopVoiceInput();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = document.documentElement.lang || 'en-US';
    rec.interimResults = true;
    /** `continuous: true` breaks or ends instantly on several Chromium/WebKit builds; single-phrase mode is reliable. */
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      let finalChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const piece = r[0]?.transcript ?? '';
        if (r.isFinal) finalChunk += piece;
        else interim += piece;
      }
      if (finalChunk.trim()) {
        const add = finalChunk.trim();
        setQuery((prev) => (prev ? `${prev} ${add}` : add));
        setVoiceInterim('');
      } else {
        setVoiceInterim(interim.trim());
      }
    };

    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      const code = ev.error;
      if (code === 'aborted') return;
      if (code === 'no-speech') return;
      voiceActiveRef.current = false;
      recognitionRef.current = null;
      setListening(false);
      setVoiceInterim('');
    };

    rec.onend = () => {
      voiceActiveRef.current = false;
      recognitionRef.current = null;
      setListening(false);
      setVoiceInterim('');
    };

    voiceActiveRef.current = true;
    setListening(true);
    setVoiceInterim('');

    const runStart = () => {
      if (!voiceActiveRef.current || recognitionRef.current !== rec) return;
      try {
        rec.start();
      } catch {
        voiceActiveRef.current = false;
        recognitionRef.current = null;
        setListening(false);
        setVoiceInterim('');
      }
    };
    /** After aborting a prior session, same-tick `start()` can throw InvalidStateError in Chrome. */
    queueMicrotask(runStart);
  }, [setQuery, stopVoiceInput]);

  useEffect(() => {
    if (!open) stopVoiceInput();
  }, [open, stopVoiceInput]);

  const handleFeedback = useCallback((e: React.MouseEvent, url: string, value: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    const cur = getFeedbackForUrl(url);
    const next: FeedbackValue = cur === value ? 0 : value;
    setFeedbackForUrl(url, next);
    setFeedbackTick((x) => x + 1);
  }, []);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        overlayClassName="z-[10100] bg-background/75 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        className={cn(
          'z-[10101] max-h-[min(85vh,720px)] max-w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0 sm:max-w-xl',
          'border-border/40 bg-card/98 shadow-2xl shadow-black/[0.07] ring-1 ring-black/[0.04] dark:bg-card/95 dark:ring-white/[0.06]',
          'rounded-2xl sm:rounded-2xl',
        )}
      >
        <DialogTitle className="sr-only">{t('search.ariaSearch')}</DialogTitle>

        {/* Search field */}
        <div className="relative border-b border-border/40 bg-gradient-to-b from-muted/25 via-background to-background">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            aria-hidden
          />
          <div className="relative flex items-start gap-3 px-4 pb-3 pt-4">
            <span
              className={cn(
                'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:mt-0',
                'bg-muted/60 text-primary ring-1 ring-border/40',
              )}
              aria-hidden
            >
              <Search className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5 sm:pt-0">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Input
                    ref={inputRef}
                    type="search"
                    placeholder={t('search.modalPlaceholder')}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggest(true);
                      setSuggestIndex(-1);
                    }}
                    onFocus={() => setShowSuggest(true)}
                    onBlur={() => window.setTimeout(() => setShowSuggest(false), 180)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'h-auto min-h-[2.75rem] border-0 bg-transparent px-0 py-1 text-base font-medium tracking-tight',
                      'placeholder:text-muted-foreground/75 focus-visible:ring-0 focus-visible:ring-offset-0',
                    )}
                    aria-label={t('search.ariaSearch')}
                    aria-autocomplete="list"
                    aria-expanded={
                      (showSuggest && suggestions.length > 0) ||
                      showResults ||
                      (query.length === 0 && recentSearches.length > 0)
                    }
                    aria-controls={showSuggest && suggestions.length > 0 ? 'search-autocomplete-list' : undefined}
                  />
                  {showSuggest && suggestions.length > 0 ? (
                    <ul
                      id="search-autocomplete-list"
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-border/60 bg-popover py-1 shadow-lg"
                      role="listbox"
                    >
                      {suggestions.map((s, si) => (
                        <li key={s} role="option" aria-selected={suggestIndex === si}>
                          <button
                            type="button"
                            className={cn(
                              'flex w-full px-3 py-2 text-left text-sm hover:bg-muted/80',
                              suggestIndex === si && 'bg-muted/80',
                            )}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setSuggestIndex(si)}
                            onClick={() => applySuggestion(s)}
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-start gap-0.5 pt-0.5">
                  <div className="relative flex h-9 w-9 items-center justify-center">
                    {listening ? (
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 animate-ping"
                        aria-hidden
                      />
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'relative h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground',
                        listening &&
                          'text-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background animate-pulse',
                      )}
                      onClick={startVoiceInput}
                      aria-label={listening ? t('search.voiceTapToStop') : t('search.voiceSearch')}
                      aria-pressed={listening}
                      title={listening ? t('search.voiceTapToStop') : t('search.voiceSearch')}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground',
                      !query.trim() && 'pointer-events-none invisible',
                    )}
                    onClick={clear}
                    aria-label={t('search.ariaClear')}
                    title={t('search.ariaClear')}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      aria-label={t('search.close')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
              {listening ? (
                <div
                  className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-2 text-xs text-foreground"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 items-end gap-0.5" aria-hidden>
                      <span className="h-2 w-0.5 animate-bounce rounded-sm bg-primary [animation-delay:0ms]" />
                      <span className="h-4 w-0.5 animate-bounce rounded-sm bg-primary [animation-delay:120ms]" />
                      <span className="h-2.5 w-0.5 animate-bounce rounded-sm bg-primary [animation-delay:240ms]" />
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{t('search.voiceListening')}</span>
                  </div>
                  {voiceInterim ? (
                    <p className="mt-1.5 border-t border-primary/15 pt-1.5 text-[0.7rem] leading-snug text-muted-foreground">
                      {voiceInterim}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="text-[0.7rem] text-muted-foreground/90 sm:text-xs">{t('search.modalSubtitle')}</p>
              {corrections.length > 0 ? (
                <p className="mt-0.5 text-[0.65rem] text-primary/90 sm:text-xs">
                  <span className="font-medium">{t('search.correctionsLabel')}</span> {corrections.join(' · ')}
                </p>
              ) : null}
              {piiKind ? (
                <p className="mt-1 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-[0.65rem] text-amber-950 dark:text-amber-100">
                  {piiKind === 'email'
                    ? t('search.piiEmail')
                    : piiKind === 'phone'
                      ? t('search.piiPhone')
                      : t('search.piiCard')}
                </p>
              ) : null}
            </div>
          </div>
          <Collapsible open={searchToolsOpen} onOpenChange={setSearchToolsOpen} className="border-t border-border/30">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-[0.7rem] font-medium text-muted-foreground transition-colors hover:bg-muted/25 hover:text-foreground"
              >
                <span>{t('search.moreSearchOptions')}</span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 opacity-70 transition-transform', searchToolsOpen && 'rotate-180')}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 border-t border-border/25 bg-muted/10 px-4 pb-3 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="aolic-safe-search"
                  checked={safeOn}
                  onCheckedChange={(v) => {
                    setSafeOn(v);
                    setSafeSearchEnabled(v);
                  }}
                />
                <label htmlFor="aolic-safe-search" className="cursor-pointer text-[0.7rem] text-muted-foreground">
                  {t('search.safeSearchToggle')}
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-[0.7rem]"
                  onClick={() => setCapMatrixOpen(true)}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                  {t('search.capMatrixButton')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-[0.7rem]"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  {t('search.imageQuery')}
                </Button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePicked}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain [contain:content] print:max-h-none">
          {query.trim().length > 0 && rateLimited ? (
            <div className="border-b border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-[0.7rem] text-amber-950 dark:text-amber-50">
              <p className="font-semibold">{t('search.rateLimitedTitle')}</p>
              <p className="mt-0.5 text-[0.65rem] opacity-95">
                {t('search.rateLimitedHint').replace(
                  '{{seconds}}',
                  String(Math.max(1, Math.ceil(liveRateLimitRetryMs / 1000))),
                )}
              </p>
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-16"
              >
                <Loader2 className="h-7 w-7 animate-spin text-primary/70" />
                <span className="text-xs font-medium text-muted-foreground">{t('common.loading')}</span>
              </motion.div>
            )}

            {!isLoading && showResults && results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="p-3 sm:p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('common.search')}
                    </span>
                    <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[0.65rem] tabular-nums text-muted-foreground">
                      {total} {total === 1 ? t('search.resultOne') : t('search.resultOther')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-[0.7rem] print:hidden"
                      onClick={handlePrintResults}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      {t('search.printResults')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-[0.7rem]"
                      onClick={() => exportResultsCsv(results)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t('search.exportCsv')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-[0.7rem]"
                      onClick={handleSaveSearch}
                      disabled={query.trim().length < 2}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {t('search.saveSearch')}
                    </Button>
                    <div
                      className="inline-flex items-center rounded-md border border-border/50 p-0.5"
                      role="group"
                      aria-label={t('search.resultLayoutGroup')}
                    >
                      <Button
                        type="button"
                        variant={resultLayout === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setResultLayout('list')}
                        aria-pressed={resultLayout === 'list'}
                        aria-label={t('search.listView')}
                        title={t('search.listView')}
                      >
                        <LayoutList className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant={resultLayout === 'compact' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setResultLayout('compact')}
                        aria-pressed={resultLayout === 'compact'}
                        aria-label={t('search.compactView')}
                        title={t('search.compactView')}
                      >
                        <AlignJustify className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant={resultLayout === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setResultLayout('grid')}
                        aria-pressed={resultLayout === 'grid'}
                        aria-label={t('search.gridView')}
                        title={t('search.gridView')}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="h-8 w-[4.5rem] text-[0.7rem]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedPageSizes.map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}/{t('search.page')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SearchSortMode)}>
                      <SelectTrigger className="h-8 w-[min(100%,12rem)] text-[0.7rem]">
                        <SelectValue placeholder={sortLabel(sortBy)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">{t('search.sortRelevance')}</SelectItem>
                        <SelectItem value="popularity">{t('search.sortPopularity')}</SelectItem>
                        <SelectItem value="freshness">{t('search.sortFreshness')}</SelectItem>
                        <SelectItem value="title">{t('search.sortTitle')}</SelectItem>
                        <SelectItem value="category">{t('search.sortCategory')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ul
                  className={cn(
                    'space-y-1.5',
                    resultLayout === 'grid' && 'grid grid-cols-1 gap-2 space-y-0 sm:grid-cols-2',
                  )}
                  role="listbox"
                >
                  {pagedResults.map((result, index) => {
                    const isCompact = resultLayout === 'compact';
                    const isGrid = resultLayout === 'grid';
                    const pathCrumb = urlPathBreadcrumb(result.url);
                    return (
                      <li key={result.id} role="none" className={cn(isGrid && 'min-h-0')}>
                        <div
                          role="option"
                          aria-selected={selectedIndex === index}
                          className={cn(
                            'group flex w-full rounded-xl border border-transparent text-left transition-colors',
                            isGrid
                              ? 'h-full flex-col gap-2 p-3'
                              : cn('gap-2 sm:gap-3', isCompact ? 'p-2' : 'p-3'),
                            'hover:border-border/60 hover:bg-muted/50',
                            'focus-within:border-border/60 focus-within:bg-muted/50',
                            selectedIndex === index && 'border-border/60 bg-muted/60',
                          )}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <button
                            type="button"
                            className={cn(
                              'flex min-w-0 flex-1 text-left',
                              isGrid ? 'flex-col gap-2' : 'gap-2 sm:gap-3',
                            )}
                            onClick={() => handleResultClick(result)}
                          >
                            {result.image ? (
                              <img
                                src={result.image}
                                alt=""
                                loading={index < 4 ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchPriority={index < 3 ? 'high' : 'low'}
                                className={cn(
                                  'shrink-0 rounded-lg object-cover ring-1 ring-border/40',
                                  isGrid ? 'h-32 w-full' : isCompact ? 'h-10 w-10' : 'h-14 w-14',
                                )}
                              />
                            ) : (
                              <span
                                className={cn(
                                  'flex shrink-0 items-center justify-center rounded-lg bg-muted/70 ring-1 ring-border/30',
                                  isGrid ? 'h-32 w-full' : isCompact ? 'h-10 w-10' : 'h-14 w-14',
                                )}
                              >
                                <Sparkles
                                  className={cn(
                                    isGrid ? 'h-10 w-10' : 'h-5 w-5',
                                    'text-muted-foreground/60',
                                  )}
                                  aria-hidden
                                />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="font-serif text-sm font-semibold leading-snug text-foreground">
                                  <HighlightedText text={result.title} terms={highlightTerms} />
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-[0.65rem] font-normal uppercase tracking-wide',
                                    categoryBadgeClass(result.category),
                                  )}
                                >
                                  {result.category}
                                </Badge>
                              </div>
                              {pathCrumb ? (
                                <p
                                  className="mb-1 truncate font-mono text-[0.65rem] text-muted-foreground/90"
                                  title={pathCrumb}
                                >
                                  {pathCrumb}
                                </p>
                              ) : null}
                              {result.description ? (
                                <p
                                  className={cn(
                                    'text-xs leading-relaxed text-muted-foreground',
                                    isCompact && !isGrid ? 'line-clamp-1' : 'line-clamp-2',
                                  )}
                                >
                                  <HighlightedText text={result.description} terms={highlightTerms} />
                                </p>
                              ) : null}
                            </div>
                            {!isGrid ? (
                              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:mt-0" />
                            ) : null}
                          </button>
                          <div
                            className={cn(
                              'flex shrink-0 gap-0.5',
                              isGrid
                                ? 'w-full flex-row flex-wrap justify-end border-t border-border/30 pt-2'
                                : 'flex-col sm:flex-row sm:items-center',
                            )}
                          >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            aria-label={t('search.copyLink')}
                            onClick={(e) => {
                              e.stopPropagation();
                              void navigator.clipboard.writeText(resultAbsoluteUrl(result.url));
                            }}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            aria-label={t('search.shareResult')}
                            onClick={(e) => {
                              e.stopPropagation();
                              const u = resultAbsoluteUrl(result.url);
                              if (navigator.share) {
                                void navigator.share({ title: result.title, url: u });
                              } else {
                                void navigator.clipboard.writeText(u);
                              }
                            }}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8',
                              isBookmarked(result.url) ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                            )}
                            aria-label={t('search.bookmarkResult')}
                            onClick={(e) => handleBookmarkToggle(e, result.url)}
                          >
                            <Star
                              className={cn('h-3.5 w-3.5', isBookmarked(result.url) && 'fill-current')}
                            />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            aria-label={t('search.ttsResult')}
                            onClick={(e) =>
                              speakSnippet(e, result.description ?? result.title, result.title)
                            }
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8',
                              getFeedbackForUrl(result.url) === 1 ? 'text-primary' : 'text-muted-foreground',
                            )}
                            aria-label={t('search.thumbsUp')}
                            onClick={(e) => handleFeedback(e, result.url, 1)}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8',
                              getFeedbackForUrl(result.url) === -1 ? 'text-destructive' : 'text-muted-foreground',
                            )}
                            aria-label={t('search.thumbsDown')}
                            onClick={(e) => handleFeedback(e, result.url, -1)}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
                {totalPages > 1 ? (
                  <div className="mt-4 flex items-center justify-center gap-3 border-t border-border/30 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label={t('search.prevPage')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-[0.7rem] tabular-nums text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      aria-label={t('search.nextPage')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                {relatedResults.length > 0 ? (
                  <div className="mt-5 border-t border-border/40 pt-4">
                    <div className="mb-2 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                      {t('search.relatedTitle')}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {relatedResults.map((rel) => (
                        <li key={rel.id}>
                          <button
                            type="button"
                            className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                            onClick={() => handleResultClick({ ...rel, score: rel.score })}
                          >
                            <span className="font-medium text-foreground">{rel.title}</span>
                            <span className="mx-1.5 text-muted-foreground/70">·</span>
                            {rel.category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {relatedQueryChips.length > 0 ? (
                  <div className="mt-4 border-t border-border/40 pt-4">
                    <div className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('search.relatedQueriesTitle')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {relatedQueryChips.map((rq) => (
                        <button
                          key={rq}
                          type="button"
                          className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-[0.65rem] font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
                          onClick={() => applySuggestion(rq)}
                        >
                          {rq}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}

            {!isLoading && !showResults && query.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 sm:p-5"
              >
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary/70" strokeWidth={2} />
                    {t('search.suggestedLabel')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickLinks.map((link) => (
                      <button
                        key={link.to}
                        type="button"
                        onClick={() => handleQuickNav(link.to)}
                        className={cn(
                          'rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium',
                          'transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                        )}
                      >
                        {t(link.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                {recentSearches.length > 0 ? (
                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      {t('search.recentTitle')}
                    </div>
                    <ul className="space-y-1" role="listbox">
                      {recentSearches.map((recentItem, index) => (
                        <li key={`${recentItem.query}-${recentItem.timestamp}`} role="none">
                          <button
                            type="button"
                            role="option"
                            className={cn(
                              'w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                              'hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                              selectedIndex === index && 'bg-muted/70',
                            )}
                            onClick={() => handleRecentClick(recentItem.query)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            {recentItem.query}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Collapsible open={discoverMoreOpen} onOpenChange={setDiscoverMoreOpen} className="mb-2">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/15 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted/35"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5 text-primary/70" strokeWidth={2} />
                        {t('search.discoverMoreTitle')}
                      </span>
                      <ChevronDown
                        className={cn('h-4 w-4 shrink-0 transition-transform', discoverMoreOpen && 'rotate-180')}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-5 border-x border-b border-border/40 rounded-b-lg bg-muted/5 px-3 py-4">
                    {popularQueries.length > 0 ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-primary/60" strokeWidth={2} />
                          {t('search.popularQueriesTitle')}
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {popularQueries.map(({ query: pq, count }) => (
                            <li key={pq}>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/10"
                                onClick={() => handleRecentClick(pq)}
                              >
                                <span>{pq}</span>
                                <span className="text-[0.6rem] tabular-nums text-muted-foreground">{count}×</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2 font-medium text-foreground">
                        <BarChart3 className="h-3.5 w-3.5 shrink-0 text-primary/70" strokeWidth={2} />
                        {t('search.localAnalytics')}
                      </p>
                      <p>
                        {t('search.ctrApprox')}:{' '}
                        <span className="font-mono text-foreground">{(approxCtr * 100).toFixed(1)}%</span>
                      </p>
                      <p>
                        {t('search.totalSearchEvents')}:{' '}
                        <span className="font-mono text-foreground">{totalSearchEvents}</span>
                      </p>
                      {zeroQueries.length > 0 ? (
                        <div>
                          <p className="mb-1.5 font-medium text-foreground">{t('search.zeroQueriesTitle')}</p>
                          <ul className="max-h-32 space-y-1 overflow-y-auto">
                            {zeroQueries.map((z) => (
                              <li key={z.query} className="flex justify-between gap-2">
                                <span className="min-w-0 truncate">{z.query}</span>
                                <span className="shrink-0 tabular-nums">{z.count}×</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-[0.65rem]">{t('search.zeroQueriesEmpty')}</p>
                      )}
                    </div>

                    {savedQueries.length > 0 ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          <Bookmark className="h-3.5 w-3.5" strokeWidth={2} />
                          {t('search.savedTitle')}
                        </div>
                        <ul className="flex flex-wrap gap-2">
                          {savedQueries.map((sq) => (
                            <li key={sq} className="group relative">
                              <button
                                type="button"
                                className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 pr-7 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/10"
                                onClick={() => handleRecentClick(sq)}
                              >
                                {sq}
                              </button>
                              <button
                                type="button"
                                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                                aria-label={t('search.removeSaved')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSaved(sq);
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {trending.length > 0 ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5 text-primary/70" strokeWidth={2} />
                          {t('search.trendingTitle')}
                        </div>
                        <ul className="space-y-1">
                          {trending.map(({ url, count }) => (
                            <li key={url}>
                              <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/70"
                                onClick={() => handleTrendingClick(url)}
                              >
                                <span className="min-w-0 truncate">{titleForUrl(url)}</span>
                                <span className="shrink-0 text-[0.65rem] tabular-nums text-muted-foreground">
                                  {count}×
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )}

            {!isLoading && !showResults && query.length > 0 && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center px-6 py-16 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 ring-1 ring-border/40">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                {rateLimited ? (
                  <>
                    <p className="font-medium text-foreground">{t('search.rateLimitedTitle')}</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                      {t('search.rateLimitedHint').replace(
                        '{{seconds}}',
                        String(Math.max(1, Math.ceil(liveRateLimitRetryMs / 1000))),
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">{t('search.noResultsLine')}</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                      {t('search.tryAdjust')}{' '}
                      <button
                        type="button"
                        onClick={clear}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {t('search.clearSearchLink')}
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-border/50 bg-muted/25 px-4 py-2.5 print:hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-[0.6rem] leading-snug text-muted-foreground/90 sm:max-w-[65%]">{t('search.syntaxHint')}</p>
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-[0.65rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono">↑↓</kbd>
                {t('search.navigate')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono">↵</kbd>
                {t('search.select')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono">esc</kbd>
                {t('search.close')}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono">
                <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5">⌘</kbd>
                <kbd className="rounded border border-border/60 bg-background/80 px-1.5 py-0.5">K</kbd>
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <SearchCapabilityMatrix open={capMatrixOpen} onOpenChange={setCapMatrixOpen} />
    </>
  );
}
