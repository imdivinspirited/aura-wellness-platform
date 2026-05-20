import MainLayout from '@/components/layout/MainLayout';
import { CheckCircle, Flame, Quote, Shield, Target, TrendingUp, Users } from 'lucide-react';
import React from 'react';

/* ================= ASSETS ================= */

const IMAGES = {
  hero: '/assets/images/dsn/hero-dsn.jpg',

  features: {
    fear: '/assets/images/dsn/feature-fear.jpg',
    society: '/assets/images/dsn/feature-society.jpg',
    potential: '/assets/images/dsn/feature-potential.jpg',
  },

  elements: {
    group: '/assets/images/dsn/element-group.jpg',
    padmasadhana: '/assets/images/dsn/element-padmasadhana.jpg',
    knowledge: '/assets/images/dsn/element-knowledge.jpg',
    strengths: '/assets/images/dsn/element-strengths.jpg',
  },

  founder: '/assets/images/dsn/founder-gurudev.jpg',
};

/* ================= DATA ================= */

const features = [
  {
    icon: Shield,
    title: 'Overcome Fears',
    desc: 'Discover the freedom of breaking inner fears and mental barriers.',
    image: IMAGES.features.fear,
  },
  {
    icon: Users,
    title: 'Make a Difference',
    desc: 'Explore how YOU can actively contribute to positive change in society.',
    image: IMAGES.features.society,
  },
  {
    icon: TrendingUp,
    title: 'Realize Your Potential',
    desc: 'Break limiting beliefs and access your true inner strength.',
    image: IMAGES.features.potential,
  },
];

const elements = [
  {
    icon: Users,
    title: 'Group Activities & Tasks',
    desc: 'Experiential group processes to understand reactions, habits, and fears.',
    image: IMAGES.elements.group,
  },
  {
    icon: Flame,
    title: 'Padmasadhana',
    desc: 'A powerful 45-minute yogic sequence for strength, stability, and meditation.',
    image: IMAGES.elements.padmasadhana,
  },
  {
    icon: Target,
    title: 'Knowledge Sessions',
    desc: 'Wisdom sessions that open new perspectives and guide better living.',
    image: IMAGES.elements.knowledge,
  },
  {
    icon: CheckCircle,
    title: 'Focus on Strengths',
    desc: 'Identify strengths and use them meaningfully in society.',
    image: IMAGES.elements.strengths,
  },
];

const testimonials = [
  {
    name: 'Salivati',
    role: 'DSN Graduate, Dubai',
    quote:
      'This program helped me cross my mental barriers and realize that even one person can make a difference.',
  },
  {
    name: 'Saatchi Bali',
    role: 'DSN Graduate, Sydney',
    quote: 'One of the most beautiful and motivating experiences of my life.',
  },
  {
    name: 'Himanshu Kathi',
    role: 'DSN Graduate, India',
    quote: 'It helped me become a new version of myself with clarity and confidence.',
  },
];

/* ================= COMPONENT ================= */

const DynamismForSelfNation: React.FC = () => {
  const handleRegister = () => {
    window.location.href = 'https://programs.vvmvp.org/';
  };

  return (
    <MainLayout>
      <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
        {/* ================= HERO ================= */}
        <section className="relative min-h-[85vh] flex items-center">
          <img
            src={IMAGES.hero}
            alt="Dynamism for Self & Nation"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-black/80 dark:via-black/60" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Dynamism for Self & Nation (DSN)
            </h1>
            <p className="mt-6 text-lg md:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl">
              Experience freedom from personal inhibitions and access inner strength and stability.
            </p>

            <p className="mt-4 text-sm uppercase tracking-widest text-red-600 dark:text-red-400">
              Break your barriers • Overcome fears • Access inner power
            </p>

            <button
              onClick={handleRegister}
              className="mt-10 px-10 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
            >
              Sign me up
            </button>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
            Experience the limitless possibilities of your mind
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 border dark:border-neutral-800 hover:shadow-xl transition"
              >
                <img src={f.image} alt={f.title} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <f.icon className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= WHY DSN ================= */}
        <section className="bg-neutral-100 dark:bg-neutral-900 py-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-8">
              Why take part in a DSN Program?
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              DSN is a rigorous and transformational program designed to help you break through
              personal inhibitions, old habits, and limitations. It empowers you to access inner
              stability, confidence, and the courage to contribute meaningfully to society.
            </p>
          </div>
        </section>

        {/* ================= MAIN ELEMENTS ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
            Main Elements of DSN
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {elements.map((e, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-6 bg-white dark:bg-neutral-950 border dark:border-neutral-800 rounded-2xl overflow-hidden"
              >
                <img src={e.image} alt={e.title} className="w-full md:w-48 h-48 object-cover" />
                <div className="p-6">
                  <e.icon className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">{e.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="bg-neutral-50 dark:bg-neutral-900 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
              Transformational Stories
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 bg-white dark:bg-neutral-950 border dark:border-neutral-800"
                >
                  <Quote className="w-8 h-8 text-red-600 mb-4" />
                  <p className="italic mb-4 text-neutral-700 dark:text-neutral-300">“{t.quote}”</p>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-neutral-500">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FOUNDER ================= */}
        <section className="py-24 text-center">
          <img
            src={IMAGES.founder}
            alt="Gurudev Sri Sri Ravi Shankar"
            className="mx-auto h-40 w-40 rounded-full object-cover mb-6"
          />
          <h2 className="text-3xl font-semibold mb-4">Gurudev Sri Sri Ravi Shankar</h2>
          <p className="max-w-3xl mx-auto text-neutral-600 dark:text-neutral-400">
            Global humanitarian and spiritual leader spearheading a worldwide movement for a
            stress-free, violence-free society.
          </p>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-24 text-center bg-red-600 text-white">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">Ready to break your barriers?</h2>
          <button
            onClick={handleRegister}
            className="px-12 py-4 rounded-full bg-white text-red-600 font-semibold hover:bg-neutral-100 transition"
          >
            Register Now
          </button>
        </section>
      </div>
    </MainLayout>
  );
};

export default DynamismForSelfNation;
