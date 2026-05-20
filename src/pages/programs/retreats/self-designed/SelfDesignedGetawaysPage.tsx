/**
 * Self-Designed Getaways Page
 */

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SelfDesignedGetawaysPage = () => {
  const handleRegister = () => {
    window.open('https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <section className="py-24 bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50">
        <div className="container max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-6 text-stone-900">
            Self-Designed Getaways
          </h1>
          <p className="text-xl text-stone-700 mb-8">
            Create your own personalized retreat experience tailored to your needs and preferences
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container max-w-4xl">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Design Your Perfect Getaway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-stone-700">
                Our Self-Designed Getaways allow you to create a personalized retreat experience that fits your schedule, interests, and goals. Whether you're seeking deep meditation, yoga practice, wellness, or simply a peaceful break, we'll help you design the perfect program.
              </p>
              <h3 className="font-semibold text-lg mt-6">What You Can Include:</h3>
              <ul className="space-y-2 text-stone-700">
                <li>• Yoga and meditation sessions</li>
                <li>• Wellness consultations</li>
                <li>• Nature walks and outdoor activities</li>
                <li>• Spiritual practices and satsang</li>
                <li>• Healthy meals and accommodation</li>
                <li>• Quiet time for reflection and rest</li>
              </ul>
              <div className="mt-8">
                <Button onClick={handleRegister} size="lg" className="bg-blue-700 hover:bg-blue-600">
                  Contact Us to Design Your Getaway
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default SelfDesignedGetawaysPage;
