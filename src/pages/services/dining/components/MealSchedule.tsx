/**
 * Dining - Meal Schedule
 *
 * Visual meal schedule with timings and information.
 */

import { Clock, Utensils, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MealSlot } from '../../types';

interface MealScheduleProps {
  slots: MealSlot[];
}

const mealLabels: Record<MealSlot['mealType'], { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: '🌅' },
  lunch: { label: 'Lunch', icon: '☀️' },
  dinner: { label: 'Dinner', icon: '🌙' },
  snacks: { label: 'Snacks', icon: '☕' },
};

export const MealSchedule = ({ slots }: MealScheduleProps) => {
  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Meal schedule information will be displayed here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Meal Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slots.map((slot) => {
            const mealInfo = mealLabels[slot.mealType];
            const availabilityPercent = (slot.available / slot.capacity) * 100;

            return (
              <div key={slot.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mealInfo.icon}</span>
                    <div>
                      <h3 className="font-semibold">{mealInfo.label}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {slot.time.open} - {slot.time.close}
                      </div>
                    </div>
                  </div>
                  {slot.requiresPass && (
                    <Badge variant="outline" className="text-xs">
                      Pass Required
                    </Badge>
                  )}
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">
                      {slot.available} / {slot.capacity} seats
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        availabilityPercent > 50
                          ? 'bg-green-500'
                          : availabilityPercent > 25
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${availabilityPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
