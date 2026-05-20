import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/lib/i18n';

const UPCOMING_EVENTS_META = [
  {
    id: '1',
    attendees: 5000,
    status: 'upcoming' as const,
    featured: true,
    image: '/images/events/card_event_shivaratri_celebration.jpg',
  },
  {
    id: '2',
    attendees: 150,
    status: 'upcoming' as const,
    featured: false,
    image: '/images/programs/card_program_silence_retreat.jpg',
  },
  {
    id: '3',
    attendees: 200,
    status: 'upcoming' as const,
    featured: false,
    image: '/images/programs/card_program_advanced_meditation.jpg',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const UpcomingEventsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLearnMore = (eventId: string) => {
    navigate(`${ROUTES.EVENTS_UPCOMING}?event=${eventId}`);
  };

  const handleViewAll = () => {
    navigate(ROUTES.EVENTS_UPCOMING);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              {t('home.upcomingEvents.badge')}
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t('home.upcomingEvents.title')}
            </h2>
            <p className="mt-2 text-muted-foreground text-lg">
              {t('home.upcomingEvents.subtitle')}
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden md:flex"
            onClick={handleViewAll}
          >
            {t('home.upcomingEvents.viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {UPCOMING_EVENTS_META.map((event) => {
            const title = t(`home.upcomingEvents.events.${event.id}.title`);
            const description = t(`home.upcomingEvents.events.${event.id}.description`);
            const date = t(`home.upcomingEvents.events.${event.id}.date`);
            const time = t(`home.upcomingEvents.events.${event.id}.time`);
            const location = t(`home.upcomingEvents.events.${event.id}.location`);
            const expected = t('home.upcomingEvents.expected').replace(
              '{{count}}',
              event.attendees.toLocaleString()
            );
            return (
            <motion.div key={event.id} variants={itemVariants}>
              <Card className={`group h-full overflow-hidden transition-all duration-300 hover:shadow-elevated ${event.featured ? 'ring-2 ring-primary/20' : ''}`}>
                {/* Event Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={event.image}
                    alt={title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {event.featured && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {t('home.upcomingEvents.featured')}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {description}
                  </p>

                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>{expected}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={event.featured ? 'default' : 'outline'}
                    onClick={() => handleLearnMore(event.id)}
                  >
                    {t('home.upcomingEvents.learnMore')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            onClick={handleViewAll}
          >
            {t('home.upcomingEvents.viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
