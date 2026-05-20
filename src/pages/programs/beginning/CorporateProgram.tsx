import heroImage from '@/assets/hero-ashram.jpg';
import { MainLayout } from '@/components/layout/MainLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Quote,
  Search,
  Shield,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import { useMemo, useState } from 'react';

// ==================== TYPE DEFINITIONS ====================
type Language = 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';

interface Program {
  id: string;
  date: string;
  location: string;
  language: Language;
  spots: number;
  duration: string;
}

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  age?: number;
  photo?: string;
}

interface CorporateOffering {
  id: string;
  title: string;
  headline: string;
  description: string;
  outcome: string;
}

interface EngagementModel {
  id: string;
  name: string;
  sessions: string;
  duration: string;
  capacity: string;
  description: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// ==================== DATA (EXTERNALIZABLE) ====================
const organizationalOutcomes = [
  { id: '1', title: 'Resilience', benefit: 'Enhanced workforce adaptability to change', icon: Shield },
  { id: '2', title: 'Adaptation', benefit: 'Faster response to market dynamics', icon: Target },
  { id: '3', title: 'Focus', benefit: 'Improved concentration and task completion', icon: Brain },
  { id: '4', title: 'Performance', benefit: 'Measurable productivity gains across teams', icon: TrendingUp },
  { id: '5', title: 'Emotional Intelligence', benefit: 'Better interpersonal dynamics and leadership', icon: Users },
  { id: '6', title: 'Decision Making', benefit: 'Clearer thinking under pressure', icon: CheckCircle2 },
];

const professionalTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'The program helped our team manage stress during critical project deadlines. Productivity increased by 23%.',
    name: 'Priya Menon',
    title: 'Senior Product Manager',
    company: 'TechCorp Solutions',
    industry: 'Technology',
    age: 34,
  },
  {
    id: '2',
    quote: 'Our employees report better sleep and higher energy levels. Absenteeism dropped significantly.',
    name: 'Rajesh Kumar',
    title: 'HR Director',
    company: 'Global Manufacturing Inc.',
    industry: 'Manufacturing',
    age: 42,
  },
  {
    id: '3',
    quote: 'Leadership clarity improved across all levels. Decision-making is faster and more effective.',
    name: 'Anjali Shah',
    title: 'VP Operations',
    company: 'FinanceFirst Ltd.',
    industry: 'Financial Services',
    age: 38,
  },
];

const corporateOfferings: CorporateOffering[] = [
  {
    id: '1',
    title: 'Desktop Yoga',
    headline: 'Increase Focus & Reduce Desk Fatigue',
    description: 'Designed for office environments, these sessions fit into busy schedules.',
    outcome: 'Reduced musculoskeletal issues, improved posture, enhanced concentration',
  },
  {
    id: '2',
    title: 'Yoga for Women',
    headline: 'Empower Female Leadership Through Wellness',
    description: 'Specialized programs addressing unique wellness needs of women professionals.',
    outcome: 'Better work-life balance, increased confidence, reduced burnout',
  },
  {
    id: '3',
    title: 'Declutter Your Mind',
    headline: 'Mental Clarity for Strategic Thinking',
    description: 'Techniques to clear mental noise and enhance cognitive performance.',
    outcome: 'Improved decision-making, reduced decision fatigue, clearer priorities',
  },
  {
    id: '4',
    title: 'Energy Reset',
    headline: 'Sustained High Performance Throughout the Day',
    description: 'Breathing techniques and practices to maintain consistent energy levels.',
    outcome: 'Sustained productivity, reduced afternoon slump, better endurance',
  },
  {
    id: '5',
    title: 'Yoga Healing Practice',
    headline: 'Recovery and Restoration for Peak Performance',
    description: 'Restorative practices for recovery from high-stress periods.',
    outcome: 'Faster recovery, reduced stress markers, improved resilience',
  },
  {
    id: '6',
    title: 'Immuno Power',
    headline: 'Build Workforce Immunity and Reduce Sick Days',
    description: 'Science-backed practices to strengthen immune system naturally.',
    outcome: 'Lower absenteeism, stronger immunity, reduced healthcare costs',
  },
];

const executiveTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'This program transformed our organizational culture. ROI was evident within 3 months through reduced stress claims and improved employee satisfaction scores.',
    name: 'Dr. Meera Patel',
    title: 'Director – HR',
    company: 'Fortune 500 Tech Company',
    industry: 'Technology',
  },
  {
    id: '2',
    quote: 'The leadership team adopted these practices and we saw immediate improvements in strategic clarity and team cohesion.',
    name: 'James Wilson',
    title: 'VP – Shared Services',
    company: 'Global Enterprise Corp',
    industry: 'Corporate Services',
  },
  {
    id: '3',
    quote: 'As a CEO, I prioritize initiatives that deliver measurable business outcomes. This program did exactly that – improved productivity, reduced healthcare costs, and enhanced employee engagement.',
    name: 'Ravi Nair',
    title: 'CEO',
    company: 'Leading Financial Institution',
    industry: 'Financial Services',
  },
];

const engagementModels: EngagementModel[] = [
  {
    id: '1',
    name: 'One-Time',
    sessions: '3-6 sessions',
    duration: '1-2 weeks',
    capacity: '50-200 participants',
    description: 'Ideal for workshops, team-building events, or pilot programs',
  },
  {
    id: '2',
    name: 'Monthly',
    sessions: 'Ongoing sessions',
    duration: 'Continuous',
    capacity: '100-500 participants',
    description: 'Sustained engagement for long-term organizational wellness',
  },
  {
    id: '3',
    name: 'Customized',
    sessions: 'Tailored',
    duration: 'Flexible',
    capacity: 'Any size',
    description: 'Designed specifically for your organization\'s unique needs',
  },
];

const upcomingPrograms: Program[] = [
  { id: '1', date: 'Mar 10-13, 2026', location: 'Bangalore Ashram', language: 'English', spots: 50, duration: '3 days' },
  { id: '2', date: 'Mar 20-23, 2026', location: 'Mumbai Center', language: 'English', spots: 40, duration: '3 days' },
  { id: '3', date: 'Apr 5-8, 2026', location: 'Online', language: 'Hindi', spots: 100, duration: '3 days' },
  { id: '4', date: 'Apr 15-18, 2026', location: 'Delhi Center', language: 'English', spots: 45, duration: '3 days' },
];

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'Who is eligible for corporate programs?',
    answer: 'Corporate programs are designed for employees at all levels – from executives to individual contributors. No prior yoga experience is required. Programs are adaptable for different fitness levels and physical conditions.',
  },
  {
    id: '2',
    question: 'Is this program safe for all participants?',
    answer: 'Yes. All programs are designed with safety as a priority. Practices are gentle and adaptable. Participants are advised to inform instructors of any medical conditions, and modifications are provided as needed.',
  },
  {
    id: '3',
    question: 'What medical considerations should we be aware of?',
    answer: 'Participants with chronic health conditions should consult their healthcare provider. We work closely with HR and medical teams to ensure appropriate accommodations. All instructors are trained in safety protocols.',
  },
  {
    id: '4',
    question: 'Can employees repeat programs?',
    answer: 'Absolutely. Many organizations offer programs on an ongoing basis. Repetition deepens benefits and supports long-term behavioral change. We recommend quarterly or bi-annual engagement for optimal results.',
  },
  {
    id: '5',
    question: 'How are program fees structured?',
    answer: 'Fees are based on program type, duration, participant count, and customization level. We offer enterprise pricing for large organizations and can provide detailed proposals based on your requirements.',
  },
];

const trustedOrganizations = [
  'Fortune 500 Tech', 'Global Manufacturing', 'FinanceFirst', 'Healthcare Corp', 'StartupHub',
  'Government Dept', 'Multinational Corp', 'TechStart Inc', 'Enterprise Solutions',
];

// ==================== MAIN COMPONENT ====================
const CorporateProgram = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [stressLevel, setStressLevel] = useState(70);

  const filteredPrograms = useMemo(() => {
    return upcomingPrograms.filter(program => {
      const matchesSearch = searchQuery === '' ||
        program.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* SECTION 1: HERO */}
      <HeroSection onRegister={handleRegister} />

      {/* SECTION 2: PROBLEM STATEMENT */}
      <ProblemStatement />

      {/* SECTION 3: ORGANIZATIONAL OUTCOMES */}
      <OrganizationalOutcomes outcomes={organizationalOutcomes} />

      {/* SECTION 4: PROGRAM PHILOSOPHY */}
      <ProgramPhilosophy />

      {/* SECTION 5: PROFESSIONAL TESTIMONIALS */}
      <ProfessionalTestimonials testimonials={professionalTestimonials} />

      {/* SECTION 6: CORE PROGRAM MODULES */}
      <CoreProgramModules />

      {/* SECTION 7: TRUST & CREDIBILITY */}
      <TrustCredibility organizations={trustedOrganizations} />

      {/* SECTION 8: CORPORATE PROGRAM OFFERINGS */}
      <CorporateOfferings offerings={corporateOfferings} />

      {/* SECTION 9: EXECUTIVE TESTIMONIALS */}
      <ExecutiveTestimonials testimonials={executiveTestimonials} />

      {/* SECTION 10: ENGAGEMENT MODELS */}
      <EngagementModels models={engagementModels} />

      {/* SECTION 11: FOUNDER AUTHORITY */}
      <FounderAuthority />

      {/* SECTION 12: UPCOMING PROGRAMS */}
      <UpcomingProgramsSection
        programs={filteredPrograms}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        languageFilter={languageFilter}
        onLanguageChange={setLanguageFilter}
        onRegister={handleRegister}
      />

      {/* SECTION 13: FAQ */}
      <FAQSection faqs={faqs} />

      {/* SECTION 14: ADVANCED FEATURES */}
      <AdvancedFeatures stressLevel={stressLevel} onStressChange={setStressLevel} />
    </MainLayout>
  );
};

// ==================== SECTION 1: HERO ====================
const HeroSection = ({ onRegister }: { onRegister: () => void; }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 container py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-white"
        >
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            Corporate Program
          </Badge>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Bringing Wellness into<br />
            <span className="text-primary">Employees & Teams</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-200 mb-4 font-medium">
            Remove Stress • Improve Decisions • Boost Immunity
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              3-Day Residential Format
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Enterprise Ready
            </Badge>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Leadership Proven
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100"
            >
              Register
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onRegister}
              className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white/10"
            >
              Request Corporate Proposal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==================== SECTION 2: PROBLEM STATEMENT ====================
const ProblemStatement = () => {
  const painPoints = [
    { title: 'Deadlines', description: 'Constant pressure affecting quality' },
    { title: 'Meetings', description: 'Information overload and decision fatigue' },
    { title: 'Burnout', description: 'Exhaustion reducing productivity' },
    { title: 'Reduced Immunity', description: 'Stress weakening physical health' },
    { title: 'Decision Fatigue', description: 'Cognitive overload hindering choices' },
    { title: 'Low Efficiency', description: 'Diminished output despite longer hours' },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Pain Points */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
              The Modern Workforce<br />Is Under Pressure
            </h2>
            <div className="space-y-4">
              {painPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">{point.title}</h3>
                    <p className="text-sm text-slate-600">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Clarity/Transformation (Dummy Visual) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <CheckCircle2 className="h-24 w-24 text-green-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Visual: Stress → Clarity Transformation</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 3: ORGANIZATIONAL OUTCOMES ====================
const OrganizationalOutcomes = ({ outcomes }: { outcomes: typeof organizationalOutcomes; }) => {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            What Will Your Organization Gain?
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {outcomes.map((outcome, i) => {
            const Icon = outcome.icon;
            return (
              <motion.div
                key={outcome.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-2 border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-slate-700" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2 text-slate-900">{outcome.title}</h3>
                    <p className="text-sm text-slate-600">{outcome.benefit}</p>
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

// ==================== SECTION 4: PROGRAM PHILOSOPHY ====================
const ProgramPhilosophy = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
              An Integrated Yoga System for<br />High-Performance Teams
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
              Our integrated Yoga programs deepen self-awareness and centeredness while enhancing flexibility, strength, and mental balance.
            </p>
          </motion.div>

          {/* System Diagram (Visual Representation) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {['Physical Strength', 'Mental Balance', 'Emotional Intelligence'].map((item, i) => (
              <Card key={i} className="border-2 border-slate-200 text-center">
                <CardContent className="p-6">
                  <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 mb-4 flex items-center justify-center">
                    <Check className="h-8 w-8 text-slate-700" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900">{item}</h3>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 5: PROFESSIONAL TESTIMONIALS ====================
const ProfessionalTestimonials = ({ testimonials }: { testimonials: Testimonial[]; }) => {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Real Results from Working Professionals
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-2 border-slate-200 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-slate-400 mb-4" />
                  <blockquote className="text-slate-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.photo} />
                      <AvatarFallback className="bg-slate-100 text-slate-700">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.title}</p>
                      <p className="text-xs text-slate-500">{testimonial.company}</p>
                    </div>
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

// ==================== SECTION 6: CORE PROGRAM MODULES ====================
const CoreProgramModules = () => {
  const modules = [
    {
      title: 'Strength & Poise',
      subtitle: 'Asanas',
      description: 'Physical postures that enhance flexibility, strength, and body awareness',
      flow: '1',
    },
    {
      title: 'Energy',
      subtitle: 'Pranayama',
      description: 'Breathing techniques that regulate energy and improve focus',
      flow: '2',
    },
    {
      title: 'Deep Rest',
      subtitle: 'Meditation & Relaxation',
      description: 'Practices for mental restoration and stress relief',
      flow: '3',
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Invest in the Minds to Drive Transformation
          </h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {modules.map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-2 border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-slate-900 text-white">{module.flow}</Badge>
                      <h3 className="font-semibold text-lg text-slate-900">{module.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-2">{module.subtitle}</p>
                    <p className="text-sm text-slate-600">{module.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 7: TRUST & CREDIBILITY ====================
const TrustCredibility = ({ organizations }: { organizations: string[]; }) => {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Trusted by Organizations That Matter
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {organizations.map((org, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-2 border-slate-200 hover:border-slate-400 transition-all bg-slate-50">
                <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-600">{org}</p>
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

// ==================== SECTION 8: CORPORATE PROGRAM OFFERINGS ====================
const CorporateOfferings = ({ offerings }: { offerings: CorporateOffering[]; }) => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Corporate Program Offerings
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {offerings.map((offering, i) => (
            <motion.div
              key={offering.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-2 border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-2 text-slate-900">{offering.title}</h3>
                  <p className="font-medium text-slate-700 mb-3">{offering.headline}</p>
                  <p className="text-sm text-slate-600 mb-4">{offering.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-4">{offering.outcome}</p>
                    <Button variant="outline" className="w-full">
                      Know More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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

// ==================== SECTION 9: EXECUTIVE TESTIMONIALS ====================
const ExecutiveTestimonials = ({ testimonials }: { testimonials: Testimonial[]; }) => {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Leadership Endorsements
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-2 border-slate-200">
                <CardContent className="p-8">
                  <Quote className="h-10 w-10 text-slate-400 mb-4" />
                  <blockquote className="text-lg text-slate-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.title}</p>
                    </div>
                    <Badge className="bg-slate-900 text-white">
                      {testimonial.company}
                    </Badge>
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

// ==================== SECTION 10: ENGAGEMENT MODELS ====================
const EngagementModels = ({ models }: { models: EngagementModel[]; }) => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            We Adapt to Your Organization's Needs
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-2 border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-2xl mb-4 text-slate-900">{model.name}</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{model.sessions}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{model.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>{model.capacity}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{model.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== SECTION 11: FOUNDER AUTHORITY ====================
const FounderAuthority = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 opacity-10">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 container">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Leadership in Wellness & Performance
            </h2>
            <p className="text-xl md:text-2xl text-slate-200 mb-8 leading-relaxed">
              Founded by internationally recognized leaders in wellness and organizational development,
              our programs combine ancient wisdom with modern performance science.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white/10"
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

// ==================== SECTION 12: UPCOMING PROGRAMS ====================
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
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Upcoming Corporate Programs
          </h2>
        </motion.div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
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
        </div>

        {/* Programs Table */}
        {programs.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-900">Date</TableHead>
                    <TableHead className="font-semibold text-slate-900">Location</TableHead>
                    <TableHead className="font-semibold text-slate-900">Language</TableHead>
                    <TableHead className="font-semibold text-slate-900">Duration</TableHead>
                    <TableHead className="font-semibold text-slate-900">Availability</TableHead>
                    <TableHead className="font-semibold text-slate-900"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{program.date}</TableCell>
                      <TableCell>{program.location}</TableCell>
                      <TableCell><Badge variant="secondary">{program.language}</Badge></TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>{program.spots} spots</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={onRegister}>Register</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">No programs found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ==================== SECTION 13: FAQ ====================
const FAQSection = ({ faqs }: { faqs: FAQ[] }) => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-2 border-slate-200 rounded-lg px-4 bg-white">
                <AccordionTrigger className="text-left font-semibold hover:no-underline text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-700 leading-relaxed">
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

// ==================== SECTION 14: ADVANCED FEATURES ====================
const AdvancedFeatures = ({
  stressLevel,
  onStressChange,
}: {
  stressLevel: number;
  onStressChange: (value: number) => void;
}) => {
  const productivityGain = Math.round((100 - stressLevel) * 0.5);

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            Tools for Decision Makers
          </h2>
        </motion.div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* ROI Estimator */}
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-slate-700" />
                <h3 className="font-semibold text-xl text-slate-900">ROI Estimator</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Estimate productivity gains based on stress reduction
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-700">Current Stress Level</span>
                    <span className="font-semibold text-slate-900">{stressLevel}%</span>
                  </div>
                  <Slider
                    value={[stressLevel]}
                    onValueChange={(value) => onStressChange(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Estimated Productivity Gain</span>
                    <span className="text-2xl font-bold text-green-600">+{productivityGain}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HR Dashboard Preview */}
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-slate-700" />
                <h3 className="font-semibold text-xl text-slate-900">HR Dashboard Preview</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Track engagement, participation, and wellness metrics
              </p>
              <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center">
                <p className="text-slate-500 text-sm">Dashboard preview (dummy)</p>
              </div>
            </CardContent>
          </Card>

          {/* Corporate Brochure */}
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-slate-700" />
                <h3 className="font-semibold text-xl text-slate-900">Corporate Brochure</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Download detailed information for stakeholders
              </p>
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          {/* Lead Capture */}
          <Card className="border-2 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-slate-700" />
                <h3 className="font-semibold text-xl text-slate-900">Request Proposal</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Get a customized proposal for your organization
              </p>
              <Button className="w-full">
                Contact HR Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CorporateProgram;
