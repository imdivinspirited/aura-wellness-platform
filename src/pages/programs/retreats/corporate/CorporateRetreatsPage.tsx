/**
 * Corporate Wellbeing Retreats Page
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
import { corporateRetreatsData } from './data';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const CorporateRetreatsPage = () => {
  const handleRegister = () => {
    window.open(corporateRetreatsData.registrationUrl || 'https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <ProgramHero data={corporateRetreatsData} onRegister={handleRegister} />
      <ProgramBenefits benefits={corporateRetreatsData.benefits} title="What Will Your Team Gain?" />

      {corporateRetreatsData.whatIsProgram && (
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
                {corporateRetreatsData.whatIsProgram.title}
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
                    {corporateRetreatsData.whatIsProgram.content.split('\n\n').map((paragraph, i) => (
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

      {corporateRetreatsData.whoIsItFor && (
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
                {corporateRetreatsData.whoIsItFor.title}
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
                    {corporateRetreatsData.whoIsItFor.content}
                  </p>
                  {corporateRetreatsData.whoIsItFor.eligibility && (
                    <ul className="space-y-3">
                      {corporateRetreatsData.whoIsItFor.eligibility.map((item, i) => (
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

      {corporateRetreatsData.corePractices && (
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
                {corporateRetreatsData.corePractices.title}
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {corporateRetreatsData.corePractices.practices.map((practice, i) => (
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

      <ProgramTestimonials testimonials={corporateRetreatsData.testimonials} />
      <ProgramFounder founder={corporateRetreatsData.founder} />
      <ProgramUpcoming programs={corporateRetreatsData.upcomingPrograms} onRegister={handleRegister} />
      <ProgramFAQs faqs={corporateRetreatsData.faqs} />
      <ProgramCTA
        onRegister={handleRegister}
        title="Ready to Transform Your Workplace?"
        subtitle="Contact us to design a customized corporate wellbeing retreat for your organization"
      />
    </MainLayout>
  );
};

export default CorporateRetreatsPage;
