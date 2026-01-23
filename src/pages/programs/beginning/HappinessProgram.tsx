import heroImage from '@/assets/hero-ashram.jpg';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, useAnimationControls, useInView } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Calendar,
  Calendar as CalendarIcon,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Eye,
  Globe,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Quote,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Volume2,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ==================== TYPE DEFINITIONS ====================
type ProgramType = 'in-person' | 'online';
type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';
type DateFilter = 'today' | 'this-week' | 'next-week' | 'all';

interface Program {
  id: string;
  date: string;
  location: string;
  language: Language;
  spots: number;
  type: ProgramType;
  mode: 'in-person' | 'online';
  duration: string;
}

// ==================== DATA ====================
const programs: Program[] = [
  {
    id: '1',
    date: 'Jan 25-28, 2026',
    location: 'Bangalore Ashram',
    language: 'English',
    spots: 48,
    type: 'in-person',
    mode: 'in-person',
    duration: '3 days',
  },
  {
    id: '2',
    date: 'Feb 1-4, 2026',
    location: 'Online',
    language: 'Hindi',
    spots: 120,
    type: 'online',
    mode: 'online',
    duration: '3 days',
  },
  {
    id: '3',
    date: 'Feb 8-11, 2026',
    location: 'Mumbai Center',
    language: 'English',
    spots: 32,
    type: 'in-person',
    mode: 'in-person',
    duration: '3 days',
  },
  {
    id: '4',
    date: 'Feb 15-18, 2026',
    location: 'Online',
    language: 'Tamil',
    spots: 100,
    type: 'online',
    mode: 'online',
    duration: '3 days',
  },
  {
    id: '5',
    date: 'Feb 22-25, 2026',
    location: 'Delhi Center',
    language: 'English',
    spots: 40,
    type: 'in-person',
    mode: 'in-person',
    duration: '3 days',
  },
];

const celebrityTestimonials = [
  {
    id: '1',
    quote:
      'The Sudarshan Kriya has been a game-changer in my life. It brings peace and clarity that nothing else can match.',
    name: 'Dr. Deepak Chopra',
    profession: 'Best-selling Author & Speaker',
    photo: '',
  },
  {
    id: '2',
    quote:
      "I practice Sudarshan Kriya daily. It's essential for my mental clarity and stress management.",
    name: 'John Gray',
    profession: 'Author, Men Are from Mars',
    photo: '',
  },
  {
    id: '3',
    quote:
      'The Happiness Program transformed how I approach life. Every executive should experience this.',
    name: 'Tom Davidson',
    profession: 'CEO, Fortune 500 Company',
    photo: '',
  },
  {
    id: '4',
    quote:
      "As a medical professional, I've seen the profound impact of Sudarshan Kriya on patient outcomes.",
    name: 'Dr. Roberta Lee',
    profession: 'Integrative Medicine Physician',
    photo: '',
  },
];

const faqs = [
  {
    id: '1',
    question: 'Are there any side-effects?',
    answer:
      "Sudarshan Kriya is completely safe and natural. It has no side-effects. Over 45 million people worldwide have practiced it with profound benefits. It's a breathing technique that works with your body's natural rhythms.",
  },
  {
    id: '2',
    question: 'What are the health benefits?',
    answer:
      'Research shows Sudarshan Kriya increases immunity by 33%, reduces stress hormones by 57%, and improves life satisfaction by 21%. It also enhances sleep quality, mental clarity, emotional stability, and overall well-being.',
  },
  {
    id: '3',
    question: 'Why is there a fee for the program?',
    answer:
      'The fee covers course materials, experienced teachers, venue costs, and organizational expenses. This ensures the highest quality of instruction and helps sustain the program globally. Scholarships are available for those in need.',
  },
  {
    id: '4',
    question: 'I have no stress. Do I still need this?',
    answer:
      'Great question! Even without stress, Sudarshan Kriya enhances energy, clarity, creativity, and joy. Many successful, happy people practice it to optimize their performance and deepen their sense of fulfillment.',
  },
];

// ==================== MAIN COMPONENT ====================
const HappinessProgram = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProgramType | 'all'>('all');
  const [moodBefore, setMoodBefore] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const [stickyFiltersVisible, setStickyFiltersVisible] = useState(false);

  const handleRegister = () => {
    window.open('https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch =
        debouncedSearch === '' ||
        program.location.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        program.language.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesLanguage = languageFilter === 'all' || program.language === languageFilter;
      const matchesType = typeFilter === 'all' || program.mode === typeFilter;

      return matchesSearch && matchesLanguage && matchesType;
    });
  }, [debouncedSearch, languageFilter, typeFilter]);

  // Sticky filters observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyFiltersVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (stickyBarRef.current) observer.observe(stickyBarRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <MainLayout>
      <div className={`${highContrast ? 'contrast-150' : ''}`} style={{ fontSize: `${fontSize}%` }}>
        {/* 1️⃣ HERO SECTION */}
        <HeroSection onRegister={handleRegister} />

        {/* 2️⃣ TRANSFORMATION TESTIMONIAL */}
        <TransformationTestimonial />

        {/* 3️⃣ PROGRAM SNAPSHOT */}
        <ProgramSnapshot />

        {/* Sticky Mini CTA Bar */}
        <motion.div
          ref={stickyBarRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: stickyFiltersVisible ? 1 : 0, y: stickyFiltersVisible ? 0 : -20 }}
          className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm transition-all ${stickyFiltersVisible ? 'visible' : 'invisible pointer-events-none'}`}
        >
          <div className="container py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Ready to transform your life?</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRegister}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                Yes! I choose happiness
              </Button>
              <Button size="sm" variant="outline" onClick={handleRegister}>
                Register Now
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 4️⃣ WHAT WILL I GET */}
        <WhatWillIGet />

        {/* 5️⃣ CELEBRITY & LEADER TESTIMONIAL WALL */}
        <CelebrityTestimonials testimonials={celebrityTestimonials} />

        {/* 6️⃣ SCIENCE BEHIND SUDARSHAN KRIYA */}
        <ScienceBehind />

        {/* 7️⃣ FACILITIES & AMENITIES */}
        <FacilitiesAmenities />

        {/* 8️⃣ UPCOMING PROGRAMS WITH FILTERS */}
        <UpcomingProgramsSection
          programs={filteredPrograms}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          onRegister={handleRegister}
        />

        {/* 9️⃣ FOUNDER SECTION */}
        <FounderSection />

        {/* 🔟 FAQ SECTION */}
        <FAQSection faqs={faqs} />

        {/* 1️⃣1️⃣ EXTRAORDINARY FEATURES */}
        <ExtraordinaryFeatures
          moodBefore={moodBefore}
          onMoodChange={setMoodBefore}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
        />

        {/* Accessibility Controls */}
        <AccessibilityControls
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
        />
      </div>
    </MainLayout>
  );
};

// ==================== HERO SECTION ====================
const HeroSection = ({ onRegister }: { onRegister: () => void }) => {
  const controls = useAnimationControls();

  useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({ scale: 1.02, opacity: 0.95 });
        await controls.start({ scale: 1, opacity: 1 });
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    };
    animate();
  }, [controls]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Calm cinematic background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/80" />
        <motion.div
          animate={controls}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-primary/5"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Happiness is not a moment.
            <br />
            <span className="text-gradient-gold">It's a way of life.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4 font-medium"
          >
            Learn the world's most powerful breathing technique –{' '}
            <span className="font-semibold text-foreground">Sudarshan Kriya™</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-8"
          >
            45 million+ people worldwide
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all"
            >
              Yes! I choose happiness
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onRegister}
              className="h-14 px-8 text-lg border-2"
            >
              Register Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== TRANSFORMATION TESTIMONIAL ====================
const TransformationTestimonial = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left: Large Quotation Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-elevated bg-background/95 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <Quote className="h-12 w-12 text-primary/30 mb-6" />
                <blockquote className="text-2xl md:text-3xl font-display leading-relaxed mb-6 text-foreground/90">
                  "I used to think sadness was normal but since practicing the Sudarshan Kriya my
                  name has been changed to 'Khushi' - which means happiness in Hindi. That's how
                  much my life has transformed."
                </blockquote>
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="" alt="Khushi" />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      K
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">Khushi</p>
                    <p className="text-muted-foreground">Former participant, 28</p>
                    <p className="text-sm text-muted-foreground mt-1">Marketing Professional</p>
                  </div>
                </div>
                <Badge className="mt-6 bg-primary/10 text-primary border-primary/20">
                  Happiness Program
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Participant Photo (Dummy) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-elevated">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-24 w-24 text-primary/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">Participant Photo</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== PROGRAM SNAPSHOT ====================
const ProgramSnapshot = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Full day in a 3-day format',
      description: 'Comprehensive program structure',
    },
    { icon: Shield, title: 'Remove Stress', description: 'Release tension naturally' },
    { icon: Heart, title: 'Improve Relationships', description: 'Connect deeper with others' },
    { icon: Zap, title: 'Boost Immunity', description: "Strengthen your body's defenses" },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What is this?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A transformative 3-day program that teaches you powerful breathing techniques
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==================== WHAT WILL I GET ====================
const WhatWillIGet = () => {
  const benefits = [
    {
      icon: Heart,
      title: 'Increased peace of mind',
      description: 'Experience deep calm and tranquility that lasts',
    },
    {
      icon: Zap,
      title: 'More energy',
      description: 'Feel revitalized and energetic throughout your day',
    },
    {
      icon: Shield,
      title: 'Eliminate Stress & Anxiety',
      description: 'Release tension and worry naturally',
    },
    {
      icon: Brain,
      title: 'Mastery Over Your Mind',
      description: 'Develop sharper focus and mental clarity',
    },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What will I get from this program?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform your life with these profound benefits
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full glass-card hover:shadow-elevated transition-all duration-300 border border-primary/10">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==================== CELEBRITY TESTIMONIALS ====================
const CelebrityTestimonials = ({
  testimonials,
}: {
  testimonials: typeof celebrityTestimonials;
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newPosition =
        direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount;
      scrollRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Trusted by Leaders Worldwide
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what renowned personalities say about Sudarshan Kriya
          </p>
        </motion.div>

        {/* Desktop: Grid, Mobile: Horizontal Scroll */}
        <div className="hidden lg:grid grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-elevated transition-all">
                <CardContent className="p-6">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={testimonial.photo} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Quote className="h-8 w-8 text-primary/30 mb-3" />
                  <blockquote className="text-lg font-display mb-4 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.profession}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="lg:hidden relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="min-w-[85vw] snap-start">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Avatar className="h-16 w-16 mb-4">
                      <AvatarImage src={testimonial.photo} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {testimonial.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Quote className="h-8 w-8 text-primary/30 mb-3" />
                    <blockquote className="text-lg font-display mb-4 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.profession}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// ==================== SCIENCE BEHIND ====================
const ScienceBehind = () => {
  const stats = [
    { value: 33, label: 'Immunity increase', icon: TrendingUp, suffix: '%' },
    { value: 57, label: 'Stress hormones', icon: TrendingDown, suffix: '%' },
    { value: 21, label: 'Life satisfaction', icon: TrendingUp, suffix: '%' },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Backed by 100+ peer-reviewed studies
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Science Behind Sudarshan Kriya™
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Research-backed benefits with measurable results
          </p>
        </motion.div>

        <div ref={ref} className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.2, duration: 0.5 }}
              >
                <Card className="text-center hover:shadow-elevated transition-all border-2 border-primary/10">
                  <CardContent className="p-8">
                    <Icon
                      className={`h-12 w-12 mx-auto mb-4 ${stat.icon === TrendingUp ? 'text-green-600' : 'text-red-600'}`}
                    />
                    <AnimatedCounter target={stat.value} isVisible={isInView} />
                    <span className="text-4xl font-display font-bold text-primary">
                      {stat.suffix}
                    </span>
                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Research Logos (Dummy) */}
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div className="px-6 py-3 bg-muted rounded-lg">
            <p className="font-semibold text-sm">CNN</p>
          </div>
          <div className="px-6 py-3 bg-muted rounded-lg">
            <p className="font-semibold text-sm">Prevention</p>
          </div>
          <div className="px-6 py-3 bg-muted rounded-lg">
            <p className="font-semibold text-sm">Dainik Bhaskar</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ target, isVisible }: { target: number; isVisible: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      const interval = duration / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [target, isVisible]);

  return <span className="text-4xl font-display font-bold text-primary">{count}</span>;
};

// ==================== FACILITIES & AMENITIES ====================
const FacilitiesAmenities = () => {
  const facilities = [
    {
      icon: Car,
      name: '24/7 Shuttle',
      description: 'Complimentary shuttle service available around the clock',
    },
    { icon: CreditCard, name: 'ATM', description: 'ATM facility on-site for your convenience' },
    { icon: Globe, name: 'Travel Desk', description: 'Assistance with travel arrangements' },
    { icon: Wifi, name: 'WiFi', description: 'High-speed internet throughout the campus' },
    {
      icon: ShoppingBag,
      name: 'Shopping Complex',
      description: 'Well-stocked shopping center nearby',
    },
    { icon: Coffee, name: 'Cafes & Restaurants', description: 'Multiple dining options available' },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Facilities & Amenities
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for a comfortable stay
          </p>
        </motion.div>

        <TooltipProvider>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 max-w-6xl mx-auto">
            {facilities.map((facility, i) => {
              const Icon = facility.icon;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="text-center cursor-pointer hover:shadow-elevated transition-all border-2 border-transparent hover:border-primary/20">
                        <CardContent className="p-6">
                          <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <Icon className="h-7 w-7 text-primary" />
                          </div>
                          <p className="font-medium text-sm">{facility.name}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{facility.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
};

// ==================== UPCOMING PROGRAMS SECTION ====================
const UpcomingProgramsSection = ({
  programs,
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  typeFilter,
  onTypeChange,
  onRegister,
}: {
  programs: Program[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  languageFilter: Language | 'all';
  onLanguageChange: (value: Language | 'all') => void;
  typeFilter: ProgramType | 'all';
  onTypeChange: (value: ProgramType | 'all') => void;
  onRegister: () => void;
}) => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Upcoming Programs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a batch that works for you
          </p>
        </motion.div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={languageFilter} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Tamil">Tamil</SelectItem>
                <SelectItem value="Telugu">Telugu</SelectItem>
                <SelectItem value="Kannada">Kannada</SelectItem>
                <SelectItem value="Marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Program Cards */}
        {programs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-elevated transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-primary mb-4">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">{program.date}</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {program.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {program.spots} spots left
                      </div>
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      {program.language}
                    </Badge>
                    <Button className="w-full" onClick={onRegister}>
                      Register
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No programs found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ==================== FOUNDER SECTION ====================
const FounderSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Gurudev Sri Sri Ravi Shankar
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Global humanitarian, spiritual leader, and founder of Art of Living Foundation.
              Creator of Sudarshan Kriya, a powerful breathing technique that has transformed
              millions of lives across 180+ countries.
            </p>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== FAQ SECTION ====================
type FAQ = {
  id: string;
  question: string;
  answer: string;
};

const FAQSection = ({ faqs }: { faqs: FAQ[] }) => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} className="border-2 rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

// ==================== EXTRAORDINARY FEATURES ====================
const ExtraordinaryFeatures = ({
  moodBefore,
  onMoodChange,
  isPlaying,
  onPlayingChange,
}: {
  moodBefore: number;
  onMoodChange: (value: number) => void;
  isPlaying: boolean;
  onPlayingChange: (value: boolean) => void;
}) => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Experience the Transformation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Interactive tools to explore before you begin
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Mood Check-in */}
          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="font-display text-2xl font-semibold mb-4">Mood Check-in</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Rate your current mood (before/after slider)
              </p>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Before</span>
                  <span>After</span>
                </div>
                <Slider
                  value={[moodBefore]}
                  onValueChange={value => onMoodChange(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <span className="text-2xl font-display font-bold text-primary">{moodBefore}</span>
                  <span className="text-muted-foreground ml-2">/ 100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breathing Preview */}
          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="font-display text-2xl font-semibold mb-4">Breathing Preview</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Experience a 30-second guided breathing session
              </p>
              <Button
                className="w-full"
                onClick={() => onPlayingChange(!isPlaying)}
                variant={isPlaying ? 'outline' : 'default'}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                {isPlaying ? 'Stop' : 'Play'} Preview (30 sec)
              </Button>
              {isPlaying && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Audio would play here...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="font-display text-2xl font-semibold mb-4">Save to Calendar</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Add program dates to your calendar
              </p>
              <Button className="w-full" variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            </CardContent>
          </Card>

          {/* WhatsApp Reminder */}
          <Card className="border-2">
            <CardContent className="p-6">
              <h3 className="font-display text-2xl font-semibold mb-4">WhatsApp Reminder</h3>
              <p className="text-muted-foreground mb-6 text-sm">Get reminders via WhatsApp</p>
              <Button className="w-full" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Enable Reminders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// ==================== ACCESSIBILITY CONTROLS ====================
const AccessibilityControls = ({
  fontSize,
  onFontSizeChange,
  highContrast,
  onHighContrastChange,
}: {
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  highContrast: boolean;
  onHighContrastChange: (value: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="rounded-full h-14 w-14 shadow-elevated"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Accessibility</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 right-0 w-64 bg-background border-2 rounded-lg shadow-elevated p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Accessibility</span>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Font Size</span>
                <span className="text-xs text-muted-foreground">{fontSize}%</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={value => onFontSizeChange(value[0])}
                min={80}
                max={150}
                step={5}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">High Contrast</span>
              <Button
                variant={highContrast ? 'default' : 'outline'}
                size="sm"
                onClick={() => onHighContrastChange(!highContrast)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Button variant="outline" size="sm" className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                Language
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HappinessProgram;
