/**
 * Seva & Careers Page — Serve, Grow & Thrive at Art of Living Ashram
 * Filter tabs, listing cards, application form (Google Sheets integration via env).
 */

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Heart, Briefcase, GraduationCap, LayoutGrid } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SevaListingCard } from './components/SevaListingCard';
import { SevaApplicationForm } from './components/SevaApplicationForm';
import { sevaListings, type SevaListing, type ListingType } from './data/listings';

type TabValue = 'all' | ListingType;

const tabConfig: { value: TabValue; label: string; icon: typeof Heart }[] = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'seva', label: 'Seva', icon: Heart },
  { value: 'job', label: 'Jobs', icon: Briefcase },
  { value: 'internship', label: 'Internships', icon: GraduationCap },
];

export const SevaCareersPage = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SevaListing | null>(null);

  const filteredListings = useMemo(() => {
    if (activeTab === 'all') return sevaListings;
    return sevaListings.filter((l) => l.type === activeTab);
  }, [activeTab]);

  const openFormForListing = (listing: SevaListing) => {
    setSelectedListing(listing);
    setFormOpen(true);
  };

  const openFormGeneral = () => {
    setSelectedListing(null);
    setFormOpen(true);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/explore/hero_explore.jpg"
            alt="Ashram"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40" />
        </div>
        <div className="relative z-10 container py-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-light mb-4 text-white">
            Serve, Grow & Thrive at Art of Living Ashram
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
            Seva, Jobs, Internships — Apply Online
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={openFormGeneral}>
            Apply Now
          </Button>
        </div>
      </section>

      {/* Filter Tabs + Listing Cards */}
      <section className="py-12 bg-muted/30 scroll-mt-20" id="listings">
        <div className="container">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 mb-8 bg-background border p-2 rounded-lg">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.value !== 'all' && <tab.icon className="h-4 w-4" />}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <SevaListingCard key={listing.id} listing={listing} onApply={openFormForListing} />
              ))}
            </div>
            {filteredListings.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No listings in this category. Try another tab or{' '}
                <button type="button" onClick={openFormGeneral} className="text-primary hover:underline">
                  apply generally
                </button>
                .
              </p>
            )}
          </Tabs>
        </div>
      </section>

      <SevaApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        selectedListing={selectedListing}
      />
    </MainLayout>
  );
};
