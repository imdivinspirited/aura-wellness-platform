/**
 * Services Overview Hub Page
 *
 * Single entry point for all on-campus services.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceCard } from './components/ServiceCard';
import { QuickLinksSection } from './components/QuickLinksSection';
import { servicesData } from './data';

const ServicesPage = () => {
  return (
    <MainLayout>
      {/* Hero Section with Real Image */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/services/hero_services_campus.jpg"
            alt="Campus Services"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-6xl py-16">
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-4 text-white">
              {servicesData.hero.title}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              {servicesData.hero.subtitle}
            </p>

            {/* Hero Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
              <Card className="border-white/20 bg-white/10 backdrop-blur-md">
                <CardContent className="py-4">
                  <p className="text-sm text-white/80">On-campus services</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {servicesData.services.length}+
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 backdrop-blur-md">
                <CardContent className="py-4">
                  <p className="text-sm text-white/80">Essential facilities</p>
                  <p className="mt-1 text-2xl font-semibold text-white">24/7</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 backdrop-blur-md">
                <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-4">
                  <p className="text-sm text-white/80">Planning your stay?</p>
                  <Button size="sm" variant="secondary" asChild>
                    <a href="/services/stay">View stay &amp; meals</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 bg-background">
        <div className="container max-w-7xl">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Available Services</h2>
            <p className="text-muted-foreground">
              Click on any service to learn more and access booking forms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <QuickLinksSection data={servicesData.quickLinks} />
    </MainLayout>
  );
};

export default ServicesPage;
