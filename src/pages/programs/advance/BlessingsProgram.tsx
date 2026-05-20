import MainLayout from '@/components/layout/MainLayout';
import { BookOpen, CalendarDays, Quote, Sparkles } from 'lucide-react';
import React from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { SmartLink } from '@/components/ui/SmartLink';

/* ===========================
   ASSETS (FUTURE-PROOF)
   =========================== */
/**
 * 👉 Future me sirf yahan image change karni hogi
 * 👉 Assets folder ke andar images replace karo
 */
const images = {
  hero: '/assets/programs/blessings/blessings-hero.jpg',
  meditation: '/assets/programs/blessings/blessings-meditation.jpg',
  knowledge: '/assets/programs/blessings/blessings-knowledge.jpg',
  testimonial: '/assets/programs/blessings/blessings-testimonial.jpg',
};

/* ===========================
   DATA (CLEAN + SCALABLE)
   =========================== */

const contents = [
  {
    icon: Sparkles,
    title: 'Meditation & Advanced Processes',
    desc: `Distinct meditative processes cultivating gratitude, fulfillment,
    and deep inner silence for profound transformation.`,
  },
  {
    icon: BookOpen,
    title: 'Knowledge Sessions',
    desc: `Ancient wisdom through short videos and group discussions
    guiding one towards a fulfilled and meaningful life.`,
  },
];

const testimonials = [
  {
    name: 'Gayathri U.',
    role: 'Resource Manager',
    quote: 'This was one of the most beautiful gifts I have received in my life.',
  },
];

/* ===========================
   COMPONENT
   =========================== */

const BlessingsProgram: React.FC = () => {
  return (
    <MainLayout>
      <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <SafeImage
            category="programs"
            src={images.hero}
            alt="Blessings Program Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-25"
          />
          <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              The Blessings Program
            </h1>

            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-neutral-600 dark:text-neutral-300">
              Blossom as an instrument of the divine. The blessings that you offer can change a
              person’s life.
            </p>

            <p className="mt-4 text-sm uppercase tracking-widest text-amber-600 dark:text-amber-400">
              3-Day Residential Program • Contribution supports social projects
            </p>

            <SmartLink
              to="https://programs.vvmvp.org/"
              className="inline-block mt-10 px-10 py-4 rounded-full
              bg-amber-500 hover:bg-amber-600 text-black font-semibold transition"
            >
              Register Now
            </SmartLink>
          </div>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-14">
            The Blessings Program Content
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {contents.map((item, i) => (
              <div
                key={i}
                className="rounded-3xl p-8 bg-neutral-50 dark:bg-white/5
                border border-neutral-200 dark:border-white/10
                hover:shadow-xl transition"
              >
                <item.icon className="w-12 h-12 text-amber-500 mb-6" />
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className="bg-neutral-50 dark:bg-neutral-900/60 py-24">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-6">What is the Blessings Program?</h2>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Fulfillment is a beautiful quality of consciousness and allows one to bless. The
                Blessings Program offers an experience of abundance, contentment, and inner
                fulfillment through unique meditative processes.
                <br />
                <br />
                Being able to bless is an expression of compassion, care, and service — bringing
                peace and harmony to both the giver and the receiver.
              </p>
            </div>

            <SafeImage
              category="programs"
              src={images.meditation}
              alt="Blessings Meditation"
              className="rounded-3xl shadow-xl"
              loading="lazy"
            />
          </div>
        </section>

        {/* ================= TESTIMONIAL ================= */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <Quote className="w-12 h-12 mx-auto text-amber-500 mb-6" />
          {testimonials.map((t, i) => (
            <div key={i}>
              <p className="text-xl italic text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto">
                “{t.quote}”
              </p>
              <p className="mt-6 font-semibold">{t.name}</p>
              <p className="text-sm text-neutral-500">{t.role}</p>
            </div>
          ))}
        </section>

        {/* ================= FOUNDER ================= */}
        <section className="bg-neutral-100 dark:bg-neutral-900 py-24">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-semibold mb-6">Gurudev Sri Sri Ravi Shankar</h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Global humanitarian, spiritual leader and ambassador of peace, bringing yoga,
              meditation, and wisdom to millions worldwide.
            </p>

            <button
              className="mt-8 px-8 py-3 rounded-full
              border border-amber-500 text-amber-500
              hover:bg-amber-500 hover:text-black transition"
            >
              Learn More
            </button>
          </div>
        </section>

        {/* ================= UPCOMING CTA ================= */}
        <section className="py-24 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-amber-500 mb-6" />
          <h2 className="text-3xl font-semibold mb-4">View Upcoming Blessings Programs</h2>

          <SmartLink
            to="https://programs.vvmvp.org/"
            className="inline-block mt-6 px-10 py-4 rounded-full
            bg-amber-500 hover:bg-amber-600 text-black font-semibold transition"
          >
            View All Programs
          </SmartLink>
        </section>
      </div>
    </MainLayout>
  );
};

export default BlessingsProgram;
