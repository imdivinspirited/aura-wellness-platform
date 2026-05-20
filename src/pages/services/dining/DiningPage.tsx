/**
 * Dining Page
 *
 * Complete dining information with locations, meals, and booking form.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { DiningLocationCard } from './components/DiningLocationCard';
import { MealSchedule } from './components/MealSchedule';
import { DiningPassForm } from './components/DiningPassForm';
import { RulesSection } from './components/RulesSection';
import { diningData } from './data';

const DiningPage = () => {
  const mainLocation = diningData.locations.find((loc) => loc.id === 'annapurna');

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Dining
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Satvik vegetarian meals served with love, following yogic dietary principles
          </p>
        </div>

        {/* Dining Locations */}
        <section className="mb-12">
          <h2 className="font-display text-3xl font-bold mb-6">Dining Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {diningData.locations.map((location) => (
              <DiningLocationCard key={location.id} location={location} />
            ))}
          </div>
        </section>

        {/* Meal Schedule */}
        {mainLocation && (
          <section className="mb-12">
            <MealSchedule slots={diningData.mealSlots} />
          </section>
        )}

        {/* Dining Pass Form */}
        <section className="mb-12">
          <DiningPassForm />
        </section>

        {/* Rules Section */}
        {mainLocation && (
          <section>
            <RulesSection rules={mainLocation.rules || []} />
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default DiningPage;
