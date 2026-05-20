/**
 * Facilities - Category Section
 *
 * Group facilities by category.
 */

import { FacilityCard } from './FacilityCard';
import type { Facility } from '../../types';

interface CategorySectionProps {
  title: string;
  facilities: Facility[];
}

export const CategorySection = ({ title, facilities }: CategorySectionProps) => {
  if (facilities.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </section>
  );
};
