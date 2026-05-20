import { motion } from 'framer-motion';
import { Globe, Users, Heart, TreePine, GraduationCap, Droplets } from 'lucide-react';

const impacts = [
  { icon: Users, value: '500M+', label: 'Lives Touched', desc: 'Through programs in 180+ countries' },
  { icon: TreePine, value: '81M+', label: 'Trees Planted', desc: 'Green initiatives worldwide' },
  { icon: Droplets, value: '45K+', label: 'Villages Revived', desc: 'River rejuvenation projects' },
  { icon: Heart, value: '10M+', label: 'Disaster Relief', desc: 'People served in 60+ disasters' },
  { icon: GraduationCap, value: '1000+', label: 'Schools Built', desc: 'Free education for underprivileged' },
  { icon: Globe, value: '180+', label: 'Countries', desc: 'Active presence worldwide' },
];

export function IntlGlobalImpact() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Making a Difference</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">Global Impact</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your visit supports humanitarian projects that change lives worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {impacts.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-6 rounded-2xl border bg-card hover:shadow-elevated transition-shadow"
            >
              <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-display font-bold text-primary mb-1">{item.value}</p>
              <p className="font-semibold text-sm mb-1">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
