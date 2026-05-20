import React, { useState, useMemo } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import {
  ArrowRight, Calendar, Heart, Brain, Zap, Users, Search, Globe, Eye, Maximize2, X,
  Shield, Sparkles, CheckCircle2, Award, BookOpen
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import heroImage from '@/assets/hero-ashram.jpg';

// ==================== TYPE DEFINITIONS ====================
type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';

interface Program {
  id: string;
  date: string;
  name: string;
  location: string;
  language: Language;
  duration: string;
  spots: number;
}

interface Benefit {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Shield;
}

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  age?: number;
  photo?: string;
}

// ==================== DATA (EXTERNALIZABLE) ====================
const benefits: Benefit[] = [
  {
    id: '1',
    title: 'Strength & Poise',
    subtitle: 'Yoga Poses (Asanas)',
    description: 'Physical postures that build strength, flexibility, and body awareness through mindful movement',
    icon: Shield,
  },
  {
    id: '2',
    title: 'Deep Rest',
    subtitle: 'Meditation & Relaxation',
    description: 'Practices for mental restoration, stress relief, and profound relaxation',
    icon: Heart,
  },
  {
    id: '3',
    title: 'Energy',
    subtitle: 'Yogic Breathing (Pranayama)',
    description: 'Breathing techniques that regulate life force energy and enhance vitality',
    icon: Zap,
  },
  {
    id: '4',
    title: 'Insight',
    subtitle: 'Wisdom from Yoga',
    description: 'Ancient yogic knowledge and lifestyle wisdom for holistic living',
    icon: Brain,
  },
];

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'I came looking for physical flexibility but found so much more. The practice has brought balance to my entire life.',
    name: 'Purti Gadkari',
    role: 'School Teacher',
    age: 42,
  },
  {
    id: '2',
    quote: 'As someone with a demanding job, Sri Sri Yoga helps me stay grounded. The non-competitive environment is exactly what I needed.',
    name: 'Jonathan Tang',
    role: 'Senior Venture Partner',
    age: 38,
  },
  {
    id: '3',
    quote: 'I love that I can practice at my own pace. No one is comparing or judging. It\'s been great for both my body and my confidence.',
    name: 'Shriya',
    role: 'Student',
    age: 15,
  },
];

const upcomingPrograms: Program[] = [
  {
    id: '1',
    date: 'Apr 10-15, 2026',
    name: 'Sri Sri Yoga Level I',
    location: 'Bangalore Ashram',
    language: 'English',
    duration: '6 days',
    spots: 30,
  },
  {
    id: '2',
    date: 'Apr 20-24, 2026',
    name: 'Sri Sri Yoga Level I',
    location: 'Mumbai Center',
    language: 'Hindi',
    duration: '5 days',
    spots: 25,
  },
  {
    id: '3',
    date: 'May 5-9, 2026',
    name: 'Sri Sri Yoga Level I',
    location: 'Online',
    language: 'English',
    duration: '5 days',
    spots: 50,
  },
];

// ==================== MAIN COMPONENT ====================
const SriSriYogaProgram = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  const filteredPrograms = useMemo(() => {
    return upcomingPrograms.filter(program => {
      const matchesSearch = searchQuery === '' ||
        program.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.language.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || program.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });
  }, [searchQuery, languageFilter]);

  const handleRegister = () => {
    window.open('https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <div className={`${highContrast ? 'contrast-150' : ''}`} style={{ fontSize: `${fontSize}%` }}>
        {/* SECTION 1: HERO */}
        <HeroSection onRegister={handleRegister} />

        {/* SECTION 2: WHAT WILL I GET */}
        <WhatWillIGet benefits={benefits} />

        {/* SECTION 3: SRI SRI YOGA IS DIFFERENT */}
        <PositioningSection />

        {/* SECTION 4: PARTICIPANT TESTIMONIALS */}
        <TestimonialsSection testimonials={testimonials} />

        {/* SECTION 5: FOUNDER & LINEAGE */}
        <FounderLineage />

        {/* SECTION 6: UPCOMING PROGRAMS */}
        <UpcomingProgramsSection
          programs={filteredPrograms}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          onRegister={handleRegister}
        />

        {/* SECTION 7: FINAL CALL TO PRACTICE */}
        <FinalCallToPractice onRegister={handleRegister} />

        {/* ADVANCED FEATURES */}
        <AdvancedFeatures
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
        />
      </div>
    </MainLayout>
  );
};

// ==================== SECTION 1: HERO ====================
const HeroSection = ({ onRegister }: { onRegister: () => void }) => {
  const controls = useAnimationControls();

  React.useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({ y: -2, opacity: 0.98 });
        await controls.start({ y: 0, opacity: 1 });
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    };
    animate();
  }, [controls]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Yoga practice space"
          className="h-full w-full object-cover opacity-8"
        />
        <motion.div
          animate={controls}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-amber-50/20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight text-stone-800"
          >
            Sri Sri Yoga<br />
            <span className="font-normal text-stone-700">Classes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-stone-700 mb-4 font-light leading-relaxed max-w-3xl mx-auto"
          >
            Sri Sri Yoga enhances flexibility, strength, and health — fostering centeredness through holistic yoga practice
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-stone-600 mb-8"
          >
            Energize • Improve health and flexibility • Get stronger and grounded
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-stone-600"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>4 to 6-day residential format</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Contribution supports social projects</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-stone-700 text-amber-50 hover:bg-stone-600 font-light tracking-wide"
            >
              Sign Up
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== SECTION 2: WHAT WILL I GET ====================
const WhatWillIGet = ({ benefits }: { benefits: Benefit[] }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-stone-900">
            What Will I Get from This Workshop?
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed">
            This workshop teaches a holistic way of energizing and integrating your mind, body, and spirit through a restorative yoga practice.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white transition-all">
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-green-700" />
                    </div>
                    <h3 className="font-display text-xl font-light mb-2 text-stone-900">{benefit.title}</h3>
                    <p className="text-sm text-green-700 font-medium mb-4">{benefit.subtitle}</p>
                    <p className="text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
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

// ==================== SECTION 3: POSITIONING ====================
const PositioningSection = () => {
  return (
    <section className="py-24 bg-stone-50/50">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-8 text-stone-900">
              Sri Sri Yoga Is Different
            </h2>
          </motion.div>

          <div className="space-y-12">
            {/* Sub-section 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg border border-stone-200"
            >
              <h3 className="font-display text-2xl font-light mb-4 text-stone-900">
                Are you tired of competitive or superficial yoga culture?
              </h3>
              <div className="space-y-3 text-stone-700 leading-relaxed">
                <p>• No comparison</p>
                <p>• No performance pressure</p>
                <p>• No aesthetic obsession</p>
              </div>
            </motion.div>

            {/* Sub-section 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg border border-stone-200"
            >
              <h3 className="font-display text-2xl font-light mb-4 text-stone-900">
                An Accepting Environment to Be Yourself
              </h3>
              <div className="space-y-3 text-stone-700 leading-relaxed">
                <p>• Non-judgmental</p>
                <p>• Personal edge</p>
                <p>• Safe exploration</p>
                <p>• Inner awareness over outer display</p>
              </div>
            </motion.div>

            {/* Sub-section 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg border border-stone-200"
            >
              <h3 className="font-display text-2xl font-light mb-4 text-stone-900">
                More Than Just Yoga Poses
              </h3>
              <div className="space-y-3 text-stone-700 leading-relaxed">
                <p>• Asanas</p>
                <p>• Pranayama</p>
                <p>• Guided meditation</p>
                <p>• Yogic knowledge & lifestyle wisdom</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 4: TESTIMONIALS ====================
const TestimonialsSection = ({ testimonials }: { testimonials: Testimonial[] }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900">
            Participant Testimonials
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border border-stone-200 shadow-none bg-white">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="h-16 w-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-green-700" />
                    </div>
                  </div>
                  <blockquote className="text-stone-700 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="pt-4 border-t border-stone-200">
                    <p className="font-semibold text-stone-900">{testimonial.name}</p>
                    <p className="text-sm text-stone-600">{testimonial.role}</p>
                    {testimonial.age && (
                      <p className="text-xs text-stone-500 mt-1">Age {testimonial.age}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 5: FOUNDER & LINEAGE ====================
const FounderLineage = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-green-50/30 via-amber-50/20 to-stone-50/30">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-5">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-green-50/40" />

      {/* Content */}
      <div className="relative z-10 container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-stone-900">
              Gurudev Sri Sri Ravi Shankar
            </h2>
            <p className="text-lg md:text-xl text-stone-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              Global humanitarian, spiritual leader and ambassador of peace. Gurudev has made authentic yogic practice accessible to all, emphasizing inner transformation over external performance.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-2 border-stone-700 text-stone-700 hover:bg-stone-700 hover:text-white font-light"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 6: UPCOMING PROGRAMS ====================
const UpcomingProgramsSection = ({
  programs,
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  onRegister,
}: {
  programs: Program[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  languageFilter: Language | 'all';
  onLanguageChange: (value: Language | 'all') => void;
  onRegister: () => void;
}) => {
  return (
    <section className="py-24 bg-stone-50/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900">
            Upcoming Programs
          </h2>
        </motion.div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-stone-300 bg-white"
            />
          </div>
          <Select value={languageFilter} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-full md:w-[200px] border-stone-300 bg-white">
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
        </div>

        {/* Program Cards */}
        {programs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 text-stone-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">{program.date}</span>
                    </div>
                    <h3 className="font-display text-2xl font-light mb-3 text-stone-900">{program.name}</h3>
                    <div className="flex items-center gap-4 mb-6 text-sm text-stone-600">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-stone-200">
                        {program.language}
                      </Badge>
                      <span>{program.location}</span>
                    </div>
                    <p className="text-sm text-stone-600 mb-6">{program.duration}</p>
                    <Button
                      className="w-full bg-stone-700 text-amber-50 hover:bg-stone-600 font-light"
                      onClick={onRegister}
                    >
                      Register
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <p className="text-stone-600 text-lg mb-2">No program found.</p>
            <p className="text-stone-500 text-sm">Please change your search criteria.</p>
          </div>
        )}

        {/* View More Link */}
        <div className="text-center mt-12">
          <Button variant="ghost" className="text-stone-700 hover:text-stone-900">
            View all programs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 7: FINAL CALL TO PRACTICE ====================
const FinalCallToPractice = ({ onRegister }: { onRegister: () => void }) => {
  return (
    <section className="py-24 bg-white border-t border-stone-200">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-stone-900">
              Register Now
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              Begin your journey of embodied practice and inner transformation
            </p>
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-stone-700 text-amber-50 hover:bg-stone-600 font-light tracking-wide"
            >
              Register Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== ADVANCED FEATURES ====================
const AdvancedFeatures = ({
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

  return null;
};

export default SriSriYogaProgram;
