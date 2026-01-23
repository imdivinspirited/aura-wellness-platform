import { useState, useMemo, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import {
  ArrowRight, Check, Calendar, Clock, Heart, Brain, Zap, Sparkles, Users, Quote,
  Search, FileText, Play, Bell, BookOpen, Globe, Eye, Maximize2, X
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import heroImage from '@/assets/hero-ashram.jpg';

// ==================== TYPE DEFINITIONS ====================
type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';

interface Program {
  id: string;
  date: string;
  name: string;
  benefits: string;
  language: Language;
  location: string;
  duration: string;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: typeof Heart;
}

interface CourseItem {
  id: string;
  text: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// ==================== DATA (EXTERNALIZABLE) ====================
const benefits: Benefit[] = [
  {
    id: '1',
    title: 'Enhanced peace of mind',
    description: 'Experience deep inner calm and tranquility that remains with you throughout your day',
    icon: Heart,
  },
  {
    id: '2',
    title: 'Increased mental clarity',
    description: 'Achieve sharper focus and clearer thinking through regular meditation practice',
    icon: Brain,
  },
  {
    id: '3',
    title: 'Improved physical health',
    description: 'Support your body\'s natural healing and wellness through deep rest and relaxation',
    icon: Zap,
  },
  {
    id: '4',
    title: 'Unlocked intuitive skills',
    description: 'Tap into your inner wisdom and develop heightened awareness and intuition',
    icon: Sparkles,
  },
];

const courseItems: CourseItem[] = [
  { id: '1', text: 'Personal mantra-based meditation technique' },
  { id: '2', text: 'Key principles of meditation' },
  { id: '3', text: 'Understanding mental disturbances & remedies' },
  { id: '4', text: 'Impact of food on mind & thoughts' },
];

const upcomingPrograms: Program[] = [
  {
    id: '1',
    date: 'Mar 15-17, 2026',
    name: 'Sahaj Samadhi Dhyana Yoga',
    benefits: '3-day residential meditation program',
    language: 'English',
    location: 'Bangalore Ashram',
    duration: '3 days',
  },
  {
    id: '2',
    date: 'Mar 25-27, 2026',
    name: 'Sahaj Samadhi Dhyana Yoga',
    benefits: 'Deep meditation practice and personalized mantra',
    language: 'Hindi',
    location: 'Mumbai Center',
    duration: '3 days',
  },
  {
    id: '3',
    date: 'Apr 5-7, 2026',
    name: 'Sahaj Samadhi Dhyana Yoga',
    benefits: 'Enhance peace, clarity, and intuitive skills',
    language: 'English',
    location: 'Online',
    duration: '3 days',
  },
  {
    id: '4',
    date: 'Apr 20-22, 2026',
    name: 'Sahaj Samadhi Dhyana Yoga',
    benefits: 'Meditation retreat in nature',
    language: 'Tamil',
    location: 'Kerala Ashram',
    duration: '3 days',
  },
];

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'I\'m a complete beginner. Can I join?',
    answer: 'Absolutely. This program is designed for everyone, including complete beginners. No prior meditation experience is needed. Our teachers will guide you step by step, ensuring you understand and experience the practice fully.',
  },
  {
    id: '2',
    question: 'How is this different from mindfulness or guided meditation apps?',
    answer: 'Sahaj Samadhi uses a personalized mantra technique that works at deeper levels of consciousness. Unlike guided meditations that require active listening or mindfulness that requires effort, this technique is effortless and takes you to deeper states of rest automatically. The personalized mantra is given to you by a qualified teacher after understanding your nature.',
  },
  {
    id: '3',
    question: 'I often fall asleep during meditation. Is that okay?',
    answer: 'Yes, that\'s perfectly fine. Sleep during meditation indicates your body needs rest. As you continue practicing regularly, you\'ll naturally move from sleep to deeper states of meditation. The practice is about letting go, not forcing anything.',
  },
  {
    id: '4',
    question: 'Are there any food or timing restrictions?',
    answer: 'We recommend light meals before meditation sessions. The program includes guidance on how food affects the mind. There are no strict restrictions, but we\'ll share wisdom on optimal practices. Timing for your daily practice is flexible and can be adapted to your schedule.',
  },
];

// ==================== MAIN COMPONENT ====================
const SahajSamadhiProgram = () => {
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

        {/* SECTION 3: HOW DOES IT WORK */}
        <HowDoesItWork />

        {/* SECTION 4: WHAT DOES THE COURSE INCLUDE */}
        <CourseIncludes items={courseItems} />

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

        {/* SECTION 7: FAQ */}
        <FAQSection faqs={faqs} />

        {/* SECTION 8: FINAL CALL TO STILLNESS */}
        <FinalCallToStillness onRegister={handleRegister} />

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

  useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({ scale: 1.005, opacity: 0.98 });
        await controls.start({ scale: 1, opacity: 1 });
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    };
    animate();
  }, [controls]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-amber-50/30 via-white to-stone-50/30">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Meditation space"
          className="h-full w-full object-cover opacity-10"
        />
        <motion.div
          animate={controls}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-transparent to-stone-50/20"
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
            className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight text-stone-900"
          >
            Sahaj Samadhi<br />
            <span className="font-normal text-stone-700">Dhyana Yoga</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-stone-700 mb-4 font-light leading-relaxed"
          >
            Sahaj Samadhi Meditation: Uncovering Inner Bliss through Personalized Mantras
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-stone-600 mb-8"
          >
            Enhance peace of mind • Improve health • Boost mental clarity • Unlock intuitive skills
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-stone-600"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>2 hrs/day</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>3-day residential format</span>
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
              className="h-14 px-8 text-lg bg-stone-800 text-amber-50 hover:bg-stone-700 font-light tracking-wide"
            >
              Yes! I choose peace
              <Sparkles className="ml-2 h-5 w-5" />
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
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900">
            What Will I Get from This Program?
          </h2>
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
                whileHover={{ opacity: 0.9 }}
                className="transition-opacity duration-500"
              >
                <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-stone-600" />
                    </div>
                    <h3 className="font-display text-xl font-light mb-4 text-stone-900">{benefit.title}</h3>
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

// ==================== SECTION 3: HOW DOES IT WORK ====================
const HowDoesItWork = () => {
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
              How Does It Work?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-stone-700 leading-relaxed"
          >
            <div className="border-b border-stone-200 pb-8">
              <p className="text-lg mb-4">
                Meditation is essentially deep rest—deeper than the deepest sleep. When the mind becomes very quiet, it settles into a state of profound peace and awareness.
              </p>
            </div>

            <div className="border-b border-stone-200 pb-8">
              <p className="text-lg mb-4">
                In Sahaj Samadhi, we use charged subtle sounds known as mantras. These mantras are not just words—they are vibrations that have been used for thousands of years to help the mind transcend to deeper levels of consciousness.
              </p>
            </div>

            <div className="border-b border-stone-200 pb-8">
              <p className="text-lg mb-4">
                Your teacher will give you a personalized mantra, chosen specifically for you. This mantra becomes your vehicle for effortless inward journey—you simply think it, and it takes you deeper.
              </p>
            </div>

            <div className="pb-8">
              <p className="text-lg">
                As you practice regularly, this technique awakens the natural bliss within you. Your intuition becomes sharper, creativity flows more freely, and you experience a sense of inner fulfillment that remains with you throughout your day.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 4: WHAT DOES THE COURSE INCLUDE ====================
const CourseIncludes = ({ items }: { items: CourseItem[] }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-8 text-stone-900">
              What Does the Course Include?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="h-4 w-4 text-stone-700" />
                </div>
                <p className="text-lg text-stone-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 5: FOUNDER & LINEAGE ====================
const FounderLineage = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-5">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-amber-50/40" />

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
              Global humanitarian, spiritual leader and ambassador of peace. Gurudev has revived the ancient wisdom of meditation, making it accessible and relevant for modern life. Through his teachings, millions worldwide have discovered inner peace and transformation.
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
            Start Your Meditation Journey
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
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
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
                    <p className="text-sm text-stone-600 mb-4">{program.benefits}</p>
                    <div className="flex items-center gap-4 mb-6 text-sm text-stone-600">
                      <Badge variant="secondary" className="bg-amber-50 text-stone-700 border-stone-200">
                        {program.language}
                      </Badge>
                      <span>{program.location}</span>
                    </div>
                    <Button
                      className="w-full bg-stone-800 text-amber-50 hover:bg-stone-700 font-light"
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
          <div className="text-center py-12">
            <p className="text-stone-600">No programs found matching your criteria.</p>
          </div>
        )}

        {/* View More Link */}
        <div className="text-center mt-12">
          <Button variant="ghost" className="text-stone-700 hover:text-stone-900">
            View more programs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 7: FAQ ====================
const FAQSection = ({ faqs }: { faqs: FAQ[] }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900">
              I Want to Join, But…
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-stone-200"
              >
                <AccordionTrigger className="text-left font-light text-stone-900 hover:no-underline text-lg py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone-700 leading-relaxed pb-6">
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

// ==================== SECTION 8: FINAL CALL TO STILLNESS ====================
const FinalCallToStillness = ({ onRegister }: { onRegister: () => void }) => {
  return (
    <section className="py-32 bg-stone-50/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-stone-900">
              Got it, Sign Me Up!
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              Take the first step towards inner peace and transformation
            </p>
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-stone-800 text-amber-50 hover:bg-stone-700 font-light tracking-wide"
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

export default SahajSamadhiProgram;
