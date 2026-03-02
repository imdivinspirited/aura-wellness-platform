/**
 * Intuition Process Program Page
 *
 * Complete program page for Juniors (5-8) and Kids/Teens (8-18).
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
import { intuitionProcessData } from './data';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Eye } from 'lucide-react';

const IntuitionProcessPage = () => {
  const handleRegister = () => {
    window.open(intuitionProcessData.registrationUrl || 'https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <ProgramHero data={intuitionProcessData} onRegister={handleRegister} />

      {/* Benefits Section */}
      <ProgramBenefits
        benefits={intuitionProcessData.benefits}
        title="What Will I Get from This Program?"
      />

      {/* What is Intuition Process */}
      {intuitionProcessData.whatIsProgram && (
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
                {intuitionProcessData.whatIsProgram.title}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card className="border-stone-200 shadow-sm mb-8">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-stone max-w-none">
                    {intuitionProcessData.whatIsProgram.content.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-stone-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Sections */}
              {intuitionProcessData.whatIsProgram.sections && (
                <div className="space-y-6">
                  {intuitionProcessData.whatIsProgram.sections.map((section, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="border-stone-200 shadow-sm">
                        <CardContent className="p-6">
                          <h3 className="font-display text-xl font-light mb-3 text-stone-900 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-green-600" />
                            {section.title}
                          </h3>
                          <p className="text-stone-700 leading-relaxed">
                            {section.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Who is it for */}
      {intuitionProcessData.whoIsItFor && (
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
                {intuitionProcessData.whoIsItFor.title}
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
                    {intuitionProcessData.whoIsItFor.content}
                  </p>
                  {intuitionProcessData.whoIsItFor.eligibility && (
                    <ul className="space-y-3">
                      {intuitionProcessData.whoIsItFor.eligibility.map((item, i) => (
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
      {intuitionProcessData.corePractices && (
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
                {intuitionProcessData.corePractices.title}
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {intuitionProcessData.corePractices.practices.map((practice, i) => (
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

      {/* Research Metrics */}
      {intuitionProcessData.research && (
        <section className="py-24 bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50" aria-labelledby="research-heading">
          <div className="container max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="text-center mb-12"
            >
              <h2
                id="research-heading"
                className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
              >
                {intuitionProcessData.research.title}
              </h2>
              {intuitionProcessData.research.description && (
                <p className="text-lg text-stone-700 leading-relaxed max-w-2xl mx-auto">
                  {intuitionProcessData.research.description}
                </p>
              )}
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {intuitionProcessData.research.metrics.map((metric, i) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border border-stone-200 shadow-sm bg-white text-center">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-4xl font-light text-stone-900">{metric.value}</span>
                      </div>
                      <h3 className="font-display text-lg font-light mb-2 text-stone-900">
                        {metric.title}
                      </h3>
                      <p className="text-sm text-stone-600 mb-2">{metric.description}</p>
                      {metric.source && (
                        <p className="text-xs text-stone-500 italic">{metric.source}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <ProgramTestimonials testimonials={intuitionProcessData.testimonials} />

      {/* Founder Section */}
      <ProgramFounder founder={intuitionProcessData.founder} />

      {/* Upcoming Programs */}
      <ProgramUpcoming
        programs={intuitionProcessData.upcomingPrograms}
        onRegister={handleRegister}
      />

      {/* FAQs */}
      <ProgramFAQs faqs={intuitionProcessData.faqs} />

      {/* Final CTA */}
      <ProgramCTA
        onRegister={handleRegister}
        title="Ready to Awaken Your Intuition?"
        subtitle="Give your child the gift of enhanced intuition, focus, and inner awareness through the Intuition Process"
      />
    </MainLayout>
  );
};

export default IntuitionProcessPage;
