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
import { SafeImage } from '@/components/ui/SafeImage';
import { allEvents } from '@/pages/events/data/events';
import { DailySatsangCard } from '@/pages/events/components/DailySatsangCard';

const formatDate = (startDate: string) =>
  new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const EventsListingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'upcoming'
  );

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

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
          (e.location.name || '').toLowerCase().includes(query) ||
          (e.location.city || '').toLowerCase().includes(query)
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
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/events/hero_events_listing.jpg" 
            alt="Events" 
            className="h-full w-full object-cover" 
            loading="eager" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/30" />
        </div>
        <div className="relative z-10 container py-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-4 text-white">
            Events & Celebrations
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
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
          <div className="mb-8 max-w-3xl mx-auto">
            <DailySatsangCard />
          </div>
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
                      <SafeImage
                        category="events"
                        src={event.media.thumbnail || event.media.banner}
                        alt={event.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {(event.slug === 'maha-shivratri-2026' || event.slug === 'gurudev-birthday-2026') && (
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
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.location.online ? 'Online' : (event.location.city || event.location.name)}</span>
                        </div>
                        {event.stats?.attendees && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <span>{event.stats.attendees.toLocaleString()} expected</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleEventClick(`/events/${event.slug}`)}
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <AddToCartButton
                          itemId={`event-${event.id}`}
                          itemType="application"
                          title={event.title}
                          subtitle={event.shortDescription || event.description}
                          metadata={{
                            date: formatDate(event.startDate),
                            location: event.location.online ? 'Online' : event.location.name,
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
