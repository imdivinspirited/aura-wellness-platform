import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const stories = [
  {
    name: 'Sarah M.',
    country: '🇺🇸 USA',
    before: 'Burnt out tech executive struggling with chronic anxiety and insomnia for 3 years.',
    after: 'Sleeping naturally, off medication, leading with calm. Promoted to VP within 6 months.',
    program: 'Silence Retreat + Happiness Program',
  },
  {
    name: 'Thomas K.',
    country: '🇩🇪 Germany',
    before: 'Skeptical engineer who hadn\'t taken a real break in 5 years. Constant back pain.',
    after: 'Pain-free for the first time in years. Now meditates daily and leads mindfulness at his company.',
    program: 'Sri Sri Yoga + Sudarshan Kriya',
  },
  {
    name: 'Emily W.',
    country: '🇦🇺 Australia',
    before: 'University student overwhelmed by exam stress, social anxiety, and self-doubt.',
    after: 'Graduated with honors. Founded a campus meditation club. Feels genuinely happy.',
    program: 'Happiness Program',
  },
];

export function IntlTransformation() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Real Stories</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Before & After Transformation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from international visitors whose lives changed at the ashram
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group"
            >
              <div className="rounded-2xl border bg-background p-6 space-y-6 h-full hover:shadow-elevated transition-shadow duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary text-lg">
                    {story.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm text-muted-foreground">{story.country}</p>
                  </div>
                </div>

                {/* Before */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-destructive">Before</span>
                    <div className="h-px flex-1 bg-destructive/20" />
                  </div>
                  <p className="text-sm text-muted-foreground">{story.before}</p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                </div>

                {/* After */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">After</span>
                    <div className="h-px flex-1 bg-secondary/20" />
                  </div>
                  <p className="text-sm text-foreground font-medium">{story.after}</p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Program: <span className="font-medium text-primary">{story.program}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
