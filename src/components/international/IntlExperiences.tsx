import { motion } from 'framer-motion';
import { ArrowRight, Wind, Brain, Sparkles, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const experiences = [
  {
    title: 'Sudarshan Kriya',
    subtitle: 'The Signature Breathwork',
    description: 'A powerful rhythmic breathing technique practiced by over 500 million people worldwide. Backed by 100+ independent research studies showing reduced stress, better sleep, and enhanced wellbeing.',
    image: '/images/programs/intl_meditation.jpg',
    icon: Wind,
    stats: '100+ Research Studies',
    duration: '3-Day Program',
  },
  {
    title: 'Guided Meditation',
    subtitle: 'Journey Inward',
    description: 'Experience profound guided meditations in the serene ashram environment. From Sahaj Samadhi to advanced practices — find the style that resonates with you.',
    image: '/images/programs/advanced_meditation_hall.jpg',
    icon: Brain,
    stats: '6+ Meditation Styles',
    duration: '1–7 Days',
  },
  {
    title: 'Sri Sri Yoga',
    subtitle: 'Traditional Meets Modern',
    description: 'A holistic approach to yoga that combines postures, breathing, and meditation. Perfect for all levels — from first-timers to advanced practitioners.',
    image: '/images/programs/intl_yoga.jpg',
    icon: Sparkles,
    stats: 'All Levels Welcome',
    duration: '3–5 Days',
  },
  {
    title: 'Silence Retreat',
    subtitle: 'The Ultimate Reset',
    description: 'Disconnect from the noise. A guided silent retreat with deep meditations, gentle yoga, and nature walks. The mental reset you didn\'t know you needed.',
    image: '/images/programs/card_program_silence_retreat.jpg',
    icon: Moon,
    stats: 'Most Popular',
    duration: '3–5 Days',
  },
];

export function IntlExperiences() {
  return (
    <section id="signature-experiences" className="py-20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Signature Experiences</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            What Awaits You
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scientifically validated programs that have transformed millions of lives across 180+ countries
          </p>
        </motion.div>

        <div className="space-y-16">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              {/* Image */}
              <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-foreground/70 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                    <exp.icon className="h-4 w-4" />
                    {exp.stats}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                <span className="text-primary font-medium text-sm">{exp.subtitle}</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold">{exp.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>⏱ {exp.duration}</span>
                </div>
                <Button variant="outline" className="group/btn">
                  Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
