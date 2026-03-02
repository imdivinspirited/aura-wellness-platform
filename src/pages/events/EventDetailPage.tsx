import * as React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { allEvents } from '@/pages/events/data/events';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import type { Event } from '@/pages/events/types';
import { DailySatsangCard } from '@/pages/events/components/DailySatsangCard';
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';
import { DonationSection } from '@/pages/events/components/DonationSection';
import { getEventDonationConfig, updateEventDonationConfig, type DonationConfig } from '@/lib/api/events';
import { useAuthStore } from '@/stores/authStore';

function formatRange(event: Event) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  return `${start.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  )}`;
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const event = React.useMemo(() => allEvents.find((e) => e.slug === slug), [slug]);
  const { user } = useAuthStore();
  const canEditDonation = user?.role === 'admin' || user?.role === 'root';

  const [donation, setDonation] = React.useState<DonationConfig | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    getEventDonationConfig(slug)
      .then(setDonation)
      .catch(() => setDonation(null));
  }, [slug]);

  const handleSaveDonation = async (next: DonationConfig) => {
    if (!slug) return;
    setSaving(true);
    try {
      const saved = await updateEventDonationConfig(slug, next);
      setDonation(saved);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <MainLayout>
        <div className="container py-12">
          <h1 className="font-display text-3xl font-light">Event not found</h1>
          <p className="text-muted-foreground mt-2">This event page doesn’t exist yet.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="relative">
        <div className="absolute inset-0">
          <SafeImage category="events" src={event.media.banner} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/20" />
        </div>
        <div className="relative container py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-primary/20 text-primary-foreground border-primary/30 mb-4">
              {event.category === 'upcoming' ? 'Upcoming' : event.category === 'ongoing' ? 'Ongoing' : 'Past'}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-4">{event.title}</h1>
            <p className="text-white/85 text-lg leading-relaxed">{event.shortDescription || event.description}</p>
            <div className="mt-6 grid gap-3 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatRange(event)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {event.location.online ? 'Online' : event.location.name}
                  {event.location.city ? ` • ${event.location.city}` : ''}
                  {event.location.country ? `, ${event.location.country}` : ''}
                </span>
              </div>
              {event.stats?.attendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event.stats.attendees.toLocaleString()} expected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="prose prose-stone max-w-none dark:prose-invert">
              <h2>About</h2>
              <p>{event.description}</p>
            </div>

            {/* Live section */}
            {event.liveStreamUrl && (
              <section className="space-y-3">
                <div className="font-display text-2xl font-light text-stone-900">Live</div>
                <YouTubeEmbed url={event.liveStreamUrl} title={`${event.title} Live`} />
              </section>
            )}

            {/* Donation section */}
            <DonationSection
              config={donation}
              canEdit={canEditDonation}
              isSaving={saving}
              onSave={canEditDonation ? handleSaveDonation : undefined}
            />
          </div>

          <div className="space-y-6">
            <DailySatsangCard />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

