import { motion } from 'framer-motion';
import { Leaf, Clock, Shield, Heart } from 'lucide-react';

const foodFacts = [
  { icon: Leaf, title: '100% Vegetarian', desc: 'Fresh, organic satvik meals prepared with love. Many visitors say it\'s the best vegetarian food they\'ve ever had.' },
  { icon: Shield, title: 'Hygiene Standards', desc: 'Kitchen inspected regularly. Filtered water throughout campus. Safe for Western stomachs.' },
  { icon: Clock, title: '3 Meals Daily', desc: 'Breakfast (7:30 AM), Lunch (12:30 PM), Dinner (7 PM). Herbal tea available throughout the day.' },
  { icon: Heart, title: 'Dietary Options', desc: 'Gluten-free, vegan, and Jain options available on request. Just let us know when you book.' },
];

export function IntlFoodLifestyle() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="/images/dining/intl_food.jpg"
                alt="Satvik vegetarian meals at the ashram"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Food & Lifestyle</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Nourish Your Body & Soul
            </h2>
            <div className="space-y-4">
              {foodFacts.map((fact) => (
                <div key={fact.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <fact.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{fact.title}</h4>
                    <p className="text-sm text-muted-foreground">{fact.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
