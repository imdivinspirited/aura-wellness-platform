import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supportFormData } from '../data';
import { useDebouncedCallback } from '@/lib/utils';

// Form validation schema
const supportFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please enter your country'),
  program: z.string().min(1, 'Please select a program'),
  preferredTime: z.string().min(1, 'Please select a preferred time slot'),
  query: z.string().min(10, 'Please provide at least 10 characters').max(2000, 'Query is too long'),
  consent: z.boolean().refine((val) => val === true, 'You must consent to be contacted'),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;

interface SupportFormProps {
  onSubmit: (data: SupportFormValues) => Promise<void>;
}

export const SupportForm = ({ onSubmit }: SupportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Memoized program groups
  const programGroups = useMemo(() => {
    const groups: Record<string, typeof supportFormData.programs> = {};
    supportFormData.programs.forEach((program) => {
      const category = program.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(program);
    });
    return groups;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: '',
      program: '',
      preferredTime: '',
      query: '',
      consent: false,
    },
  });

  // Debounced validation for real-time feedback
  const validateField = useCallback(
    async (field: keyof SupportFormValues) => {
      try {
        await trigger(field);
      } catch (error) {
        console.error('Validation error:', error);
      }
    },
    [trigger]
  );

  const debouncedValidate = useDebouncedCallback(validateField, 500);

  // Watch form values for debounced validation
  const watchedValues = watch();

  const handleFormSubmit = async (data: SupportFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Sanitize inputs (basic sanitization - in production, use a proper sanitization library)
      const sanitizedData = {
        ...data,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        country: data.country.trim(),
        query: data.query.trim(),
      };

      await onSubmit(sanitizedData);
      setSubmitStatus('success');
      setSubmitMessage('Thank you! Your inquiry has been submitted successfully. We will contact you soon.');

      // Reset form after successful submission
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : 'An error occurred while submitting your inquiry. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-light">Express Interest Form</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Fill out the form below and our team will get back to you at your preferred time.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
              {...register('fullName', {
                onChange: () => debouncedValidate('fullName'),
              })}
              placeholder="Enter your full name"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-destructive" role="alert">
                {errors.fullName.message}
              </p>
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
              {...register('email', {
                onChange: () => debouncedValidate('email'),
              })}
              placeholder="your.email@example.com"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
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
              {...register('phone', {
                onChange: () => debouncedValidate('phone'),
              })}
              placeholder="+91-XXXXXXXXXX"
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="text-sm text-destructive" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              {...register('country', {
                onChange: () => debouncedValidate('country'),
              })}
              placeholder="Enter your country"
              aria-invalid={errors.country ? 'true' : 'false'}
              aria-describedby={errors.country ? 'country-error' : undefined}
            />
            {errors.country && (
              <p id="country-error" className="text-sm text-destructive" role="alert">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Program Selector */}
          <div className="space-y-2">
            <Label htmlFor="program">
              Program of Interest <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.program}
              onValueChange={(value) => {
                setValue('program', value);
                debouncedValidate('program');
              }}
            >
              <SelectTrigger id="program" aria-invalid={errors.program ? 'true' : 'false'}>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(programGroups).map(([category, programs]) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground">
                      {category}
                    </SelectLabel>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.program && (
              <p id="program-error" className="text-sm text-destructive" role="alert">
                {errors.program.message}
              </p>
            )}
          </div>

          {/* Preferred Time Slot */}
          <div className="space-y-2">
            <Label htmlFor="preferredTime">
              Preferred Call Time <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedValues.preferredTime}
              onValueChange={(value) => {
                setValue('preferredTime', value);
                debouncedValidate('preferredTime');
              }}
            >
              <SelectTrigger id="preferredTime" aria-invalid={errors.preferredTime ? 'true' : 'false'}>
                <SelectValue placeholder="Select preferred time" />
              </SelectTrigger>
              <SelectContent>
                {supportFormData.timeSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferredTime && (
              <p id="preferredTime-error" className="text-sm text-destructive" role="alert">
                {errors.preferredTime.message}
              </p>
            )}
          </div>

          {/* Query Textarea */}
          <div className="space-y-2">
            <Label htmlFor="query">
              Your Query <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="query"
              {...register('query', {
                onChange: () => debouncedValidate('query'),
              })}
              placeholder="Please describe your inquiry in detail..."
              rows={6}
              aria-invalid={errors.query ? 'true' : 'false'}
              aria-describedby={errors.query ? 'query-error' : undefined}
            />
            <p className="text-xs text-muted-foreground">
              {watchedValues.query?.length || 0} / 2000 characters
            </p>
            {errors.query && (
              <p id="query-error" className="text-sm text-destructive" role="alert">
                {errors.query.message}
              </p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={watchedValues.consent}
                onCheckedChange={(checked) => {
                  setValue('consent', checked === true);
                  debouncedValidate('consent');
                }}
                aria-invalid={errors.consent ? 'true' : 'false'}
                className="mt-1"
              />
              <Label
                htmlFor="consent"
                className="text-sm leading-relaxed cursor-pointer"
                aria-describedby={errors.consent ? 'consent-error' : undefined}
              >
                {supportFormData.consentText} <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.consent && (
              <p id="consent-error" className="text-sm text-destructive ml-7" role="alert">
                {errors.consent.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || !isValid}
            className="w-full"
            aria-label="Submit support inquiry"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Inquiry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
