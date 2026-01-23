/**
 * Services Overview Hub Page
 *
 * Single entry point for all on-campus services.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceCard } from './components/ServiceCard';
import { QuickLinksSection } from './components/QuickLinksSection';
import { servicesData } from './data';

const ServicesPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container max-w-6xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {servicesData.hero.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {servicesData.hero.subtitle}
          </p>
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
