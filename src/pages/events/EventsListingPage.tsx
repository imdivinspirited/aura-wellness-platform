/**
 * Events Listing Page
 *
 * Rich, premium UI for displaying all events.
 * Replaces the text-only GenericPage for /events route.
 */

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import heroImage from '@/assets/hero-ashram.jpg';

// Event data structure
interface Event {
  id: string;
  title: string;
  description: string;
  category: 'upcoming' | 'ongoing' | 'past';
  date: string;
  time?: string;
  location: string;
  attendees?: number;
  image?: string;
  featured?: boolean;
  route: string;
}

// Sample events data (in production, this would come from API/CMS)
const ALL_EVENTS: Event[] = [
  {
    id: 'maha-shivaratri',
    title: 'Maha Shivaratri Celebrations',
    description: 'Join the grand celebration with meditation, music, and spiritual practices',
    category: 'upcoming',
    date: 'Feb 26, 2026',
    time: '6:00 PM - 6:00 AM',
    location: 'Bangalore Ashram',
    attendees: 5000,
    route: '/events/upcoming?event=maha-shivaratri',
    featured: true,
  },
  {
    id: 'silence-retreat-event',
    title: 'Silence Retreat',
    description: 'Deep dive into meditation with 3 days of guided silence',
    category: 'upcoming',
    date: 'Jan 25 - Jan 28, 2026',
    time: 'Residential',
    location: 'Ashram Campus',
    attendees: 150,
    route: '/events/upcoming?event=silence-retreat',
  },
  {
    id: 'advanced-meditation-event',
    title: 'Advanced Meditation Program',
    description: 'Explore deeper layers of consciousness',
    category: 'upcoming',
    date: 'Feb 5 - Feb 8, 2026',
    time: '8:00 AM - 6:00 PM',
    location: 'Main Hall',
    attendees: 200,
    route: '/events/upcoming?event=advanced-meditation',
  },
  {
    id: 'yoga-workshop',
    title: 'Yoga Workshop',
    description: 'Intensive yoga practice session',
    category: 'ongoing',
    date: 'Ongoing',
    location: 'Yoga Hall',
    route: '/events/ongoing?event=yoga-workshop',
  },
  {
    id: 'past-event-1',
    title: 'New Year Celebrations',
    description: 'Welcoming the new year with meditation and celebration',
    category: 'past',
    date: 'Jan 1, 2026',
    location: 'Main Hall',
    route: '/events/past?event=new-year',
  },
];

export const EventsListingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'upcoming'
  );

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = ALL_EVENTS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    navigate(`/events?${newParams.toString()}`, { replace: true });
  };

  const handleEventClick = (route: string) => {
    navigate(route);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Events"
            className="h-full w-full object-cover opacity-10"
            loading="eager"
          />
        </div>
        <div className="relative z-10 container py-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-4 text-stone-900">
            Events & Celebrations
          </h1>
          <p className="text-lg md:text-xl text-stone-700 max-w-2xl mx-auto">
            Join transformative experiences and celebrations at the ashram
          </p>
        </div>
      </section>

      {/* Category Tabs - Natural scroll, not sticky */}
      <div className="w-full bg-background border-b">
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <div className="container">
            <TabsList className="w-full justify-start h-auto p-1 bg-transparent">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary/10">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="data-[state=active]:bg-primary/10">
                Ongoing
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-primary/10">
                Past
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/10">
                All Events
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Filters & Search */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container">
          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-stone-200">
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
                      {event.featured && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <CardHeader>
                      <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </CardHeader>

                    <CardContent>
                      {/* Meta Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        {event.attendees && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <span>{event.attendees.toLocaleString()} expected</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleEventClick(event.route)}
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <AddToCartButton
                          itemId={`event-${event.id}`}
                          itemType="application"
                          title={event.title}
                          subtitle={event.description}
                          metadata={{
                            date: event.date,
                            time: event.time,
                            location: event.location,
                            category: event.category,
                          }}
                          variant="icon"
                          size="default"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'No events available in this category'}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};
