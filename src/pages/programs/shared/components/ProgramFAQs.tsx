/**
 * Shared Program FAQs Component
 *
 * Reusable FAQs accordion for all program pages.
 */

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { FAQ } from '../types';

interface ProgramFAQsProps {
  faqs: FAQ[];
  title?: string;
}

export const ProgramFAQs = ({ faqs, title = 'Frequently Asked Questions' }: ProgramFAQsProps) => {
  if (faqs.length === 0) return null;

  return (
    <section className="py-24 bg-white" aria-labelledby="faqs-heading">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2
            id="faqs-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
          >
            {title}
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
            >
              <AccordionItem value={faq.id} className="border-stone-200">
                <AccordionTrigger className="text-left font-light text-stone-900 hover:text-stone-700">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-stone-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
