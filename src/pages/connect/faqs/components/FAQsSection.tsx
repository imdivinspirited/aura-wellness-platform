import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FAQ, FAQCategory, FAQsPageData } from '../data';
import * as Icons from 'lucide-react';

interface FAQsSectionProps {
  data: FAQsPageData;
}

export const FAQsSection = ({ data }: FAQsSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Deep linking: Check URL for FAQ ID
  useEffect(() => {
    const faqId = searchParams.get('faq');
    if (faqId) {
      const faq = data.faqs.find((f) => f.id === faqId);
      if (faq) {
        setSelectedCategory(faq.category);
        setExpandedItems([faqId]);
        // Scroll to FAQ after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`faq-${faqId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }
  }, [searchParams, data.faqs]);

  // Filtered FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = data.faqs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data.faqs, selectedCategory, searchQuery]);

  // Group FAQs by category for display
  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    filteredFAQs.forEach((faq) => {
      if (!groups[faq.category]) {
        groups[faq.category] = [];
      }
      groups[faq.category].push(faq);
    });
    return groups;
  }, [filteredFAQs]);

  const handleCategoryChange = (category: FAQCategory | 'all') => {
    setSelectedCategory(category);
    setSearchParams({}); // Clear deep link when changing category
  };

  const handleFAQClick = (faqId: string) => {
    setExpandedItems((prev) =>
      prev.includes(faqId) ? prev.filter((id) => id !== faqId) : [...prev, faqId]
    );
    // Update URL for deep linking
    setSearchParams({ faq: faqId });
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label="Search frequently asked questions"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange('all')}
          aria-pressed={selectedCategory === 'all'}
        >
          All Categories
        </Button>
        {data.categories.map((category) => {
          const IconComponent =
            (Icons as unknown as Record<string, React.ComponentType<any>>)[category.icon] || Icons.HelpCircle;
          const count = data.faqs.filter((f) => f.category === category.id).length;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              className="flex items-center gap-2"
              aria-pressed={selectedCategory === category.id}
            >
              <IconComponent className="h-4 w-4" />
              {category.label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Results Count */}
      {filteredFAQs.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'}
          {selectedCategory !== 'all' && ` in ${data.categories.find((c) => c.id === selectedCategory)?.label}`}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      )}

      {/* FAQs Accordion */}
      {filteredFAQs.length > 0 ? (
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={setExpandedItems}
          className="space-y-4"
        >
          {Object.entries(groupedFAQs).map(([categoryId, faqs]) => {
            const categoryInfo = data.categories.find((c) => c.id === categoryId);
            return (
              <div key={categoryId} className="space-y-3">
                {selectedCategory === 'all' && (
                  <h3 className="font-display text-xl font-light text-stone-900 mb-2">
                    {categoryInfo?.label || categoryId}
                  </h3>
                )}
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    id={`faq-${faq.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={faq.id}
                      className="border border-stone-200 rounded-lg px-4 mb-3"
                    >
                      <AccordionTrigger
                        onClick={() => handleFAQClick(faq.id)}
                        className="hover:no-underline"
                      >
                        <div className="flex items-start gap-3 text-left">
                          {faq.important && (
                            <Badge variant="destructive" className="flex-shrink-0 mt-1">
                              Important
                            </Badge>
                          )}
                          <span className="font-medium text-stone-900">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-stone-700 leading-relaxed pt-2">
                        <div className="whitespace-pre-line">{faq.answer}</div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </div>
            );
          })}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-900 mb-2">No FAQs found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query or selecting a different category.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Volunteer Contact */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Phone className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-medium mb-2 text-stone-900">
                {data.volunteerContact.label}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{data.volunteerContact.hours}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${data.volunteerContact.phone}`} aria-label="Call volunteer helpline">
                    <Phone className="mr-2 h-4 w-4" />
                    {data.volunteerContact.phone}
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${data.volunteerContact.email}`} aria-label="Email volunteers">
                    <Mail className="mr-2 h-4 w-4" />
                    {data.volunteerContact.email}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
