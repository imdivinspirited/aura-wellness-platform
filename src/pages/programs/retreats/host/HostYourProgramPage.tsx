/**
 * Host Your Program Page
 */

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HostYourProgramPage = () => {
  const handleRegister = () => {
    window.open('https://programs.vvmvp.org/', '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <section className="py-24 bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50">
        <div className="container max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-6 text-stone-900">
            Host Your Program
          </h1>
          <p className="text-xl text-stone-700 mb-8">
            Bring the transformative power of our programs to your community or organization
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container max-w-4xl">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Host a Program in Your Area</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-stone-700">
                If you're passionate about sharing wellness and transformation with your community, consider hosting one of our programs. We provide the instructors, curriculum, and support - you provide the venue and help organize participants.
              </p>
              <h3 className="font-semibold text-lg mt-6">Benefits of Hosting:</h3>
              <ul className="space-y-2 text-stone-700">
                <li>• Bring wellness programs to your local community</li>
                <li>• Support from experienced instructors and coordinators</li>
                <li>• Flexible scheduling to fit your needs</li>
                <li>• Opportunity to serve and make a difference</li>
                <li>• Access to our proven curriculum and materials</li>
              </ul>
              <h3 className="font-semibold text-lg mt-6">What We Provide:</h3>
              <ul className="space-y-2 text-stone-700">
                <li>• Certified instructors</li>
                <li>• Program materials and curriculum</li>
                <li>• Marketing and promotional support</li>
                <li>• Ongoing guidance and assistance</li>
              </ul>
              <div className="mt-8">
                <Button onClick={handleRegister} size="lg" className="bg-blue-700 hover:bg-blue-600">
                  Contact Us to Host a Program
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

export default HostYourProgramPage;
