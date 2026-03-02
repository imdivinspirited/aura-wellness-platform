/**
 * Hatha Yoga Sadhana Program Page
 */

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProgramHero } from '../../shared/components/ProgramHero';
import { ProgramBenefits } from '../../shared/components/ProgramBenefits';
import { ProgramTestimonials } from '../../shared/components/ProgramTestimonials';
import { ProgramFounder } from '../../shared/components/ProgramFounder';
import { ProgramUpcoming } from '../../shared/components/ProgramUpcoming';
import { ProgramFAQs } from '../../shared/components/ProgramFAQs';
import { ProgramCTA } from '../../shared/components/ProgramCTA';
import { hathaYogaData } from './data';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const HathaYogaPage = () => {
  const handleRegister = () => {
    window.open(hathaYogaData.registrationUrl || 'https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <ProgramHero data={hathaYogaData} onRegister={handleRegister} />
      <ProgramBenefits benefits={hathaYogaData.benefits} title="What Will I Get from This Program?" />

      {hathaYogaData.whatIsProgram && (
        <section className="py-24 bg-white" aria-labelledby="what-is-program-heading">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12"
            >
              <h2
                id="what-is-program-heading"
                className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
              >
                {hathaYogaData.whatIsProgram.title}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card className="border-stone-200 shadow-sm">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-stone max-w-none">
                    {hathaYogaData.whatIsProgram.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-stone-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {hathaYogaData.whoIsItFor && (
        <section className="py-24 bg-stone-50/30" aria-labelledby="who-is-it-for-heading">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12"
            >
              <h2
                id="who-is-it-for-heading"
                className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
              >
                {hathaYogaData.whoIsItFor.title}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card className="border-stone-200 shadow-sm">
                <CardContent className="p-8 md:p-12">
                  <p className="text-stone-700 leading-relaxed mb-6">
                    {hathaYogaData.whoIsItFor.content}
                  </p>
                  {hathaYogaData.whoIsItFor.eligibility && (
                    <ul className="space-y-3">
                      {hathaYogaData.whoIsItFor.eligibility.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-stone-700">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {hathaYogaData.corePractices && (
        <section className="py-24 bg-white" aria-labelledby="core-practices-heading">
          <div className="container max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12"
            >
              <h2
                id="core-practices-heading"
                className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
              >
                {hathaYogaData.corePractices.title}
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hathaYogaData.corePractices.practices.map((practice, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white transition-all">
                    <CardContent className="p-6">
                      <h3 className="font-display text-xl font-light mb-3 text-stone-900">
                        {practice.title}
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {practice.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProgramTestimonials testimonials={hathaYogaData.testimonials} />
      <ProgramFounder founder={hathaYogaData.founder} />
      <ProgramUpcoming programs={hathaYogaData.upcomingPrograms} onRegister={handleRegister} />
      <ProgramFAQs faqs={hathaYogaData.faqs} />
      <ProgramCTA
        onRegister={handleRegister}
        title="Ready for Traditional Hatha Yoga?"
        subtitle="Experience the depth and power of classical Hatha Yoga practice"
      />
    </MainLayout>
  );
};

export default HathaYogaPage;
