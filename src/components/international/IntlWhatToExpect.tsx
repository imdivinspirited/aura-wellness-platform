import { motion } from 'framer-motion';
import { Sun, Moon, Shirt, Smartphone, BookOpen } from 'lucide-react';

const schedule = [
  { time: '5:30 AM', activity: 'Wake Up & Morning Practices', icon: Sun },
  { time: '6:30 AM', activity: 'Yoga & Pranayama', icon: Sun },
  { time: '7:30 AM', activity: 'Breakfast', icon: Sun },
  { time: '9:00 AM', activity: 'Program Session / Free Time', icon: BookOpen },
  { time: '12:30 PM', activity: 'Lunch', icon: Sun },
  { time: '2:00 PM', activity: 'Afternoon Session / Rest', icon: BookOpen },
  { time: '5:00 PM', activity: 'Evening Meditation', icon: Moon },
  { time: '7:00 PM', activity: 'Dinner', icon: Moon },
  { time: '8:00 PM', activity: 'Satsang (Gathering with Music)', icon: Moon },
  { time: '10:00 PM', activity: 'Lights Out', icon: Moon },
];

const guidelines = [
  { icon: Shirt, title: 'Dress Code', items: ['Modest, comfortable clothing', 'White preferred during programs', 'Shoes off in meditation halls', 'Cover shoulders and knees'] },
  { icon: Smartphone, title: 'Digital Detox', items: ['Limited phone use encouraged', 'No phones in meditation halls', 'Wi-Fi available in common areas', 'Silence zones clearly marked'] },
];

export function IntlWhatToExpect() {
  return (
    <section className="py-20 bg-card">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">What to Expect</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            A Typical Day at the Ashram
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A gentle rhythm that helps you disconnect from stress and reconnect with yourself
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Daily Schedule */}
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold mb-6">Daily Schedule</h3>
            <div className="space-y-3">
              {schedule.map((item, i) => (
                <motion.div
                  key={item.time}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-background transition-colors"
                >
                  <span className="text-sm font-mono text-primary w-16 flex-shrink-0">{item.time}</span>
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm">{item.activity}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="flex-1 space-y-8">
            {guidelines.map((g) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <g.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{g.title}</h3>
                </div>
                <ul className="space-y-2 ml-13">
                  {g.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">•</span> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Packing List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-primary/5 border border-primary/10"
            >
              <h4 className="font-semibold mb-3">🧳 Quick Packing List</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {['Comfortable white clothes', 'Sunscreen & hat', 'Light jacket (mornings)', 'Water bottle', 'Meditation cushion (optional)', 'Universal power adapter', 'Mosquito repellent', 'Journal & pen'].map((item) => (
                  <span key={item} className="flex items-center gap-1">☐ {item}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
