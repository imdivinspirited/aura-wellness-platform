import { motion } from 'framer-motion';
import { Heart, Globe, Users, Leaf, Target, Lightbulb } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Service',
    description: 'Selfless service to humanity through various humanitarian initiatives worldwide.',
  },
  {
    icon: Globe,
    title: 'Global Peace',
    description: 'Creating a violence-free, stress-free society through meditation and breathing.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building a worldwide family united by shared practices and values.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'Environmental initiatives and sustainable practices for a greener planet.',
  },
];

export const MissionSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Our Mission</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Creating a Stress-Free, Violence-Free World
            </h2>
            
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              The Art of Living Foundation is a global humanitarian organization founded by 
              Gurudev Sri Sri Ravi Shankar in 1981. Our programs have helped millions worldwide 
              manage stress, enhance well-being, and realize their full human potential.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Our Vision</span>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              A world where every individual lives in harmony with themselves, with others, 
              and with nature. Through ancient wisdom and modern science, we empower people 
              to live life to its fullest potential.
            </p>
          </motion.div>

          {/* Values Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-background border border-border hover:shadow-soft transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Impact Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: '500M+', label: 'Lives Touched' },
            { value: '180+', label: 'Countries' },
            { value: '40+', label: 'Years of Service' },
            { value: '800K+', label: 'Volunteers' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6"
            >
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                {stat.value}
              </p>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
