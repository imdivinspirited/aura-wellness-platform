/**
 * Stay & Meals - Booking Form
 *
 * Comprehensive booking form for accommodation.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Loader2, Send, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import type { Room } from '../../types';

const bookingSchema = z.object({
  roomId: z.string().min(1, 'Please select a room type'),
  checkIn: z.string().min(1, 'Please select check-in date'),
  checkOut: z.string().min(1, 'Please select check-out date'),
  guests: z.number().min(1).max(10, 'Maximum 10 guests'),
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Please enter your country'),
  meals: z.object({
    included: z.boolean(),
    preferences: z.array(z.string()).optional(),
  }),
  specialRequirements: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  rooms: Room[];
  onBookingSuccess?: () => void;
}

export const BookingForm = ({ rooms, onBookingSuccess }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests: 1,
      meals: {
        included: false,
        preferences: [],
      },
      consent: false,
    },
  });

  const watchedValues = watch();
  const selectedRoom = rooms.find((r) => r.id === watchedValues.roomId);

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // In production, this would be an API call
      // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setSubmitMessage('Your booking request has been submitted. You will receive confirmation via email.');
      onBookingSuccess?.();
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available dates (next 30 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Accommodation
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Fill out this form to request accommodation. Bookings are subject to availability.
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

          {/* Room Type */}
          <div className="space-y-2">
            <Label htmlFor="roomId">
              Room Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.roomId}
              onValueChange={(value) => setValue('roomId', value)}
            >
              <SelectTrigger id="roomId" aria-invalid={errors.roomId ? 'true' : 'false'}>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} (Max {room.maxGuests} {room.maxGuests === 1 ? 'guest' : 'guests'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && (
              <p className="text-sm text-destructive">{errors.roomId.message}</p>
            )}
          </div>

          {/* Check-in Date */}
          <div className="space-y-2">
            <Label htmlFor="checkIn">
              Check-in Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkIn"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('checkIn')}
              aria-invalid={errors.checkIn ? 'true' : 'false'}
            />
            {errors.checkIn && (
              <p className="text-sm text-destructive">{errors.checkIn.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Check-in time: 2:00 PM</p>
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <Label htmlFor="checkOut">
              Check-out Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkOut"
              type="date"
              min={watchedValues.checkIn || new Date().toISOString().split('T')[0]}
              {...register('checkOut')}
              aria-invalid={errors.checkOut ? 'true' : 'false'}
            />
            {errors.checkOut && (
              <p className="text-sm text-destructive">{errors.checkOut.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Check-out time: 11:00 AM</p>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">
              Number of Guests <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max={selectedRoom?.maxGuests || 10}
              {...register('guests', { valueAsNumber: true })}
              aria-invalid={errors.guests ? 'true' : 'false'}
            />
            {errors.guests && (
              <p className="text-sm text-destructive">{errors.guests.message}</p>
            )}
            {selectedRoom && (
              <p className="text-xs text-muted-foreground">
                Maximum {selectedRoom.maxGuests} {selectedRoom.maxGuests === 1 ? 'guest' : 'guests'} for this room type
              </p>
            )}
          </div>

          {/* Guest Information */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Guest Information</h3>

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
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your.email@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
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
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="Enter your country"
                aria-invalid={errors.country ? 'true' : 'false'}
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Meal Options</h3>

            <div className="flex items-start gap-3">
              <Checkbox
                id="mealsIncluded"
                checked={watchedValues.meals?.included}
                onCheckedChange={(checked) =>
                  setValue('meals.included', checked === true)
                }
                className="mt-1"
              />
              <Label htmlFor="mealsIncluded" className="text-sm leading-relaxed cursor-pointer">
                Include meals (3 meals daily - Breakfast, Lunch, Dinner)
              </Label>
            </div>

            {watchedValues.meals?.included && (
              <div className="ml-7 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Meal Preferences (Optional):</p>
                <Textarea
                  placeholder="e.g., Gluten-free, Vegan, Allergies..."
                  {...register('specialRequirements')}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <Label htmlFor="specialRequirements">
              Special Requirements (Optional)
            </Label>
            <Textarea
              id="specialRequirements"
              {...register('specialRequirements')}
              placeholder="Any special needs, accessibility requirements, or requests..."
              rows={3}
            />
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
                I understand the check-in/check-out times, rules, and cancellation policy. I agree to follow all accommodation guidelines. <span className="text-destructive">*</span>
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
                Submit Booking Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
