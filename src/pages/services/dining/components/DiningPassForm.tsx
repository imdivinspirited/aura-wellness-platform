/**
 * Dining - Dining Pass Form
 *
 * Form for requesting dining passes.
 * This is a new form (preserving structure for future integration with existing form if it exists).
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, Calendar, Utensils, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { diningData } from '../data';

const diningPassSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner'], {
    required_error: 'Please select a meal type',
  }),
  date: z.string().min(1, 'Please select a date'),
  numberOfGuests: z.number().min(1).max(10, 'Maximum 10 guests per request'),
  dietaryRequirements: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, 'You must consent to the terms'),
});

type DiningPassFormValues = z.infer<typeof diningPassSchema>;

export const DiningPassForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DiningPassFormValues>({
    resolver: zodResolver(diningPassSchema),
    defaultValues: {
      numberOfGuests: 1,
      consent: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: DiningPassFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // In production, this would be an API call
      // await fetch('/api/dining-pass', { method: 'POST', body: JSON.stringify(data) })
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setSubmitMessage('Your dining pass request has been submitted. You will receive confirmation via email.');
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Request Dining Pass
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Fill out this form to request a dining pass for meals. Passes are subject to availability.
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

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Enter your full name"
              aria-invalid={errors.fullName ? 'true' : 'false'}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
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

          {/* Phone */}
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

          {/* Meal Type */}
          <div className="space-y-2">
            <Label htmlFor="mealType">
              Meal Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.mealType}
              onValueChange={(value) => setValue('mealType', value as 'breakfast' | 'lunch' | 'dinner')}
            >
              <SelectTrigger id="mealType" aria-invalid={errors.mealType ? 'true' : 'false'}>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast (7:00 AM - 9:00 AM)</SelectItem>
                <SelectItem value="lunch">Lunch (12:30 PM - 2:30 PM)</SelectItem>
                <SelectItem value="dinner">Dinner (7:00 PM - 8:30 PM)</SelectItem>
              </SelectContent>
            </Select>
            {errors.mealType && (
              <p className="text-sm text-destructive">{errors.mealType.message}</p>
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
                {availableDates.map((date) => (
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

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="numberOfGuests">
              Number of Guests <span className="text-destructive">*</span>
            </Label>
            <Input
              id="numberOfGuests"
              type="number"
              min="1"
              max="10"
              {...register('numberOfGuests', { valueAsNumber: true })}
              aria-invalid={errors.numberOfGuests ? 'true' : 'false'}
            />
            {errors.numberOfGuests && (
              <p className="text-sm text-destructive">{errors.numberOfGuests.message}</p>
            )}
          </div>

          {/* Dietary Requirements */}
          <div className="space-y-2">
            <Label htmlFor="dietaryRequirements">
              Dietary Requirements (Optional)
            </Label>
            <Input
              id="dietaryRequirements"
              {...register('dietaryRequirements')}
              placeholder="e.g., Gluten-free, Vegan, Allergies"
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
                I understand that dining passes are subject to availability and I will follow the dining rules and guidelines. <span className="text-destructive">*</span>
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
                Request Dining Pass
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
