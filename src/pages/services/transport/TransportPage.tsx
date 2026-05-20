/**
 * Transport Page
 *
 * Complete transport information with EV Buggy service and routes.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { RouteCard } from './components/RouteCard';
import { EVBuggyForm } from './components/EVBuggyForm';
import { transportData } from './data';

const TransportPage = () => {
  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Transport
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            EV Buggy service and transport assistance within the campus
          </p>
        </div>

        {/* Routes */}
        <section className="mb-12">
          <h2 className="font-display text-3xl font-bold mb-6">Available Routes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {transportData.routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </section>

        {/* EV Buggy Form */}
        <section className="mb-12">
          <EVBuggyForm />
        </section>

        {/* Additional Information */}
        <section className="p-6 bg-muted/30 rounded-lg">
          <h2 className="font-display text-2xl font-bold mb-4">Transport Information</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Service Hours</h3>
              <p>EV Buggy service operates from 7:00 AM to 9:00 PM daily. Service is on a first-come-first-serve basis.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Priority & Accessibility</h3>
              <p>Priority is given to elderly visitors and those with special needs. All vehicles are wheelchair accessible.</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default TransportPage;
