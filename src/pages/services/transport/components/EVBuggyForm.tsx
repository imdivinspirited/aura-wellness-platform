/**
 * Transport - EV Buggy Booking Form
 *
 * Form for requesting EV Buggy service.
 * This form is preserved and enhanced from any existing implementation.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Loader2, Send, Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { transportData } from '../data';

const evBuggySchema = z.object({
  routeId: z.string().min(1, 'Please select a route'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  passengers: z.number().min(1).max(8, 'Maximum 8 passengers'),
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Please enter your current location'),
  specialNeeds: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, 'You must accept the terms'),
});

type EVBuggyFormValues = z.infer<typeof evBuggySchema>;

export const EVBuggyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EVBuggyFormValues>({
    resolver: zodResolver(evBuggySchema),
    defaultValues: {
      passengers: 1,
      consent: false,
    },
  });

  const watchedValues = watch();
  const selectedRoute = transportData.routes.find((r) => r.id === watchedValues.routeId);
  const availableTimings = selectedRoute?.timings.filter((t) => t.available) || [];

  const onSubmit = async (data: EVBuggyFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // In production, this would be an API call
      // await fetch('/api/ev-buggy', { method: 'POST', body: JSON.stringify(data) })
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setSubmitMessage('Your EV Buggy service request has been submitted. Please arrive at the pickup point 5 minutes before the scheduled time.');
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          EV Buggy Service Request
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Request EV Buggy service for transportation within campus. Service is on a first-come-first-serve basis.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{submitMessage}</AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitMessage}</AlertDescription>
            </Alert>
          )}

          {/* Route Selection */}
          <div className="space-y-2">
            <Label htmlFor="routeId">
              Route <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.routeId}
              onValueChange={(value) => setValue('routeId', value)}
            >
              <SelectTrigger id="routeId" aria-invalid={errors.routeId ? 'true' : 'false'}>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {transportData.routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.routeId && (
              <p className="text-sm text-destructive">{errors.routeId.message}</p>
            )}
            {selectedRoute && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold mb-2">Route Stops:</p>
                <ul className="space-y-1">
                  {selectedRoute.stops.map((stop, idx) => (
                    <li key={stop.id} className="text-xs text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {idx + 1}. {stop.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.date}
              onValueChange={(value) => setValue('date', value)}
            >
              <SelectTrigger id="date" aria-invalid={errors.date ? 'true' : 'false'}>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableDates().map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">
              Preferred Time <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.time}
              onValueChange={(value) => setValue('time', value)}
              disabled={!selectedRoute}
            >
              <SelectTrigger id="time" aria-invalid={errors.time ? 'true' : 'false'}>
                <SelectValue placeholder={selectedRoute ? 'Select time' : 'Select route first'} />
              </SelectTrigger>
              <SelectContent>
                {availableTimings.map((timing) => (
                  <SelectItem key={timing.time} value={timing.time}>
                    {timing.time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
            {selectedRoute && (
              <p className="text-xs text-muted-foreground">
                Service frequency: Every {selectedRoute.frequency} minutes
              </p>
            )}
          </div>

          {/* Number of Passengers */}
          <div className="space-y-2">
            <Label htmlFor="passengers">
              Number of Passengers <span className="text-destructive">*</span>
            </Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              max="8"
              {...register('passengers', { valueAsNumber: true })}
              aria-invalid={errors.passengers ? 'true' : 'false'}
            />
            {errors.passengers && (
              <p className="text-sm text-destructive">{errors.passengers.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum 8 passengers per trip. Capacity: {selectedRoute?.capacity || 8} passengers
            </p>
          </div>

          {/* Guest Information */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="guestName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="guestName"
                {...register('guestName')}
                placeholder="Enter your full name"
                aria-invalid={errors.guestName ? 'true' : 'false'}
              />
              {errors.guestName && (
                <p className="text-sm text-destructive">{errors.guestName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+91-XXXXXXXXXX"
                aria-invalid={errors.phone ? 'true' : 'false'}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Current Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="e.g., Main Gate, Reception, Accommodation Block A"
                aria-invalid={errors.location ? 'true' : 'false'}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Special Needs */}
          <div className="space-y-2">
            <Label htmlFor="specialNeeds">
              Special Needs / Accessibility Requirements (Optional)
            </Label>
            <Textarea
              id="specialNeeds"
              {...register('specialNeeds')}
              placeholder="e.g., Wheelchair access, assistance required..."
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This is a request form. Service is on a first-come-first-serve basis.
              Please arrive at the pickup point 5 minutes before the scheduled time. Priority is given to elderly
              and special needs passengers.
            </p>
          </div>

          {/* Consent */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={watchedValues.consent}
                onCheckedChange={(checked) => setValue('consent', checked === true)}
                aria-invalid={errors.consent ? 'true' : 'false'}
                className="mt-1"
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                I understand that EV Buggy service is on a first-come-first-serve basis and I will arrive on time at the pickup point. <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.consent && (
              <p className="text-sm text-destructive ml-7">{errors.consent.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
