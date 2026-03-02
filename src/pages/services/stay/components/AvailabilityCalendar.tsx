/**
 * Stay & Meals - Availability Calendar
 *
 * Calendar showing room availability.
 */

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Availability } from '../../types';

interface AvailabilityCalendarProps {
  availability: Availability[];
  roomId?: string;
}

export const AvailabilityCalendar = ({ availability, roomId }: AvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter by room if specified
  const filteredAvailability = roomId
    ? availability.filter((a) => a.roomId === roomId)
    : availability;

  // Get days in current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const formatDate = (day: number): string => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const getAvailabilityForDate = (date: string): Availability | undefined => {
    return filteredAvailability.find((a) => a.date === date);
  };

  const getAvailabilityStatus = (avail: Availability | undefined): 'available' | 'limited' | 'full' => {
    if (!avail) return 'available';
    const percent = (avail.available / avail.total) * 100;
    if (percent > 50) return 'available';
    if (percent > 10) return 'limited';
    return 'full';
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay)
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = formatDate(day);
            const avail = getAvailabilityForDate(date);
            const status = getAvailabilityStatus(avail);

            return (
              <div
                key={day}
                className={`aspect-square p-1 border rounded-md flex flex-col items-center justify-center text-xs ${
                  status === 'available'
                    ? 'bg-green-50 border-green-200'
                    : status === 'limited'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="font-medium">{day}</span>
                {avail && (
                  <span className="text-[10px] text-muted-foreground">
                    {avail.available}/{avail.total}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
            <span>Full</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
