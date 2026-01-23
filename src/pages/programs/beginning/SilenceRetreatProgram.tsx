import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Search, Heart, Brain, Wind, Moon, Sun, TreePine, Mountain,
  CheckCircle2, Quote, ArrowRight, Globe, Users
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import heroImage from '@/assets/hero-ashram.jpg';

// ==================== TYPE DEFINITIONS ====================
type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';

interface Program {
  id: string;
  date: string;
  name: string;
  location: string;
  language: Language;
  benefits: string;
}

interface Benefit {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photo?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// ==================== DATA ====================
const benefits: Benefit[] = [
  {
    id: '1',
    icon: Heart,
    title: 'Effectively Manage Emotions',
    description: 'Learn to navigate your emotional landscape with grace and awareness, finding inner balance and peace.',
  },
  {
    id: '2',
    icon: Wind,
    title: 'Tools to Effortlessly Relax',
    description: 'Discover powerful techniques that help you unwind naturally, releasing tension from body and mind.',
  },
  {
    id: '3',
    icon: Brain,
    title: 'Understanding the Mind',
    description: 'Gain deep insights into the workings of your mind and develop clarity in thought and perception.',
  },
  {
    id: '4',
    icon: Sun,
    title: 'The Power of Breath',
    description: 'Experience the transformative effects of conscious breathing practices that energize and calm.',
  },
  {
    id: '5',
    icon: Moon,
    title: 'Experience of Absolute Silence',
    description: 'Immerse yourself in profound silence that goes beyond words, connecting you to your deepest self.',
  },
  {
    id: '6',
    icon: TreePine,
    title: 'Deep Meditations',
    description: 'Journey into states of deep meditation that bring rest, clarity, and inner transformation.',
  },
];

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Virat Chirania',
    role: 'Faculty',
    quote: 'The Silence Retreat was a profound experience. The combination of breathing techniques and deep meditation in complete silence allowed me to connect with myself in ways I never imagined. It was truly a holiday for my body, mind, and soul.',
  },
  {
    id: '2',
    name: 'Shashank Dixit',
    role: 'IT Security Specialist',
    quote: 'As someone constantly surrounded by technology and noise, the Silence Retreat was exactly what I needed. The natural surroundings and the practice of silence helped me find clarity and peace I had been searching for.',
  },
  {
    id: '3',
    name: 'Pawan Poddar',
    role: 'Corporate Executive',
    quote: 'The retreat transformed my perspective on stress and relaxation. The tools I learned here have become essential in my daily life. The silence wasn\'t empty—it was full of insights and understanding.',
  },
  {
    id: '4',
    name: 'Shagun Pant',
    role: 'Radio Jockey',
    quote: 'Coming from a profession where I\'m always talking, the experience of complete silence was initially challenging but ultimately liberating. I discovered a depth within myself I didn\'t know existed.',
  },
  {
    id: '5',
    name: 'Gayathri U.',
    role: 'Resource Manager',
    quote: 'The Silence Retreat was a beautiful journey from head to heart. The meditations, the breathing practices, and the supportive environment created a space for deep inner work and transformation.',
  },
];

const upcomingPrograms: Program[] = [
  {
    id: '1',
    date: '2024-03-15',
    name: 'Spring Silence Retreat',
    location: 'Bengaluru Ashram',
    language: 'English',
    benefits: 'Deep meditation • Complete silence • Nature immersion',
  },
  {
    id: '2',
    date: '2024-04-20',
    name: 'Summer Silence Retreat',
    location: 'Bengaluru Ashram',
    language: 'Hindi',
    benefits: 'Breathing techniques • Emotional balance • Inner peace',
  },
  {
    id: '3',
    date: '2024-05-10',
    name: 'Monsoon Silence Retreat',
    location: 'Bengaluru Ashram',
    language: 'English',
    benefits: 'Silence practice • Deep rest • Spiritual growth',
  },
];

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'Who is eligible for the Silence Retreat?',
    answer: 'The Silence Retreat is ideal for beginners in spirituality and anyone seeking a deeper experience. There is no age restriction, though participants should be in reasonable health. The program combines the Happiness Program with advanced meditation practices, making it accessible to newcomers while offering depth for experienced practitioners.',
  },
  {
    id: '2',
    question: 'Can I join if I have medical conditions?',
    answer: 'Yes, you can join with most medical conditions. However, we recommend consulting with your healthcare provider before attending, especially if you have serious health concerns. Please inform us of any medical conditions during registration so we can ensure your comfort and safety during the retreat.',
  },
  {
    id: '3',
    question: 'What about accommodation and food?',
    answer: 'The retreat is held at our beautiful Bengaluru campus with comfortable residential accommodation. Nutritious vegetarian meals are provided, and we can accommodate dietary restrictions if informed in advance. The natural surroundings and peaceful environment enhance the retreat experience.',
  },
  {
    id: '4',
    question: 'Can I use electronic devices during the silence period?',
    answer: 'To fully benefit from the Silence Retreat, we encourage complete disconnection from electronic devices during the silence period. This includes phones, tablets, and laptops. This digital silence is an essential part of the experience, allowing you to truly withdraw from the noise of daily life and connect with your inner self.',
  },
  {
    id: '5',
    question: 'How is this different from Vipassana?',
    answer: 'While both practices involve silence and meditation, the Silence Retreat combines breathing techniques (Sudarshan Kriya™) with guided meditations and teachings. It\'s designed as a holiday for body, mind, and soul, with a supportive environment and structured practices that make it accessible to beginners while offering depth for all participants.',
  },
  {
    id: '6',
    question: 'Can I repeat the program?',
    answer: 'Absolutely. Many participants find that repeating the Silence Retreat deepens their practice and offers new insights each time. Each retreat is a unique experience, and returning participants often discover new layers of understanding and transformation.',
  },
  {
    id: '7',
    question: 'What amenities are available at the campus?',
    answer: 'The Bengaluru campus offers comfortable accommodation, meditation halls, beautiful natural surroundings, vegetarian dining facilities, and spaces for quiet reflection. The campus is designed to support your journey into silence and inner exploration.',
  },
];

// ==================== MAIN COMPONENT ====================
const SilenceRetreatProgram = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-stone-50">
        {/* SECTION 1: HERO */}
        <HeroSection onRegister={handleRegister} />

        {/* SECTION 2: WHAT IS SILENCE RETREAT */}
        <WhatIsSilenceRetreat />

        {/* SECTION 3: WHAT WILL I GET */}
        <WhatWillIGet benefits={benefits} />

        {/* SECTION 4: TESTIMONIALS */}
        <TestimonialsSection
          testimonials={testimonials}
          currentIndex={currentTestimonial}
          onIndexChange={setCurrentTestimonial}
        />

        {/* SECTION 5: SCIENCE BEHIND */}
        <ScienceSection onRegister={handleRegister} />

        {/* SECTION 6: FOUNDER */}
        <FounderSection />

        {/* SECTION 7: UPCOMING RETREATS */}
        <UpcomingRetreatsSection
          programs={filteredPrograms}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          onRegister={handleRegister}
        />

        {/* SECTION 8: FAQ */}
        <FAQSection faqs={faqs} />

        {/* SECTION 9: FINAL INVITATION */}
        <FinalInvitation onRegister={handleRegister} />
      </div>
    </MainLayout>
  );
};

// ==================== SECTION 1: HERO ====================
const HeroSection = ({ onRegister }: { onRegister: () => void }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(34, 47, 62, 0.3), rgba(34, 47, 62, 0.4)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-4 py-24 text-center max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="font-serif text-6xl md:text-7xl font-light text-stone-50 mb-6 tracking-wide"
        >
          Silence Retreat
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="font-serif text-2xl md:text-3xl text-stone-100 mb-4 font-light"
        >
          A Holiday for Body, Mind & Soul
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.9 }}
          className="text-lg md:text-xl text-stone-200 mb-12 font-light"
        >
          A wonderful journey from Head to Heart
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8 text-stone-200 text-sm md:text-base"
        >
          <span>Remove Stress</span>
          <span className="text-stone-400">•</span>
          <span>Improve Relationships</span>
          <span className="text-stone-400">•</span>
          <span>Boost Immunity</span>
          <span className="text-stone-400">•</span>
          <span>Profound Silence</span>
          <span className="text-stone-400">•</span>
          <span>Deep Meditations</span>
          <span className="text-stone-400">•</span>
          <span>Increased Energy</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="mb-8"
        >
          <p className="text-stone-300 mb-6 text-sm">6-day residential format</p>
          <Button
            onClick={onRegister}
            size="lg"
            className="bg-forest-600 hover:bg-forest-700 text-white px-8 py-6 text-lg font-light rounded-none border-0"
            style={{ backgroundColor: '#2d5016' }}
          >
            Sign me up!
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ==================== SECTION 2: WHAT IS SILENCE RETREAT ====================
const WhatIsSilenceRetreat = () => {
  return (
    <section className="py-24 px-4 bg-stone-50">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-12 text-center"
        >
          What Is Silence Retreat?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="prose prose-lg max-w-none text-stone-700 leading-relaxed space-y-6"
        >
          <p className="text-lg leading-loose">
            The Silence Retreat is a unique combination of the Happiness Program and Advanced Meditation practices,
            designed as a complete holiday for your body, mind, and soul. This retreat is ideal for beginners in
            spirituality who are seeking a deeper, more immersive experience.
          </p>

          <p className="text-lg leading-loose">
            During this transformative journey, you will learn powerful breathing techniques and engage in deep
            meditations that take you beyond the surface of daily life. The practice of silence serves as deep rest
            for your entire being, allowing you to step away from the constant noise and stimulation of modern life.
          </p>

          <p className="text-lg leading-loose">
            This is not just a course—it is a journey from head to heart. Through the combination of structured
            practices and the natural surroundings of our Bengaluru campus, you will discover a space of profound
            inner quiet where insights arise naturally and transformation happens organically.
          </p>

          <p className="text-lg leading-loose">
            The retreat offers a complete withdrawal from the world, creating an environment where you can truly
            connect with yourself. In the spacious silence, you'll find that what you've been seeking externally
            has been waiting within you all along.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== SECTION 3: WHAT WILL I GET ====================
const WhatWillIGet = ({ benefits }: { benefits: Benefit[] }) => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-16 text-center"
        >
          What Will I Get from This Program?
        </motion.h2>

        <div className="space-y-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: index * 0.1 }}
                className="flex items-start gap-6 pb-12 border-b border-stone-200 last:border-0"
              >
                <div className="flex-shrink-0 mt-1">
                  <Icon className="h-8 w-8 text-forest-600" style={{ color: '#2d5016' }} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl font-light text-stone-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 4: TESTIMONIALS ====================
const TestimonialsSection = ({
  testimonials,
  currentIndex,
  onIndexChange,
}: {
  testimonials: Testimonial[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) => {
  return (
    <section className="py-24 px-4 bg-stone-100 min-h-[600px] flex items-center">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-16 text-center"
        >
          Voices from the Silence
        </motion.h2>

        <div className="relative min-h-[400px]">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentIndex ? 1 : 0 }}
              transition={{ duration: 2 }}
              className={`absolute inset-0 ${index === currentIndex ? 'block' : 'hidden'}`}
            >
              <div className="text-center">
                <Quote className="h-12 w-12 text-stone-400 mx-auto mb-8" strokeWidth={1} />
                <p className="font-serif text-xl md:text-2xl text-stone-700 leading-relaxed mb-8 italic font-light">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-stone-300">
                    <AvatarFallback className="bg-stone-300 text-stone-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium text-stone-800">{testimonial.name}</p>
                    <p className="text-sm text-stone-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-center gap-2 mt-16">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? 'bg-forest-600 w-8'
                    : 'bg-stone-300'
                }`}
                style={index === currentIndex ? { backgroundColor: '#2d5016' } : {}}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 5: SCIENCE ====================
const ScienceSection = ({ onRegister }: { onRegister: () => void }) => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-16 text-center"
        >
          What Does Science Say About Sudarshan Kriya™?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="text-center"
          >
            <div className="text-5xl font-serif font-light text-forest-600 mb-2" style={{ color: '#2d5016' }}>
              ▲ 33%
            </div>
            <p className="text-stone-700 text-lg">Immunity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-center"
          >
            <div className="text-5xl font-serif font-light text-forest-600 mb-2" style={{ color: '#2d5016' }}>
              ▼ 57%
            </div>
            <p className="text-stone-700 text-lg">Stress Hormones</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="text-center"
          >
            <div className="text-5xl font-serif font-light text-forest-600 mb-2" style={{ color: '#2d5016' }}>
              ▲ 21%
            </div>
            <p className="text-stone-700 text-lg">Life Satisfaction</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="flex flex-wrap justify-center gap-8 mb-12 opacity-60"
        >
          <div className="text-stone-500 text-sm">Harvard Medical School</div>
          <div className="text-stone-500 text-sm">CNN</div>
          <div className="text-stone-500 text-sm">Prevention</div>
          <div className="text-stone-500 text-sm">Dainik Bhaskar</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="text-center"
        >
          <Button
            onClick={onRegister}
            size="lg"
            className="bg-forest-600 hover:bg-forest-700 text-white px-8 py-6 text-lg font-light rounded-none border-0"
            style={{ backgroundColor: '#2d5016' }}
          >
            Register Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== SECTION 6: FOUNDER ====================
const FounderSection = () => {
  return (
    <section
      className="relative py-32 px-4 bg-stone-200"
      style={{
        backgroundImage: `linear-gradient(rgba(45, 80, 22, 0.1), rgba(45, 80, 22, 0.1)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-8"
        >
          Gurudev Sri Sri Ravi Shankar
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="text-lg text-stone-700 mb-8 leading-relaxed"
        >
          Global humanitarian, spiritual leader and ambassador of peace
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          <Button
            variant="outline"
            className="border-stone-600 text-stone-700 hover:bg-stone-300 px-6 py-3 font-light rounded-none"
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== SECTION 7: UPCOMING RETREATS ====================
const UpcomingRetreatsSection = ({
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
    <section className="py-24 px-4 bg-stone-50">
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-12 text-center"
        >
          Upcoming Programs
        </motion.h2>

        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white border-stone-300 rounded-none"
            />
          </div>
          <Select value={languageFilter} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-full md:w-[200px] bg-white border-stone-300 rounded-none">
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

        <div className="space-y-6 mb-8">
          {programs.length > 0 ? (
            programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="bg-white border border-stone-200 p-6 hover:border-stone-400 transition-colors duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <Calendar className="h-5 w-5 text-stone-500" />
                      <span className="text-stone-600">{program.date}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600">{program.language}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light text-stone-800 mb-2">
                      {program.name}
                    </h3>
                    <p className="text-stone-600 mb-2">{program.location}</p>
                    <p className="text-stone-500 text-sm">{program.benefits}</p>
                  </div>
                  <Button
                    onClick={onRegister}
                    className="bg-forest-600 hover:bg-forest-700 text-white px-6 py-3 font-light rounded-none border-0"
                    style={{ backgroundColor: '#2d5016' }}
                  >
                    Register
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-stone-500 py-12">No programs found. Please change your search criteria.</p>
          )}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            className="border-stone-400 text-stone-700 hover:bg-stone-100 px-6 py-3 font-light rounded-none"
          >
            View more programs
          </Button>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 8: FAQ ====================
const FAQSection = ({ faqs }: { faqs: FAQ[] }) => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="font-serif text-4xl md:text-5xl font-light text-stone-800 mb-16 text-center"
        >
          I Want to Join, But…
        </motion.h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 }}
            >
              <AccordionItem value={faq.id} className="border-stone-200">
                <AccordionTrigger className="text-left font-serif text-lg font-light text-stone-800 hover:text-stone-600 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone-600 leading-relaxed text-base pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

// ==================== SECTION 9: FINAL INVITATION ====================
const FinalInvitation = ({ onRegister }: { onRegister: () => void }) => {
  return (
    <section className="py-32 px-4 bg-stone-50">
      <div className="container mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-800">
              Ok, Got It. Sign Me Up!
            </h2>
          </div>
          <Button
            onClick={onRegister}
            size="lg"
            className="bg-forest-600 hover:bg-forest-700 text-white px-12 py-6 text-lg font-light rounded-none border-0"
            style={{ backgroundColor: '#2d5016' }}
          >
            Sign Me Up!
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SilenceRetreatProgram;
