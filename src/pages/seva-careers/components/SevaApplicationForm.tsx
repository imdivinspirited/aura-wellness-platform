/**
 * Seva / Job / Internship application form.
 * Workflow: validate → upload resume → upload photo → insert DB → sync Google Sheets → success.
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
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SevaListing } from '../data/listings';

const MAX_RESUME_MB = 5;
const MAX_PHOTO_MB = 2;

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().trim().min(10, 'Valid phone required').max(20),
  whatsapp: z.string().optional(),
  type: z.enum(['seva', 'job', 'internship']),
  position: z.string().min(1, 'Position is required').max(200),
  age: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().min(18).max(100).optional()
  ),
  gender: z.string().optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().optional(),
  country: z.string().trim().min(1, 'Country is required').max(100),
  education: z.string().optional(),
  skills: z.string().optional(),
  availableFrom: z.string().optional(),
  duration: z.string().optional(),
  whyJoin: z.string().trim().min(20, 'Please write at least a few lines').max(2000),
});

type FormValues = z.infer<typeof schema>;

export interface SevaApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedListing: SevaListing | null;
}

export function SevaApplicationForm({
  open,
  onOpenChange,
  selectedListing,
}: SevaApplicationFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', email: '', phone: '', whatsapp: '', type: 'seva',
      position: '', age: undefined, gender: '', city: '', state: '',
      country: 'India', education: '', skills: '', availableFrom: '',
      duration: '', whyJoin: '',
    },
  });

  useEffect(() => {
    if (selectedListing && open) {
      form.setValue('position', selectedListing.title);
      form.setValue('type', selectedListing.type);
    }
  }, [selectedListing, open, form]);

  const validateResumeFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      setResumeError('Resume must be a PDF file');
      return false;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setResumeError(`Resume must be under ${MAX_RESUME_MB}MB`);
      return false;
    }
    setResumeError('');
    return true;
  };

  const validatePhotoFile = (file: File): boolean => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Photo must be JPG or PNG');
      return false;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoError(`Photo must be under ${MAX_PHOTO_MB}MB`);
      return false;
    }
    setPhotoError('');
    return true;
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('applications')
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: urlData } = supabase.storage
      .from('applications')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitStatus('submitting');
    setErrorMessage('');

    // Validate files
    if (resumeFile && !validateResumeFile(resumeFile)) {
      setSubmitStatus('idle');
      return;
    }
    if (photoFile && !validatePhotoFile(photoFile)) {
      setSubmitStatus('idle');
      return;
    }

    try {
      // Step 1: Upload resume
      let resumeUrl = '';
      if (resumeFile) {
        resumeUrl = await uploadFile(resumeFile, 'resumes');
      }

      // Step 2: Upload photo
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, 'photos');
      }

      // Step 3: Insert into database
      const { error: dbError } = await supabase.from('applications' as any).insert({
        full_name: values.name,
        email: values.email,
        phone: values.phone,
        whatsapp: values.whatsapp || values.phone,
        application_type: values.type,
        position: values.position,
        age: values.age || null,
        gender: values.gender || null,
        city: values.city,
        state: values.state || null,
        country: values.country,
        education: values.education || null,
        skills: values.skills || null,
        available_from: values.availableFrom || null,
        duration: values.duration || null,
        why_join: values.whyJoin,
        resume_url: resumeUrl || null,
        photo_url: photoUrl || null,
      } as any);

      if (dbError) {
        console.error('DB insert error:', dbError);
        throw new Error('Failed to save application. Please try again.');
      }

      // Step 4: Sync to Google Sheets (non-blocking — DB insert already succeeded)
      try {
        await supabase.functions.invoke('sync-to-sheets', {
          body: {
            full_name: values.name,
            phone: values.phone,
            email: values.email,
            position: values.position,
            city: values.city,
            state: values.state || '',
            resume_url: resumeUrl,
            photo_url: photoUrl,
            created_at: new Date().toISOString(),
          },
        });
      } catch (sheetsErr) {
        // Silently log — DB insert succeeded, sheets sync is best-effort
        console.warn('Google Sheets sync failed (non-critical):', sheetsErr);
      }

      // Step 5: Success
      setSubmitStatus('success');
      toast.success('Application submitted successfully! 🙏');
      form.reset();
      setResumeFile(null);
      setPhotoFile(null);

      setTimeout(() => {
        onOpenChange(false);
        setSubmitStatus('idle');
      }, 2000);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitStatus('idle');
      setErrorMessage('');
      setResumeError('');
      setPhotoError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply — Seva / Job / Internship</DialogTitle>
          <DialogDescription>
            Fill in your details. We will review your application and get back to you.
          </DialogDescription>
        </DialogHeader>

        {submitStatus === 'success' ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Application Submitted!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Thank you for your interest. We'll review your application and contact you soon. 🙏
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl><Input type="tel" placeholder="+91 98765 43210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl><Input type="tel" placeholder="Same or different" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="seva">Seva</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="position" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <FormControl><Input placeholder="e.g. Kitchen Seva" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl><Input type="number" min={18} placeholder="25" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl><Input placeholder="Bangalore" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input placeholder="Karnataka" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl><Input placeholder="India" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="education" render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl><Input placeholder="Degree, institution" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="skills" render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl><Input placeholder="Relevant skills" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="availableFrom" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available from</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl><Input placeholder="e.g. 3 months" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="whyJoin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join? *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your motivation and how you can contribute..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* File uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Resume (PDF, max {MAX_RESUME_MB}MB)</label>
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && validateResumeFile(file)) setResumeFile(file);
                      else if (!file) { setResumeFile(null); setResumeError(''); }
                    }}
                  />
                  {resumeError && <p className="text-sm text-destructive">{resumeError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Photo (JPG/PNG, max {MAX_PHOTO_MB}MB)</label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && validatePhotoFile(file)) setPhotoFile(file);
                      else if (!file) { setPhotoFile(null); setPhotoError(''); }
                    }}
                  />
                  {photoError && <p className="text-sm text-destructive">{photoError}</p>}
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <Button type="submit" disabled={submitStatus === 'submitting'} className="w-full">
                {submitStatus === 'submitting' ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
