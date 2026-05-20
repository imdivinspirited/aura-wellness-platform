/**
 * Utkarsha Yoga Program Page
 *
 * Complete program page for children aged 8-13.
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
import { utkarshaYogaData } from './data';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const UtkarshaYogaPage = () => {
  const handleRegister = () => {
    window.open(utkarshaYogaData.registrationUrl || 'https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <ProgramHero data={utkarshaYogaData} onRegister={handleRegister} />

      {/* Benefits Section */}
      <ProgramBenefits
        benefits={utkarshaYogaData.benefits}
        title="What Will I Get from This Program?"
      />

      {/* What is Utkarsha Yoga */}
      {utkarshaYogaData.whatIsProgram && (
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
                {utkarshaYogaData.whatIsProgram.title}
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
                    {utkarshaYogaData.whatIsProgram.content.split('\n\n').map((paragraph, i) => (
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

      {/* Who is it for */}
      {utkarshaYogaData.whoIsItFor && (
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
                {utkarshaYogaData.whoIsItFor.title}
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
                    {utkarshaYogaData.whoIsItFor.content}
                  </p>
                  {utkarshaYogaData.whoIsItFor.eligibility && (
                    <ul className="space-y-3">
                      {utkarshaYogaData.whoIsItFor.eligibility.map((item, i) => (
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

      {/* Core Practices */}
      {utkarshaYogaData.corePractices && (
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
                {utkarshaYogaData.corePractices.title}
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {utkarshaYogaData.corePractices.practices.map((practice, i) => (
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

      {/* Testimonials */}
      <ProgramTestimonials testimonials={utkarshaYogaData.testimonials} />

      {/* Founder Section */}
      <ProgramFounder founder={utkarshaYogaData.founder} />

      {/* Upcoming Programs */}
      <ProgramUpcoming
        programs={utkarshaYogaData.upcomingPrograms}
        onRegister={handleRegister}
      />

      {/* FAQs */}
      <ProgramFAQs faqs={utkarshaYogaData.faqs} />

      {/* Final CTA */}
      <ProgramCTA
        onRegister={handleRegister}
        title="Ready to Empower Your Child?"
        subtitle="Give your child the gift of yoga, focus, and joy through Utkarsha Yoga"
      />
    </MainLayout>
  );
};

export default UtkarshaYogaPage;
