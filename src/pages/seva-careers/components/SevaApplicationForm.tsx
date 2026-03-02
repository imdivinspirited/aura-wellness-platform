/**
 * Seva / Job / Internship application form.
 * Submits to Google Apps Script Web App URL (VITE_SEVA_FORM_WEB_APP_URL).
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { SevaListing, ListingType } from '../data/listings';

const MAX_RESUME_MB = 5;
const MAX_PHOTO_MB = 2;

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  whatsapp: z.string().optional(),
  type: z.enum(['seva', 'job', 'internship']),
  position: z.string().min(1, 'Position is required'),
  age: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().min(18).max(100).optional()
  ),
  gender: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  education: z.string().optional(),
  skills: z.string().optional(),
  availableFrom: z.string().optional(),
  duration: z.string().optional(),
  whyJoin: z.string().min(20, 'Please write at least a few lines'),
  resumeFile: z.instanceof(FileList).optional(),
  photoFile: z.instanceof(FileList).optional(),
});

type FormValues = z.infer<typeof schema>;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface SevaApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill position from listing card */
  selectedListing: SevaListing | null;
}

const WEB_APP_URL = import.meta.env.VITE_SEVA_FORM_WEB_APP_URL as string | undefined;

export function SevaApplicationForm({
  open,
  onOpenChange,
  selectedListing,
}: SevaApplicationFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      type: 'seva',
      position: '',
      age: undefined,
      gender: '',
      city: '',
      state: '',
      country: 'India',
      education: '',
      skills: '',
      availableFrom: '',
      duration: '',
      whyJoin: '',
    },
  });

  // When a listing is selected, pre-fill position and type
  useEffect(() => {
    if (selectedListing && open) {
      form.setValue('position', selectedListing.title);
      form.setValue('type', selectedListing.type);
    }
  }, [selectedListing, open, form]);

  const onSubmit = async (values: FormValues) => {
    setSubmitStatus('submitting');
    setErrorMessage('');

    let resumeLink = '';
    let photoLink = '';
    if (values.resumeFile?.length && values.resumeFile[0]) {
      const file = values.resumeFile[0];
      if (file.size <= MAX_RESUME_MB * 1024 * 1024) {
        try {
          resumeLink = await fileToBase64(file);
          // Send as data URL for script to decode; or send filename + base64
          resumeLink = `data:${file.type};base64,${resumeLink}`;
        } catch {
          resumeLink = `[Uploaded: ${file.name}]`;
        }
      } else {
        resumeLink = `[File too large: ${file.name}]`;
      }
    }
    if (values.photoFile?.length && values.photoFile[0]) {
      const file = values.photoFile[0];
      if (file.size <= MAX_PHOTO_MB * 1024 * 1024) {
        try {
          const b64 = await fileToBase64(file);
          photoLink = `data:${file.type};base64,${b64}`;
        } catch {
          photoLink = `[Uploaded: ${file.name}]`;
        }
      } else {
        photoLink = `[File too large: ${file.name}]`;
      }
    }

    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      whatsapp: values.whatsapp || values.phone,
      type: values.type,
      position: values.position,
      age: values.age ?? '',
      gender: values.gender ?? '',
      city: values.city,
      state: values.state ?? '',
      country: values.country,
      education: values.education ?? '',
      skills: values.skills ?? '',
      availableFrom: values.availableFrom ?? '',
      duration: values.duration ?? '',
      whyJoin: values.whyJoin,
      resumeLink,
      photoLink,
    };

    if (!WEB_APP_URL) {
      setSubmitStatus('error');
      setErrorMessage('Form endpoint not configured (VITE_SEVA_FORM_WEB_APP_URL).');
      return;
    }

    try {
      const res = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }
      const data = await res.json().catch(() => ({}));
      if (data.status === 'success' || res.status === 200) {
        setSubmitStatus('success');
        form.reset();
        onOpenChange(false);
      } else {
        setSubmitStatus('error');
        setErrorMessage((data as { message?: string }).message || 'Submission failed.');
      }
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed.');
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply — Seva / Job / Internship</DialogTitle>
          <DialogDescription>
            Fill in your details. We will get back to you after reviewing your application.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Same or different" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seva / Job / Internship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="seva">Seva</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position applied for</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kitchen Seva" {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" min={18} placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Bangalore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Karnataka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education qualification</FormLabel>
                  <FormControl>
                    <Input placeholder="Degree, institution" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="Relevant skills" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available from (date)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="whyJoin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your motivation and how you can contribute..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resumeFile"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Resume (PDF, max {MAX_RESUME_MB}MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,application/pdf"
                        {...rest}
                        onChange={(e) => onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoFile"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Photo (JPG/PNG, max {MAX_PHOTO_MB}MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        {...rest}
                        onChange={(e) => onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {submitStatus === 'error' && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            {submitStatus === 'success' && (
              <p className="text-sm text-green-600">Application submitted. We will be in touch.</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitStatus === 'submitting'}>
                {submitStatus === 'submitting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
