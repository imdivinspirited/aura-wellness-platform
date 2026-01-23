import { useState } from 'react';
import { motion } from 'framer-motion';
import { Route, Plane, Bus, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TravelOption } from '../data';

interface HowToReachProps {
  travelOptions: TravelOption[];
}

export const HowToReachSection = ({ travelOptions }: HowToReachProps) => {
  const [activeTab, setActiveTab] = useState(travelOptions[0]?.id || '');

  const iconMap: Record<string, React.ComponentType<any>> = {
    'nice-road': Route,
    flight: Plane,
    'bus-metro-train': Bus,
  };

  return (
    <section className="py-12" aria-labelledby="how-to-reach-heading">
      <h2 id="how-to-reach-heading" className="font-display text-3xl font-light mb-6 text-stone-900">
        How to Reach Ashram
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
          {travelOptions.map((option) => {
            const IconComponent = iconMap[option.id] || Route;
            return (
              <TabsTrigger
                key={option.id}
                value={option.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-sm md:text-base">{option.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {travelOptions.map((option, index) => {
          const IconComponent = iconMap[option.id] || Route;
          return (
            <TabsContent key={option.id} value={option.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-stone-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-light">{option.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {option.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-start gap-3 text-stone-700 leading-relaxed"
                        >
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
};
