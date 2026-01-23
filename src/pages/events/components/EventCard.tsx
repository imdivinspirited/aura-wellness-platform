import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  Clock,
  ArrowRight,
  Video,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoveToPastModal } from '../admin/MoveToPastModal';
import { formatEventDateRange, isEventLive, getDaysUntilEvent } from '../utils/eventCategorization';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
  onMoveToPast?: (eventId: string, reason?: string) => Promise<void>;
  showAdminControls?: boolean;
}

/**
 * Event Card Component
 *
 * Displays event information in a card format.
 * Supports admin controls for moving events to past category.
 *
 * Features:
 * - Responsive design
 * - Live status indicators
 * - Admin controls (when enabled)
 * - SEO-friendly structure
 * - Accessible markup
 */
export const EventCard = ({
  event,
  onMoveToPast,
  showAdminControls = false,
}: EventCardProps) => {
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const isLive = isEventLive(event);
  const daysUntil = getDaysUntilEvent(event);
  const dateRange = formatEventDateRange(event);

  const handleMoveToPast = async (eventId: string, reason?: string) => {
    if (!onMoveToPast) return;

    setIsMoving(true);
    try {
      await onMoveToPast(eventId, reason);
      setIsMoveModalOpen(false);
    } catch (error) {
      console.error('Failed to move event:', error);
      throw error; // Re-throw to let modal handle error display
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        className="h-full"
      >
        <Card className="h-full flex flex-col border-stone-200 shadow-sm hover:shadow-md transition-shadow">
          {/* Banner Image */}
          <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-secondary/10">
            {event.media.banner ? (
              <img
                src={event.media.banner}
                alt={event.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Calendar className="h-16 w-16 text-primary/30" />
              </div>
            )}

            {/* Live Badge */}
            {isLive && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500 text-white animate-pulse">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  Live
                </Badge>
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge
                variant={
                  event.category === 'upcoming'
                    ? 'default'
                    : event.category === 'ongoing'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {event.category === 'upcoming' && 'Upcoming'}
                {event.category === 'ongoing' && 'Ongoing'}
                {event.category === 'past' && 'Past'}
              </Badge>
            </div>

            {/* Days Until Badge (for upcoming events) */}
            {event.category === 'upcoming' && daysUntil > 0 && daysUntil <= 30 && (
              <div className="absolute bottom-4 left-4">
                <Badge variant="outline" className="bg-background/90">
                  {daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </Badge>
              </div>
            )}
          </div>

          <CardHeader>
            <h3 className="font-display text-xl font-light mb-2 text-stone-900 line-clamp-2">
              {event.title}
            </h3>
            {event.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.shortDescription}
              </p>
            )}
          </CardHeader>

          <CardContent className="flex-1 space-y-3">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-stone-700">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              <span>{dateRange}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-stone-700">
              {event.location.online ? (
                <Globe className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              ) : (
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
              )}
              <span className="line-clamp-1">
                {event.location.online
                  ? 'Online'
                  : event.location.name || `${event.location.city}, ${event.location.country}`}
              </span>
            </div>

            {/* Languages */}
            {event.languages && event.languages.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <Globe className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="line-clamp-1">
                  {event.languages.slice(0, 2).join(', ')}
                  {event.languages.length > 2 && ` +${event.languages.length - 2} more`}
                </span>
              </div>
            )}

            {/* Stats */}
            {event.stats && (event.stats.attendees || event.stats.countries) && (
              <div className="flex items-center gap-4 text-sm text-stone-600 pt-2 border-t border-stone-100">
                {event.stats.attendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {event.stats.attendees >= 1000000
                        ? `${(event.stats.attendees / 1000000).toFixed(1)}M`
                        : event.stats.attendees >= 1000
                        ? `${(event.stats.attendees / 1000).toFixed(1)}K`
                        : event.stats.attendees}
                    </span>
                  </div>
                )}
                {event.stats.countries && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    <span>{event.stats.countries} countries</span>
                  </div>
                )}
              </div>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <ul className="space-y-1">
                  {event.highlights.slice(0, 3).map((highlight, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-4 border-t border-stone-100">
            {/* CTA Button */}
            {event.cta.external ? (
              <Button
                className="w-full"
                variant={isLive ? 'default' : 'outline'}
                asChild
                aria-label={`View ${event.title}`}
              >
                <a href={event.cta.link}>
                  {isLive && event.liveStreamUrl ? (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Watch Live
                    </>
                  ) : (
                    <>
                      {event.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={isLive ? 'default' : 'outline'}
                asChild
                aria-label={`View ${event.title}`}
              >
                <Link to={event.cta.link}>
                  {isLive && event.liveStreamUrl ? (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Watch Live
                    </>
                  ) : (
                    <>
                      {event.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Link>
              </Button>
            )}

            {/* Admin Controls */}
            {showAdminControls && event.category !== 'past' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsMoveModalOpen(true)}
                aria-label={`Move ${event.title} to past events`}
              >
                <Lock className="mr-2 h-3 w-3" />
                Move to Past Event
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      {/* Admin Modal */}
      {showAdminControls && (
        <MoveToPastModal
          event={event}
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          onConfirm={handleMoveToPast}
        />
      )}
    </>
  );
};
