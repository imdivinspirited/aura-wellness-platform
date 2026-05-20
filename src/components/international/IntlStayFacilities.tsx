import { motion } from 'framer-motion';
import { Wifi, Wind, Droplets, Shield, Utensils, Leaf } from 'lucide-react';

const amenities = [
  { icon: Wifi, label: 'Free Wi-Fi' },
  { icon: Wind, label: 'AC Available' },
  { icon: Droplets, label: 'Hot Water 24/7' },
  { icon: Shield, label: '24/7 Security' },
  { icon: Utensils, label: '3 Meals Included' },
  { icon: Leaf, label: 'Organic Garden' },
];

const rooms = [
  {
    type: 'Premium Suite',
    price: 'From $80/night',
    features: ['Private room', 'AC', 'Attached bathroom', 'Garden view'],
    image: '/images/stay/intl_accommodation.jpg',
  },
  {
    type: 'Standard Room',
    price: 'From $40/night',
    features: ['Shared room (2-4)', 'AC', 'Clean shared bathroom', 'Comfortable beds'],
    image: '/images/stay/intl_accommodation.jpg',
  },
  {
    type: 'Dormitory',
    price: 'From $15/night',
    features: ['6-bed dorm', 'Fan-cooled', 'Shared facilities', 'Community atmosphere'],
    image: '/images/stay/intl_accommodation.jpg',
  },
];

export function IntlStayFacilities() {
  return (
    <section className="py-20 bg-card">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Your Stay</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Comfortable & Clean Accommodation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Honest expectations: simple, clean, and peaceful. Think wellness retreat, not luxury hotel.
          </p>
        </motion.div>

        {/* Amenities */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
          {amenities.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border"
            >
              <a.icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-center">{a.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Room options */}
        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room, i) => (
            <motion.div
              key={room.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-background overflow-hidden hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={room.image}
                  alt={room.type}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={800}
                  height={600}
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{room.type}</h3>
                  <span className="text-primary font-semibold text-sm">{room.price}</span>
                </div>
                <ul className="space-y-1">
                  {room.features.map((f) => (
                    <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
