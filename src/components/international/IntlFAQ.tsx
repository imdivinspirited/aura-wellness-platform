import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    title: 'Visa & Travel',
    faqs: [
      { q: 'Do I need a visa to visit India?', a: 'Most nationalities can apply for an e-Visa online (indianvisaonline.gov.in). Tourist e-Visas are typically processed in 3–5 business days. We can provide an invitation letter if needed for your application.' },
      { q: 'How do I get from the airport to the ashram?', a: 'Bangalore airport (BLR) is about 45 minutes from the ashram. You can pre-book our ashram shuttle, use Uber/Ola app, or arrange a prepaid taxi from the airport. We recommend the shuttle for first-time visitors.' },
      { q: 'Is it safe for solo female travelers?', a: 'Absolutely. The ashram has 24/7 security, well-lit pathways, and a large community of international visitors. Many solo female travelers visit us regularly and feel completely safe.' },
    ],
  },
  {
    title: 'Food & Health',
    faqs: [
      { q: 'Is the food safe for Western stomachs?', a: 'Yes! Our kitchen follows strict hygiene standards. All water is filtered. The satvik (vegetarian) diet is actually easier to digest. We recommend avoiding street food outside the ashram for the first few days.' },
      { q: 'What about dietary restrictions?', a: 'We accommodate vegan, gluten-free, and Jain diets. Please mention your needs when booking. The food is 100% vegetarian — no eggs, meat, or fish.' },
      { q: 'Should I bring any medications?', a: 'Bring your regular prescriptions. The ashram has a basic medical center. We recommend a small travel kit with anti-diarrhea medicine, pain relievers, and sunscreen. Our Ayurvedic center also offers natural remedies.' },
    ],
  },
  {
    title: 'Accommodation & Facilities',
    faqs: [
      { q: 'Is there Wi-Fi available?', a: 'Yes, free Wi-Fi is available in common areas and some rooms. However, we encourage a digital detox during your stay for maximum benefit from the programs.' },
      { q: 'What are the rooms like?', a: 'Clean and simple. Options range from dormitories to premium suites with AC and private bathrooms. Think wellness retreat, not luxury hotel. All rooms have clean bedding and are well-maintained.' },
      { q: 'Can I do laundry?', a: 'Yes, laundry services are available on campus at a small fee. Most visitors find doing laundry 1-2 times per week is sufficient.' },
    ],
  },
  {
    title: 'Programs & Schedule',
    faqs: [
      { q: 'Do I need prior meditation experience?', a: 'Not at all! Our beginner programs (like the Happiness Program) are designed specifically for first-timers. Experienced practitioners also find deep value in our advanced offerings.' },
      { q: 'What language are programs conducted in?', a: 'Programs are conducted in English. Some sessions may have translation available. All international programs have English-speaking instructors.' },
      { q: 'Can I leave the ashram during my stay?', a: 'Yes, you\'re free to explore the area. However, during certain programs (especially silence retreats), you\'re expected to stay on campus for the full duration.' },
    ],
  },
];

export function IntlFAQ() {
  const [openCategory, setOpenCategory] = useState(0);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="py-20 bg-card">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Questions Answered</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">Everything international visitors want to know</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat, i) => (
            <button
              key={cat.title}
              onClick={() => setOpenCategory(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === openCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border hover:bg-primary/5'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={openCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {categories[openCategory].faqs.map((faq, i) => {
              const key = `${openCategory}-${i}`;
              const isOpen = openItems[key];
              return (
                <div key={key} className="rounded-xl border bg-background overflow-hidden">
                  <button
                    onClick={() => toggleItem(key)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium pr-4">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
