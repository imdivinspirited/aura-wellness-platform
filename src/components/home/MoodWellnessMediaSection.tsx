import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation, getCanonicalUiLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getWellnessTips, getWellnessVideos, type MoodKey } from '@/lib/moodWellnessContent';
import { MoodActivityFeedbackDialog } from '@/components/home/MoodActivityFeedbackDialog';

type Props = {
  mood: MoodKey;
  cardClassName?: string;
};

export function MoodWellnessMediaSection({ mood, cardClassName }: Props) {
  const { t, language } = useTranslation();
  const bundle = getCanonicalUiLanguage(language);
  const videos = useMemo(() => getWellnessVideos(mood), [mood]);
  const tips = useMemo(() => getWellnessTips(mood, bundle === 'hi' ? 'hi' : 'en'), [mood, bundle]);
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    title: string;
    youtubeId: string;
  } | null>(null);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="space-y-8 px-1"
      >
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            {t('mood.wellness.mediaEyebrow' as any)}
          </div>
          <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{t('mood.wellness.mediaTitle' as any)}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{t('mood.wellness.mediaSubtitle' as any)}</p>
          <p className="mt-2 text-xs text-muted-foreground/90">{t('mood.wellness.channelNote' as any)}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {videos.map((v) => {
            const title = bundle === 'hi' ? v.titleHi : v.titleEn;
            const desc = bundle === 'hi' ? v.descHi : v.descEn;
            const yt = `https://www.youtube.com/watch?v=${v.youtubeId}`;
            const showEmbed = embedId === v.youtubeId;
            return (
              <Card
                key={v.youtubeId}
                className={cn(
                  'overflow-hidden border-border/60 bg-card/90 shadow-md transition-shadow hover:shadow-lg',
                  cardClassName
                )}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {!showEmbed ? (
                    <button
                      type="button"
                      className="relative block h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                      onClick={() => setEmbedId(v.youtubeId)}
                      aria-label={t('mood.wellness.watchInline' as any)}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/45">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/95 text-primary shadow-lg">
                          <Play className="ml-0.5 h-7 w-7" fill="currentColor" />
                        </span>
                      </span>
                    </button>
                  ) : (
                    <iframe
                      title={title}
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                      className="h-full min-h-[200px] w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>
                <CardContent className="space-y-3 p-5">
                  <h3 className="font-display text-lg font-medium leading-snug">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={yt} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('mood.wellness.openYoutube' as any)}
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      type="button"
                      onClick={() => setFeedback({ title, youtubeId: v.youtubeId })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('mood.wellness.markComplete' as any)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/90 to-muted/20 p-6 md:p-8">
          <h3 className="font-display text-2xl font-light">{t('mood.wellness.tipsTitle' as any)}</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {tips.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {feedback && (
        <MoodActivityFeedbackDialog
          open
          onOpenChange={(o) => !o && setFeedback(null)}
          beforeMood={mood}
          activityTitle={feedback.title}
          youtubeVideoId={feedback.youtubeId}
        />
      )}
    </>
  );
}
