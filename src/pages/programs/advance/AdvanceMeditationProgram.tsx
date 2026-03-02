'use client';
import MainLayout from '@/components/layout/MainLayout';
import { Activity, BatteryCharging, Brain, CheckCircle, Leaf, Quote, Sparkles } from 'lucide-react';
import React from 'react';

/* ================= ASSETS ================= */

const IMAGES = {
  hero: '/assets/images/advance-program/hero-amp-bg.jpg',

  benefits: {
    meditation: '/assets/images/advance-program/benefit-meditation.jpg',
    silence: '/assets/images/advance-program/benefit-silence.jpg',
    pranayama: '/assets/images/advance-program/benefit-pranayama.jpg',
    yoga: '/assets/images/advance-program/benefit-yoga.jpg',
    stress: '/assets/images/advance-program/benefit-stress.jpg',
    energy: '/assets/images/advance-program/benefit-energy.jpg',
  },

  programs: {
    fourDay: '/assets/images/advance-program/program-4-day.jpg',
    fiveDay: '/assets/images/advance-program/program-5-day.jpg',
    sevenDay: '/assets/images/advance-program/program-7-day.jpg',
    tenDay: '/assets/images/advance-program/program-10-day.jpg',
    busyBee: '/assets/images/advance-program/program-busy-bee.jpg',
  },

  founder: '/assets/images/advance-program/founder-gurudev.jpg',
};

/* ================= DATA ================= */

const benefits = [
  {
    icon: Brain,
    title: 'Experience Deep Meditations',
    desc: 'Guided “Hollow and Empty” meditations by Gurudev help you settle into profound rest.',
    image: IMAGES.benefits.meditation,
  },
  {
    icon: Sparkles,
    title: 'Explore the Depth of Silence',
    desc: 'Move beyond the restless mind and experience deep tranquility and renewed vitality.',
    image: IMAGES.benefits.silence,
  },
  {
    icon: Leaf,
    title: 'Mudras & Pranayama',
    desc: 'Simple yet powerful techniques to balance emotions and calm the mind.',
    image: IMAGES.benefits.pranayama,
  },
  {
    icon: Sparkles,
    title: 'Yoga & Wisdom',
    desc: 'Explore timeless wisdom that expands perception and understanding of life.',
    image: IMAGES.benefits.yoga,
  },
  {
    icon: Activity,
    title: 'Relief from Emotional Stress',
    desc: 'Release stored impressions and reconnect with a rejuvenated self.',
    image: IMAGES.benefits.stress,
  },
  {
    icon: BatteryCharging,
    title: 'High Energy Levels',
    desc: 'Increase prana to feel energized, positive, and focused.',
    image: IMAGES.benefits.energy,
  },
];

const programs = [
  {
    title: '4-Day Residential Program',
    desc: 'A short yet powerful immersive experience designed for deep rest.',
    image: IMAGES.programs.fourDay,
  },
  {
    title: '5-Day Advanced Meditation Program',
    desc: 'A complete mental and physical vacation in a serene environment.',
    image: IMAGES.programs.fiveDay,
  },
  {
    title: '7-Day Advanced Meditation Program',
    desc: 'Give one week to yourself and return refreshed and balanced.',
    image: IMAGES.programs.sevenDay,
  },
  {
    title: '10-Day Silence Program',
    desc: 'A transformational journey from outer chaos to inner serenity.',
    image: IMAGES.programs.tenDay,
  },
  {
    title: 'Busy-Bee AMP',
    desc: 'Weekend format (Fri–Mon) for busy professionals.',
    image: IMAGES.programs.busyBee,
  },
];

const testimonials = [
  {
    name: 'Sulakshana D',
    role: 'Counselor',
    quote:
      'After AMP, I experienced a complete transformation in my behavior and emotional balance.',
  },
  {
    name: 'Sreyoshi Sur',
    role: 'Electrical Power System Designer',
    quote: 'The deep meditations healed my insomnia and brought clarity and peace.',
  },
  {
    name: 'Suraj Duseja',
    role: 'Writer',
    quote: 'I returned creative, calm, and joyful after the advanced program.',
  },
];

/* ================= COMPONENT ================= */

const AdvanceMeditationProgram: React.FC = () => {
  const handleRegister = () => {
    window.location.href = 'https://programs.vvmvp.org/';
  };

  return (
    <MainLayout>
      <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
        {/* ================= HERO ================= */}
        <section className="relative min-h-[90vh] flex items-center justify-center">
          <img
            src={IMAGES.hero}
            alt="Advanced Meditation Program"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/80 dark:bg-black/60" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center py-32">
            <h1 className="text-4xl md:text-6xl font-bold">Advanced Meditation Program</h1>
            <p className="mt-6 text-lg md:text-xl text-neutral-700 dark:text-neutral-300">
              Deep rest leads to dynamic action.
            </p>
            <p className="mt-4 text-sm uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Profound Silence • Deep Meditations • Increased Energy
            </p>

            <button
              onClick={handleRegister}
              className="mt-10 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg"
            >
              Sign me up
            </button>
          </div>
        </section>

        {/* ================= BENEFITS ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
            What will I get from this program?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border dark:border-neutral-800 shadow-sm hover:shadow-xl transition"
              >
                <img src={b.image} alt={b.title} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <b.icon className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= PROGRAM FORMATS ================= */}
        <section className="bg-neutral-50 dark:bg-neutral-900 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
              Program Formats
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {programs.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 border dark:border-neutral-800"
                >
                  <img src={p.image} alt={p.title} className="h-44 w-full object-cover" />
                  <div className="p-6">
                    <CheckCircle className="w-7 h-7 text-amber-500 mb-3" />
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16">
            Transformational Experiences
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-neutral-50 dark:bg-neutral-900 border dark:border-neutral-800"
              >
                <Quote className="w-8 h-8 text-amber-500 mb-4" />
                <p className="italic text-neutral-700 dark:text-neutral-300 mb-4">“{t.quote}”</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-neutral-500">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FOUNDER ================= */}
        <section className="bg-neutral-100 dark:bg-neutral-900 py-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <img
              src={IMAGES.founder}
              alt="Gurudev Sri Sri Ravi Shankar"
              className="mx-auto h-40 w-40 rounded-full object-cover mb-6"
            />
            <h2 className="text-3xl font-semibold mb-4">Gurudev Sri Sri Ravi Shankar</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Global humanitarian and spiritual leader spearheading a worldwide movement for a
              stress-free society.
            </p>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Ready to begin your inner journey?
          </h2>
          <button
            onClick={handleRegister}
            className="px-12 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg"
          >
            Ok got it, sign me up!
          </button>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="bg-neutral-950 text-neutral-400 py-10 text-center text-sm">
          © 2026 Art of Living International Center • Privacy • Terms
        </footer>
      </div>
    </MainLayout>
  );
};

export default AdvanceMeditationProgram;
