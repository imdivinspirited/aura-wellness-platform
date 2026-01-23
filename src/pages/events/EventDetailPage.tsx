/**
 * Event Detail Page
 * 
 * Dedicated detail page for individual events with full information,
 * donation section, gallery, and live streaming support.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Globe, 
  ArrowLeft,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { allEvents } from './data/events';
import { formatEventDateRange, isEventLive } from './utils/eventCategorization';
import { DonationSection } from './components/DonationSection';
import { LiveStreamSection } from './components/LiveStreamSection';

export const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const event = allEvents.find(e => e.slug === slug);

  if (!event) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </MainLayout>
    );
  }

  const dateRange = formatEventDateRange(event);
  const isLive = isEventLive(event);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {event.media.banner ? (
          <img
            src={event.media.banner}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container h-full flex flex-col justify-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/events')}
              className="mb-4 text-white hover:text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              {event.title}
            </h1>
            {event.shortDescription && (
              <p className="text-xl text-white/90 max-w-3xl">
                {event.shortDescription}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Schedule */}
            {event.timeline && event.timeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.timeline.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.time}</p>
                          <p className="text-sm text-muted-foreground">{item.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {event.media.gallery && event.media.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.media.gallery.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${event.title} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Streaming */}
            {isLive && event.liveStreamUrl && (
              <LiveStreamSection event={event} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{dateRange}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {event.location.online ? (
                    <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location.online
                        ? 'Online'
                        : event.location.name || `${event.location.city}, ${event.location.country}`}
                    </p>
                    {event.location.address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.location.address}
                      </p>
                    )}
                  </div>
                </div>

                {event.stats && event.stats.attendees && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Expected Attendance</p>
                      <p className="text-sm text-muted-foreground">
                        {event.stats.attendees >= 1000000
                          ? `${(event.stats.attendees / 1000000).toFixed(1)}M`
                          : event.stats.attendees >= 1000
                          ? `${(event.stats.attendees / 1000).toFixed(1)}K`
                          : event.stats.attendees}{' '}
                        participants
                      </p>
                    </div>
                  </div>
                )}

                {event.languages && event.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.languages.map((lang) => (
                          <Badge key={lang} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isLive && (
                  <Badge className="w-full justify-center bg-red-500 text-white animate-pulse">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    Live Now
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Donation Section */}
            <DonationSection eventId={event.id} eventTitle={event.title} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetailPage;
