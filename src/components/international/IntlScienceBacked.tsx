import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Moon, Shield, Smile } from 'lucide-react';

const benefits = [
  { icon: Brain, title: '56% Reduction in Cortisol', desc: 'Stress hormone significantly reduced after Sudarshan Kriya practice', source: 'Journal of Clinical Psychology' },
  { icon: Heart, title: '33% Improvement in PTSD', desc: 'Veterans showed significant improvement in PTSD symptoms', source: 'Journal of Traumatic Stress' },
  { icon: Moon, title: '68% Better Sleep Quality', desc: 'Participants reported dramatically improved sleep within 2 weeks', source: 'International Journal of Yoga' },
  { icon: Smile, title: '73% Reduced Anxiety', desc: 'Clinical anxiety levels dropped significantly after breathwork programs', source: 'Frontiers in Psychiatry' },
  { icon: Zap, title: '2x Increase in Energy', desc: 'Sustained energy improvements lasting months after retreat', source: 'NIMHANS Study, Bangalore' },
  { icon: Shield, title: 'Boosted Immunity', desc: 'Significant increase in immune cell activity observed in practitioners', source: 'PLoS ONE' },
];

export function IntlScienceBacked() {
  return (
    <section className="py-20 bg-card">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Evidence Based</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Science-Backed Benefits
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            100+ independent research studies from Harvard, Yale, and top institutions worldwide
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border bg-background space-y-3 hover:shadow-elevated transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
              <p className="text-xs text-primary font-medium">📄 {b.source}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
