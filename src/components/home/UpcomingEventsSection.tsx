import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

const upcomingEvents = [
  {
    id: '1',
    title: 'Maha Shivaratri Celebrations',
    description: 'Join the grand celebration with meditation, music, and spiritual practices',
    date: 'Feb 26, 2026',
    time: '6:00 PM - 6:00 AM',
    location: 'Bangalore Ashram',
    attendees: 5000,
    status: 'upcoming' as const,
    featured: true,
    image: '/images/events/card_event_shivaratri_celebration.jpg',
  },
  {
    id: '2',
    title: 'Silence Retreat',
    description: 'Deep dive into meditation with 3 days of guided silence',
    date: 'Jan 25 - Jan 28, 2026',
    time: 'Residential',
    location: 'Ashram Campus',
    attendees: 150,
    status: 'upcoming' as const,
    featured: false,
    image: '/images/programs/card_program_silence_retreat.jpg',
  },
  {
    id: '3',
    title: 'Advanced Meditation Program',
    description: 'Explore deeper layers of consciousness',
    date: 'Feb 5 - Feb 8, 2026',
    time: '8:00 AM - 6:00 PM',
    location: 'Main Hall',
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
              Upcoming Events
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Don't Miss What's Coming
            </h2>
            <p className="mt-2 text-muted-foreground text-lg">
              Join transformative experiences and celebrations
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden md:flex"
            onClick={handleViewAll}
          >
            View All Events
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
          {upcomingEvents.map((event) => (
            <motion.div key={event.id} variants={itemVariants}>
              <Card className={`group h-full overflow-hidden transition-all duration-300 hover:shadow-elevated ${event.featured ? 'ring-2 ring-primary/20' : ''}`}>
                {/* Event Image */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {event.featured && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>{event.attendees.toLocaleString()} expected</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={event.featured ? 'default' : 'outline'}
                    onClick={() => handleLearnMore(event.id)}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            onClick={handleViewAll}
          >
            View All Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
