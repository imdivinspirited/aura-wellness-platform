/**
 * Programs Listing Page
 *
 * Rich, premium UI for displaying all programs.
 * Replaces the text-only GenericPage for /programs route.
 */

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProgramsSubNav } from '@/components/programs/ProgramsSubNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight, Baby, Filter, GraduationCap, LayoutGrid, RotateCcw, Search, Sparkles, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SafeImage } from '@/components/ui/SafeImage';
import { cardHeroImagePath } from '@/lib/media/imageDefaults';

// Program data structure
interface Program {
  id: string;
  title: string;
  description: string;
  category: 'beginning' | 'advanced' | 'children' | 'teens' | 'more' | 'retreats';
  level: string;
  duration: string;
  format: string;
  image?: string;
  route: string;
  featured?: boolean;
}

// Sample programs data with real images
const ALL_PROGRAMS: Program[] = [
  // Beginning Programs
  {
    id: 'happiness',
    title: 'Happiness Program',
    description:
      'Learn the powerful Sudarshan Kriya breathing technique to release stress and feel energized.',
    category: 'beginning',
    level: 'Beginner',
    duration: '3 Days',
    format: 'Online & Offline',
    image: '/images/programs/happiness_program_joyful.jpg',
    route: '/programs/happiness-program',
    featured: true,
  },
  {
    id: 'silence',
    title: 'Silence Retreat',
    description:
      'Experience profound silence and deepen your meditation practice in a serene environment.',
    category: 'beginning',
    level: 'Intermediate',
    duration: '3-5 Days',
    format: 'Residential',
    image: '/images/programs/silence_retreat_nature.jpg',
    route: '/programs/silence-retreat',
  },
  {
    id: 'yoga',
    title: 'Sri Sri Yoga',
    description:
      'Traditional yoga practices combining asanas, pranayama, and meditation for holistic wellness.',
    category: 'beginning',
    level: 'All Levels',
    duration: 'Ongoing',
    format: 'Online & Offline',
    image: '/images/programs/sri_sri_yoga_outdoor.jpg',
    route: '/programs/sri-sri-yoga',
  },
  {
    id: 'wellness',
    title: 'Wellness Program',
    description:
      'Comprehensive wellness program focusing on physical, mental, and emotional health.',
    category: 'beginning',
    level: 'All Levels',
    duration: '5 Days',
    format: 'Residential',
    image: '/images/programs/card_program_beginner_wellness.jpg',
    route: '/programs/wellness',
  },
  {
    id: 'sahaj',
    title: 'Sahaj Samadhi',
    description: 'Advanced meditation technique for deep inner peace and clarity.',
    category: 'beginning',
    level: 'Intermediate',
    duration: '3 Days',
    format: 'Residential',
    image: '/images/programs/sahaj_samadhi_deep.jpg',
    route: '/programs/sahaj-samadhi',
  },
  {
    id: 'corporate',
    title: 'Corporate Program',
    description: 'Transform your workplace with stress management and team building programs.',
    category: 'beginning',
    level: 'All Levels',
    duration: '1-2 Days',
    format: 'Corporate',
    image: '/images/programs/corporate_wellness_office.jpg',
    route: '/programs/corporate-program',
  },
  // Advanced Programs
  {
    id: 'amp',
    title: 'Advanced Meditation Program',
    description:
      'Deep dive into advanced meditation techniques and higher states of consciousness.',
    category: 'advanced',
    level: 'Advanced',
    duration: '7-10 Days',
    format: 'Residential',
    image: '/images/programs/advanced_meditation_hall.jpg',
    route: '/programs/advance/amp',
  },
  {
    id: 'samyam',
    title: 'Samyam',
    description:
      'Intensive program for experienced practitioners seeking deeper states of meditation.',
    category: 'advanced',
    level: 'Advanced',
    duration: '8-10 Days',
    format: 'Residential',
    image: '/images/programs/samyam_mountain_retreat.jpg',
    route: '/programs/advance/samyam',
  },
  {
    id: 'blessings',
    title: 'Blessings Program',
    description: 'Experience the blessings and grace through advanced spiritual practices.',
    category: 'advanced',
    level: 'Advanced',
    duration: '5-7 Days',
    format: 'Residential',
    image: '/images/programs/card_program_advanced_meditation.jpg',
    route: '/programs/advance/blessings',
  },
  // Children & Teens
  {
    id: 'utkarsha',
    title: 'Utkarsha Yoga',
    description: 'Yoga program designed for children aged 8-13 to boost immunity and enhance joy.',
    category: 'children',
    level: 'Children',
    duration: '4 Days',
    format: 'Residential',
    image: '/images/programs/children_yoga_outdoor.jpg',
    route: '/programs/utkarsha-yoga',
  },
  {
    id: 'myl1',
    title: 'Medha Yoga Level 1',
    description: 'Empowering teens to handle pressure, improve focus, and control anger.',
    category: 'teens',
    level: 'Teens',
    duration: '3-4 Days',
    format: 'Residential',
    image: '/images/programs/teens_meditation_circle.jpg',
    route: '/programs/myl-1',
  },
  {
    id: 'myl2',
    title: 'Medha Yoga Level 2',
    description: 'Advanced practices for resilience and self-mastery for Level 1 graduates.',
    category: 'teens',
    level: 'Teens',
    duration: '5-7 Days',
    format: 'Residential',
    image: '/images/programs/card_program_teens_ip.jpg',
    route: '/programs/myl-2',
  },
  {
    id: 'ip',
    title: 'Intuition Process',
    description: 'Awaken inner wisdom through blindfold activities and special techniques.',
    category: 'children',
    level: 'Children & Teens',
    duration: '10-17 Days',
    format: 'Residential',
    image: '/images/programs/card_program_teens_ip.jpg',
    route: '/programs/intuition-process',
  },
  // More Programs
  {
    id: 'vedic',
    title: 'Vedic Wisdom',
    description:
      'Spiritual immersion into ancient Vedic knowledge including Upanayanam and Ayurveda.',
    category: 'more',
    level: 'Adults',
    duration: '7-10 Days',
    format: 'Residential',
    image: '/images/programs/card_program_advanced_dsn.jpg',
    route: '/programs/vedic-wisdom',
  },
  {
    id: 'panchkarma',
    title: 'Panchkarma',
    description: 'Deep cleansing and rejuvenation through traditional Ayurvedic detoxification.',
    category: 'more',
    level: 'Adults',
    duration: '14-21 Days',
    format: 'Residential',
    image: '/images/programs/card_program_beginner_wellness.jpg',
    route: '/programs/panchkarma',
  },
  {
    id: 'yoga-deep',
    title: 'Sri Sri Yoga Deep Dive',
    description: 'Intensive yoga program for advanced practitioners seeking deeper transformation.',
    category: 'more',
    level: 'Advanced',
    duration: '7-10 Days',
    format: 'Residential',
    image: '/images/programs/card_program_yoga_class.jpg',
    route: '/programs/yoga-deep-dive',
  },
  {
    id: 'hatha',
    title: 'Hatha Yoga Sadhana',
    description:
      'Traditional Hatha Yoga practices for deep physical, mental, and spiritual transformation.',
    category: 'more',
    level: 'Advanced',
    duration: '7-14 Days',
    format: 'Residential',
    image: '/images/programs/card_program_beginner_yoga.jpg',
    route: '/programs/hatha-yoga',
  },
  {
    id: 'spine',
    title: 'Spine Care Yoga',
    description: 'Therapeutic yoga program for spinal health, pain relief, and posture correction.',
    category: 'more',
    level: 'All Levels',
    duration: '5-7 Days',
    format: 'Residential',
    image: '/images/programs/card_program_silence_retreat.jpg',
    route: '/programs/spine-care',
  },
  // Retreats
  {
    id: 'corporate-retreat',
    title: 'Corporate Wellbeing Retreats',
    description:
      'Customized retreats for organizations to enhance employee wellbeing and productivity.',
    category: 'retreats',
    level: 'Corporate',
    duration: '2-5 Days',
    format: 'Residential',
    image: '/images/programs/card_program_retreats_corporate.jpg',
    route: '/programs/corporate-retreats',
  },
  {
    id: 'self-designed',
    title: 'Self-Designed Getaways',
    description: 'Create your own personalized retreat experience tailored to your needs.',
    category: 'retreats',
    level: 'All Levels',
    duration: 'Custom',
    format: 'Residential',
    image: '/images/programs/card_program_retreats_selfdesign.jpg',
    route: '/programs/self-designed',
  },
];

const categoryIcons = {
  beginning: Sparkles,
  advanced: Zap,
  children: Baby,
  teens: GraduationCap,
  more: LayoutGrid,
  retreats: RotateCcw,
};

export const ProgramsListingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );

  // Filter programs
  const filteredPrograms = useMemo(() => {
    let filtered = ALL_PROGRAMS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.level.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Update URL without navigation
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    navigate(`/programs?${newParams.toString()}`, { replace: true });
  };

  const handleProgramClick = (route: string) => {
    navigate(route);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/programs/hero_programs_listing.jpg"
            alt="Programs"
            className="h-full w-full object-cover"
            loading="eager"
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container py-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-4 text-white">
            Our Programs
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Discover transformative programs for every stage of your journey
          </p>
        </div>
      </section>

      {/* Programs Sub-Navigation - Natural scroll, not sticky */}
      <div className="w-full bg-background border-b">
        <ProgramsSubNav
          activeItem={selectedCategory === 'all' ? 'beginning' : selectedCategory}
          onItemClick={id => handleCategoryChange(id)}
        />
      </div>

      {/* Filters & Search - compact so cards appear sooner */}
      <section className="py-4 md:py-6 bg-muted/30 scroll-mt-20">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredPrograms.length} {filteredPrograms.length === 1 ? 'program' : 'programs'}{' '}
                found
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid - immediately after hero/filters */}
      <section id="programs-listing" className="py-6 md:py-10 scroll-mt-20">
        <div className="container">
          {filteredPrograms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrograms.map((program, index) => {
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-stone-200 flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={program.image || '/images/programs/card_program_beginner_happiness.jpg'}
                          alt={program.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {program.featured && (
                          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <CardHeader className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {program.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {program.description}
                            </p>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs">
                            {program.level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {program.duration}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {program.format}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => handleProgramClick(program.route)}
                          >
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <AddToCartButton
                            itemId={`program-${program.id}`}
                            itemType="program"
                            title={program.title}
                            subtitle={program.description}
                            metadata={{
                              category: program.category,
                              level: program.level,
                              duration: program.duration,
                              format: program.format,
                            }}
                            variant="icon"
                            size="default"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No programs found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'No programs available in this category'}
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
