/**
 * Facilities Page
 *
 * Complete campus facilities information with emergency contacts.
 */

import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategorySection } from './components/CategorySection';
import { EmergencyContacts } from './components/EmergencyContacts';
import { facilitiesData } from './data';
import type { FacilityCategory } from '../types';

const FacilitiesPage = () => {
  // Group facilities by category
  const facilitiesByCategory = useMemo(() => {
    const groups: Record<FacilityCategory, typeof facilitiesData.facilities> = {
      essential: [],
      convenience: [],
      special: [],
      emergency: [],
    };

    facilitiesData.facilities.forEach((facility) => {
      groups[facility.category].push(facility);
    });

    return groups;
  }, []);

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Campus Facilities
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Essential services, convenience facilities, and special amenities available throughout the campus
          </p>
        </div>

        {/* Emergency Contacts - Prominent */}
        <section className="mb-12">
          <EmergencyContacts contacts={facilitiesData.emergencyContacts} />
        </section>

        {/* Essential Services */}
        <CategorySection
          title="Essential Services"
          facilities={facilitiesByCategory.essential}
        />

        {/* Convenience Facilities */}
        <CategorySection
          title="Convenience Facilities"
          facilities={facilitiesByCategory.convenience}
        />

        {/* Special Facilities */}
        <CategorySection
          title="Special Facilities"
          facilities={facilitiesByCategory.special}
        />
      </div>
    </MainLayout>
  );
};

export default FacilitiesPage;
