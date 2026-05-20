/**
 * User Profile Page
 *
 * Comprehensive user profile with dashboard, settings, and account management.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Edit, Save, X, BookOpen, Lock, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, removeMyAvatar, updateMyProfile, uploadMyAvatarRaw } from '@/lib/api/profile';
import { listCountries, listStates, listCities, lookupIndiaPincode } from '@/lib/api/geo';
import { toast } from 'sonner';
import { createMyActivity, deleteMyActivity, listMyActivities, updateMyActivity } from '@/lib/api/activities';
import { changePassword, disable2fa, enable2fa, get2faStatus, listSessions, revokeOtherSessions, revokeSession, start2faSetup } from '@/lib/api/auth';
import { Navigate } from 'react-router-dom';
import { ResumeStudio } from '@/components/resume/ResumeStudio';
import { MoodWidget } from '@/components/mood/MoodWidget';
import { WellnessMoodProfileCard } from '@/components/mood/WellnessMoodProfileCard';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AvatarCropModal } from '@/components/profile/AvatarCropModal';
import { SocialLinkPeek } from '@/components/profile/SocialProfilePreviewCards';
import { ProfileOverviewSection } from '@/components/profile/ProfileOverviewSection';
import { ProfileStrengthMeter } from '@/components/profile/ProfileStrengthMeter';
import type { ProfileForResumeMerge } from '@/lib/resume/mergeProfile';
import {
  PHONE_DIAL_OPTIONS,
  DEFAULT_PHONE_DIAL,
  splitE164,
  combineE164,
} from '@/lib/phoneDialCodes';
import { getAbsoluteSiteUrl, getPublicProfilePath } from '@/lib/routes';
import {
  computeProfileCompletenessPercent,
  getProfileCompletenessBreakdown,
  structuredLocationRedundantWithAddressLine,
  type ProfileCompletenessInput,
} from '@/lib/profileOverviewUtils';
import { avatarUrlWithCacheBuster } from '@/lib/profile/avatarDisplayUrl';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
] as const;

/** Clears ghost session then sends user to login (see authStore persist + initialize race). */
function ProfileStaleSessionRedirect() {
  const clearSessionLocal = useAuthStore((s) => s.clearSessionLocal);
  useLayoutEffect(() => {
    clearSessionLocal();
  }, [clearSessionLocal]);
  return <Navigate to="/auth/login?next=/profile" replace />;
}

export default function Profile() {
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuthStore();
  const { cart, itemCount } = useCartStore();
  const { notifications, unreadCount } = useNotificationStore();
  const [isEditing, setIsEditing] = useState(false);
  /** Controlled tab so "Edit Profile" on Overview can switch to the tab that has the form. */
  const [activeTab, setActiveTab] = useState('overview');
  const qc = useQueryClient();
  const [achievementDraft, setAchievementDraft] = useState({ title: '', description: '' });
  const [activityDraft, setActivityDraft] = useState({
    kind: 'achievement' as const,
    title: '',
    description: '',
    org: '',
    department: '',
    location: '',
    startDate: '',
    endDate: '',
    hours: '',
  });
  const [activityFilterKind, setActivityFilterKind] = useState<'all' | 'program' | 'event' | 'service' | 'seva' | 'achievement' | 'note'>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [activityRange, setActivityRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [quickSession, setQuickSession] = useState<{
    kind: 'program' | 'event' | 'service' | 'seva' | 'achievement' | 'note';
    title: string;
    startedAt: string;
    endedAt: string;
    location: string;
  }>(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return { kind: 'seva', title: '', startedAt: local, endedAt: local, location: '' };
  });

  const [securityPw, setSecurityPw] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [twoFaSetup, setTwoFaSetup] = useState<{ secret: string; otpauthUrl: string; expiresAt: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaRecoveryCodes, setTwoFaRecoveryCodes] = useState<string[] | null>(null);
  const [twoFaDisable, setTwoFaDisable] = useState({ password: '', code: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string>('');
  const [pincodeLookupBusy, setPincodeLookupBusy] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneDial: DEFAULT_PHONE_DIAL,
    phoneNational: '',
    whatsappDial: DEFAULT_PHONE_DIAL,
    whatsappNational: '',
    age: '',
    gender: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    addressLine: '',
    education: '',
    skills: '',
    availableFrom: '',
    duration: '',
    headline: '',
    bio: '',
    website: '',
    instagram: '',
    linkedin: '',
  });
  const [editSnapshot, setEditSnapshot] = useState<typeof profileData | null>(null);
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);

  const meQ = useQuery({
    queryKey: ['me', 'profile-full'],
    queryFn: () => getMyProfile() as Promise<any>,
    enabled: isAuthenticated && !authLoading,
  });

  const achievementsQ = useQuery({
    queryKey: ['me', 'activities', 'achievement'],
    queryFn: () => listMyActivities({ kind: 'achievement' }),
    enabled: isAuthenticated && !authLoading,
  });

  const activitiesQ = useQuery({
    queryKey: ['me', 'activities', 'all'],
    queryFn: () => listMyActivities(),
    enabled: isAuthenticated && !authLoading,
  });

  const sessionsQ = useQuery({
    queryKey: ['me', 'auth', 'sessions'],
    queryFn: listSessions,
    enabled: isAuthenticated && !authLoading,
  });

  const twoFaStatusQ = useQuery({
    queryKey: ['me', 'auth', '2fa-status'],
    queryFn: get2faStatus,
    enabled: isAuthenticated && !authLoading,
  });

  const countriesGeoQ = useQuery({
    queryKey: ['geo', 'countries'],
    queryFn: listCountries,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const statesGeoQ = useQuery({
    queryKey: ['geo', 'states', profileData.country],
    queryFn: () => listStates(profileData.country),
    enabled: Boolean(profileData.country?.trim()),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const citiesGeoQ = useQuery({
    queryKey: ['geo', 'cities', profileData.country, profileData.state],
    queryFn: () => listCities(profileData.country, profileData.state),
    enabled: Boolean(profileData.country?.trim() && profileData.state?.trim()),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const stateOptions = useMemo(() => {
    const base = statesGeoQ.data ?? [];
    const s = profileData.state?.trim();
    if (s && !base.includes(s)) return [s, ...base];
    return base;
  }, [statesGeoQ.data, profileData.state]);

  const cityOptions = useMemo(() => {
    const base = citiesGeoQ.data ?? [];
    const c = profileData.city?.trim();
    if (c && !base.includes(c)) return [c, ...base];
    return base;
  }, [citiesGeoQ.data, profileData.city]);

  // Live strength preview while editing (updates as user types).
  const completenessInput: ProfileCompletenessInput = useMemo(
    () => ({
      name: profileData.name,
      email: profileData.email,
      headline: profileData.headline,
      bio: profileData.bio,
      phoneNational: profileData.phoneNational,
      whatsappNational: whatsappSameAsPhone ? profileData.phoneNational : profileData.whatsappNational,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      addressLine: profileData.addressLine,
      pincode: profileData.pincode,
      gender: profileData.gender,
      education: profileData.education,
      skills: profileData.skills,
      instagram: profileData.instagram,
      linkedin: profileData.linkedin,
      website: profileData.website,
    }),
    [profileData, whatsappSameAsPhone],
  );

  const liveStrengthPercent = useMemo(
    () => computeProfileCompletenessPercent(completenessInput),
    [completenessInput],
  );
  const liveStrengthBreakdown = useMemo(
    () => getProfileCompletenessBreakdown(completenessInput),
    [completenessInput],
  );

  const isDirty = useMemo(() => {
    if (!isEditing) return false;
    if (!editSnapshot) return false;
    if (avatarFile) return true;
    // If user picked a new avatar (crop sets preview to a blob URL), consider it a change even if fields are equal.
    if (avatarPreview && avatarPreview.startsWith('blob:')) return true;
    return JSON.stringify(profileData) !== JSON.stringify(editSnapshot);
  }, [isEditing, editSnapshot, profileData, avatarFile, avatarPreview]);

  useEffect(() => {
    if (!isEditing) {
      setEditSnapshot(null);
      return;
    }
    // Capture baseline once, so cancel can restore.
    setEditSnapshot((prev) => prev ?? profileData);
  }, [isEditing, profileData]);

  useEffect(() => {
    if (!isEditing || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isEditing, isDirty]);

  const applyIndiaPincode = useCallback(async (raw: string) => {
    const pin = raw.replace(/\D/g, '');
    if (pin.length !== 6) return;
    if (profileData.country && profileData.country !== 'India') {
      toast.info('PIN lookup is for India only. Set country to India first.');
      return;
    }
    setPincodeLookupBusy(true);
    try {
      const data = await lookupIndiaPincode(pin);
      setProfileData((p) => ({
        ...p,
        pincode: data.pincode,
        country: data.country,
        state: data.state,
        city: data.city,
        addressLine: data.addressLine,
      }));
      toast.success('Address filled from PIN code');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not look up PIN code');
    } finally {
      setPincodeLookupBusy(false);
    }
  }, [profileData.country]);

  const addAchievementM = useMutation({
    mutationFn: async () =>
      createMyActivity({
        kind: 'achievement',
        title: achievementDraft.title,
        description: achievementDraft.description || undefined,
      }),
    onSuccess: async () => {
      setAchievementDraft({ title: '', description: '' });
      await qc.invalidateQueries({ queryKey: ['me', 'activities', 'achievement'] });
      toast.success('Achievement added');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to add achievement'),
  });

  const deleteAchievementM = useMutation({
    mutationFn: async (id: string) => deleteMyActivity(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'activities', 'achievement'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to delete'),
  });

  const upsertActivityM = useMutation({
    mutationFn: async () => {
      const base = {
        kind: activityDraft.kind,
        title: activityDraft.title.trim(),
        description: activityDraft.description.trim() || undefined,
        org: activityDraft.org.trim() || undefined,
        department: activityDraft.department.trim() || undefined,
        location: activityDraft.location.trim() || undefined,
        startDate: activityDraft.startDate || undefined,
        endDate: activityDraft.endDate || undefined,
        hours: activityDraft.hours.trim() ? Number(activityDraft.hours) : undefined,
      };
      if (!base.title) throw new Error('Title is required');

      if (editingActivityId) {
        return updateMyActivity(editingActivityId, base);
      }
      return createMyActivity(base);
    },
    onSuccess: async () => {
      setActivityDraft({
        kind: 'achievement',
        title: '',
        description: '',
        org: '',
        department: '',
        location: '',
        startDate: '',
        endDate: '',
        hours: '',
      });
      setEditingActivityId(null);
      await qc.invalidateQueries({ queryKey: ['me', 'activities', 'all'] });
      await qc.invalidateQueries({ queryKey: ['me', 'activities', 'achievement'] });
      toast.success(editingActivityId ? 'Activity updated' : 'Activity added');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to save activity'),
  });

  const deleteActivityM = useMutation({
    mutationFn: async (id: string) => deleteMyActivity(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'activities', 'all'] });
      await qc.invalidateQueries({ queryKey: ['me', 'activities', 'achievement'] });
      toast.success('Deleted');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to delete'),
  });

  const changePasswordM = useMutation({
    mutationFn: async () => {
      if (!securityPw.current || !securityPw.next) throw new Error('Enter current and new password.');
      if (securityPw.next !== securityPw.confirm) throw new Error('New password and confirm do not match.');
      await changePassword({ currentPassword: securityPw.current, newPassword: securityPw.next });
    },
    onSuccess: async () => {
      setSecurityPw({ current: '', next: '', confirm: '' });
      await qc.invalidateQueries({ queryKey: ['me', 'auth', 'sessions'] });
      toast.success('Password updated');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to change password'),
  });

  const revokeSessionM = useMutation({
    mutationFn: async (id: string) => revokeSession(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'auth', 'sessions'] });
      toast.success('Session revoked');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to revoke session'),
  });

  const revokeOthersM = useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'auth', 'sessions'] });
      toast.success('Other sessions revoked');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to revoke sessions'),
  });

  const start2faM = useMutation({
    mutationFn: start2faSetup,
    onSuccess: (r) => {
      setTwoFaRecoveryCodes(null);
      setTwoFaCode('');
      setTwoFaSetup(r.data);
      toast.success('2FA setup started');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to start 2FA'),
  });

  const enable2faM = useMutation({
    mutationFn: async () => {
      if (!twoFaCode.trim()) throw new Error('Enter the code from your authenticator app.');
      return enable2fa(twoFaCode.trim());
    },
    onSuccess: async (r) => {
      setTwoFaRecoveryCodes(r.data.recoveryCodes || []);
      setTwoFaSetup(null);
      setTwoFaCode('');
      await qc.invalidateQueries({ queryKey: ['me', 'auth', '2fa-status'] });
      toast.success('2FA enabled');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to enable 2FA'),
  });

  const disable2faM = useMutation({
    mutationFn: async () => disable2fa({ password: twoFaDisable.password, code: twoFaDisable.code }),
    onSuccess: async () => {
      setTwoFaDisable({ password: '', code: '' });
      setTwoFaRecoveryCodes(null);
      await qc.invalidateQueries({ queryKey: ['me', 'auth', '2fa-status'] });
      toast.success('2FA disabled');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to disable 2FA'),
  });

  const filteredActivities = useMemo(() => {
    const items = (activitiesQ.data?.data?.items ?? []) as Array<any>;
    const q = activitySearch.trim().toLowerCase();
    return items.filter((it) => {
      if (activityFilterKind !== 'all' && it.kind !== activityFilterKind) return false;
      if (!q) return true;
      const blob = `${it.title || ''} ${it.description || ''} ${it.org || ''} ${it.department || ''} ${it.location || ''}`.toLowerCase();
      return blob.includes(q);
    });
  }, [activitiesQ.data, activityFilterKind, activitySearch]);

  const computedQuickHours = useMemo(() => {
    const s = quickSession.startedAt ? new Date(quickSession.startedAt).getTime() : NaN;
    const e = quickSession.endedAt ? new Date(quickSession.endedAt).getTime() : NaN;
    if (!Number.isFinite(s) || !Number.isFinite(e)) return null;
    const diff = e - s;
    if (diff <= 0) return null;
    return Math.round((diff / 3600000) * 100) / 100;
  }, [quickSession.startedAt, quickSession.endedAt]);

  const rangeStartMs = useMemo(() => {
    if (activityRange === 'all') return null;
    const days = activityRange === '7d' ? 7 : 30;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [activityRange]);

  const rangedActivities = useMemo(() => {
    if (!rangeStartMs) return filteredActivities;
    return filteredActivities.filter((a: any) => {
      const d = a.startDate || a.createdAt || a.updatedAt;
      const ms = d ? new Date(d).getTime() : 0;
      return ms >= rangeStartMs;
    });
  }, [filteredActivities, rangeStartMs]);

  const activityStats = useMemo(() => {
    const byKind: Record<string, { count: number; hours: number }> = {};
    let totalHours = 0;
    for (const a of rangedActivities as any[]) {
      const k = String(a.kind || 'other');
      if (!byKind[k]) byKind[k] = { count: 0, hours: 0 };
      byKind[k].count += 1;
      const h = typeof a.hours === 'number' && Number.isFinite(a.hours) ? a.hours : 0;
      byKind[k].hours += h;
      totalHours += h;
    }
    const kindsSorted = Object.entries(byKind).sort((a, b) => (b[1].count - a[1].count) || (b[1].hours - a[1].hours));
    return {
      totalItems: rangedActivities.length,
      totalHours,
      topKinds: kindsSorted.slice(0, 4),
      byKind,
    };
  }, [rangedActivities]);

  const exportActivitiesCsv = useCallback(() => {
    const rows = (rangedActivities as any[]).map((a) => ({
      kind: a.kind || '',
      title: a.title || '',
      org: a.org || '',
      department: a.department || '',
      location: a.location || '',
      startDate: a.startDate ? String(a.startDate).slice(0, 10) : '',
      endDate: a.endDate ? String(a.endDate).slice(0, 10) : '',
      hours: typeof a.hours === 'number' ? String(a.hours) : '',
      description: a.description || '',
      createdAt: a.createdAt ? String(a.createdAt) : '',
    }));
    const header = Object.keys(rows[0] || {
      kind: '',
      title: '',
      org: '',
      department: '',
      location: '',
      startDate: '',
      endDate: '',
      hours: '',
      description: '',
      createdAt: '',
    });
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => esc((r as any)[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities_${activityRange}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [rangedActivities, activityRange]);

  const resumeProfileLines = useMemo(() => {
    const d = meQ.data?.data?.details as Record<string, string | number | undefined> | undefined;
    if (!d) return [];
    const lines: string[] = [];
    const addr = String(d.addressLine ?? '').trim();
    const city = String(d.city ?? '').trim();
    const state = String(d.state ?? '').trim();
    const country = String(d.country ?? '').trim();
    const pin = String(d.pincode ?? '').trim();
    const loc = [city, state, country].filter(Boolean).join(', ');
    const redundant = structuredLocationRedundantWithAddressLine(addr, city, state, pin);
    if (addr) {
      lines.push(`Address: ${addr}`);
      if (redundant) {
        if (country && !addr.toLowerCase().includes(country.toLowerCase())) {
          lines.push(`Country: ${country}`);
        }
      } else {
        if (loc) lines.push(`Location: ${loc}`);
        if (pin) lines.push(`PIN: ${pin}`);
      }
    } else {
      if (loc) lines.push(`Location: ${loc}`);
      if (pin) lines.push(`PIN: ${pin}`);
    }
    if (d.age != null && d.age !== '') lines.push(`Age: ${String(d.age)}`);
    if (d.gender) lines.push(`Gender: ${String(d.gender)}`);
    if (d.education) lines.push(`Education: ${String(d.education)}`);
    if (d.skills) lines.push(`Skills: ${String(d.skills)}`);
    if (d.availableFrom) lines.push(`Available from: ${String(d.availableFrom).slice(0, 10)}`);
    if (d.duration) lines.push(`Duration: ${String(d.duration)}`);
    return lines;
  }, [meQ.data]);

  const serverUser = meQ.data?.data?.user;
  const serverDetails = meQ.data?.data?.details;

  const composedPhone = useMemo(
    () => combineE164(profileData.phoneDial, profileData.phoneNational),
    [profileData.phoneDial, profileData.phoneNational],
  );
  const composedWhatsapp = useMemo(
    () =>
      whatsappSameAsPhone
        ? composedPhone
        : combineE164(profileData.whatsappDial, profileData.whatsappNational),
    [whatsappSameAsPhone, composedPhone, profileData.whatsappDial, profileData.whatsappNational],
  );

  useEffect(() => {
    if (!whatsappSameAsPhone) return;
    setProfileData((p) => ({
      ...p,
      whatsappDial: p.phoneDial,
      whatsappNational: p.phoneNational,
    }));
  }, [whatsappSameAsPhone, profileData.phoneDial, profileData.phoneNational]);

  // Sync local form state when server profile loads
  useEffect(() => {
    if (!serverUser) return;
    const ph = splitE164(serverUser.phone || '');
    const wa = splitE164(serverDetails?.whatsapp || '');
    const sameWa =
      !!serverUser.phone &&
      !!serverDetails?.whatsapp &&
      ph.dial === wa.dial &&
      ph.national === wa.national;
    setWhatsappSameAsPhone(!serverDetails?.whatsapp || sameWa);
    setProfileData((prev) => ({
      ...prev,
      name: prev.name || serverUser.name || '',
      email: prev.email || serverUser.email || '',
      phoneDial: serverUser.phone ? ph.dial : prev.phoneDial || DEFAULT_PHONE_DIAL,
      phoneNational: serverUser.phone ? ph.national : prev.phoneNational,
      whatsappDial: serverDetails?.whatsapp
        ? wa.dial
        : serverUser.phone
          ? ph.dial
          : prev.whatsappDial || DEFAULT_PHONE_DIAL,
      whatsappNational: serverDetails?.whatsapp
        ? wa.national
        : serverUser.phone
          ? ph.national
          : prev.whatsappNational,
      age: prev.age || (serverDetails?.age != null ? String(serverDetails.age) : ''),
      gender: prev.gender || serverDetails?.gender || '',
      city: prev.city || serverDetails?.city || '',
      state: prev.state || serverDetails?.state || '',
      country: prev.country || serverDetails?.country || 'India',
      pincode: prev.pincode || serverDetails?.pincode || '',
      addressLine: prev.addressLine || serverDetails?.addressLine || '',
      education: prev.education || serverDetails?.education || '',
      skills: prev.skills || serverDetails?.skills || '',
      availableFrom:
        prev.availableFrom ||
        (serverDetails?.availableFrom ? String(serverDetails.availableFrom).slice(0, 10) : ''),
      duration: prev.duration || serverDetails?.duration || '',
      headline: prev.headline || serverDetails?.headline || '',
      bio: prev.bio || serverDetails?.bio || '',
      website: prev.website || serverDetails?.website || '',
      instagram: prev.instagram || serverDetails?.instagram || '',
      linkedin: prev.linkedin || serverDetails?.linkedin || '',
    }));
  }, [serverUser, serverDetails]);

  /** Stable URL for avatar (cache-bust when server sends avatarUpdatedAt). */
  const avatarDisplaySrc = useMemo(() => {
    const base = avatarPreview || serverDetails?.avatarUrl || '';
    return avatarUrlWithCacheBuster(base || undefined, serverDetails?.avatarUpdatedAt);
  }, [avatarPreview, serverDetails?.avatarUrl, serverDetails?.avatarUpdatedAt]);

  /** Same user only: merge profile → resume defaults (empty resume fields only). Prefer server details so first paint after load is correct. */
  const profileForResumeMerge = useMemo((): ProfileForResumeMerge | null => {
    if (!meQ.isSuccess || !serverUser) return null;
    return {
      fullName: profileData.name || serverUser.name || '',
      headline: profileData.headline || serverDetails?.headline || '',
      bio: profileData.bio || serverDetails?.bio || '',
      email: profileData.email || serverUser.email || '',
      phone: composedPhone || serverUser.phone || '',
      whatsapp: composedWhatsapp || serverDetails?.whatsapp || '',
      website: profileData.website || serverDetails?.website || '',
      instagram: profileData.instagram || serverDetails?.instagram || '',
      linkedin: profileData.linkedin || serverDetails?.linkedin || '',
      city: profileData.city || serverDetails?.city || '',
      state: profileData.state || serverDetails?.state || '',
      country: profileData.country || serverDetails?.country || '',
      education: profileData.education || serverDetails?.education || '',
      skills: profileData.skills || serverDetails?.skills || '',
    };
  }, [
    meQ.isSuccess,
    serverUser,
    serverDetails,
    profileData,
    composedPhone,
    composedWhatsapp,
    authUser?.name,
    authUser?.email,
  ]);

  useEffect(() => {
    // Cleanup object URL
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(avatarPreview);
        } catch {
          /* ignore */
        }
      }
      if (avatarCropSrc && avatarCropSrc.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(avatarCropSrc);
        } catch {
          /* ignore */
        }
      }
    };
  }, [avatarPreview, avatarCropSrc]);

  const saveM = useMutation({
    mutationFn: async () =>
      (async () => {
        if (avatarFile) {
          await uploadMyAvatarRaw(avatarFile);
        }
        return updateMyProfile({
        name: profileData.name,
        phone: composedPhone,
        details: {
          whatsapp: whatsappSameAsPhone ? undefined : (composedWhatsapp || undefined),
          age: profileData.age ? Number(profileData.age) : undefined,
          gender: profileData.gender || undefined,
          city: profileData.city || undefined,
          state: profileData.state || undefined,
          country: profileData.country || undefined,
          pincode: profileData.pincode || undefined,
          addressLine: profileData.addressLine || undefined,
          education: profileData.education || undefined,
          skills: profileData.skills || undefined,
          availableFrom: profileData.availableFrom || undefined,
          duration: profileData.duration || undefined,
          headline: profileData.headline || undefined,
          bio: profileData.bio || undefined,
          website: profileData.website || undefined,
          instagram: profileData.instagram || undefined,
          linkedin: profileData.linkedin || undefined,
        },
        });
      })(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'profile-full'] });
      toast.success('Profile saved');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Failed to save profile');
    },
  });

  const handleCancel = () => {
    if (editSnapshot) {
      setProfileData(editSnapshot);
    }
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container flex min-h-[40vh] items-center justify-center px-4 py-12">
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login?next=/profile" replace />;
  }

  if (isAuthenticated && meQ.isPending) {
    return (
      <MainLayout>
        <div className="container py-6 sm:py-10 max-w-6xl px-4 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 min-w-[5.5rem] shrink-0 snap-start rounded-lg" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl sm:col-span-2 lg:col-span-1" />
          </div>
          <Skeleton className="h-48 rounded-xl w-full" />
        </div>
      </MainLayout>
    );
  }

  if (
    isAuthenticated &&
    meQ.isError &&
    (meQ.error as Error)?.message === 'Please log in to continue.'
  ) {
    return <ProfileStaleSessionRedirect />;
  }

  if (isAuthenticated && meQ.isError) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-6xl px-4">
          <Alert variant="destructive">
            <AlertTitle>Could not load profile</AlertTitle>
            <AlertDescription>
              {(meQ.error as Error)?.message || 'Please check your connection and try again.'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="pb-4 lg:pb-3 xl:pb-4">
      <div
        className={cn(
          "container max-w-6xl px-3 sm:px-4",
          "pt-6 sm:pt-8 pb-0 sm:pb-2",
          isEditing && "pb-28 sm:pb-32"
        )}
      >
        <AvatarCropModal
          open={avatarCropOpen}
          imageSrc={avatarCropSrc}
          onOpenChange={setAvatarCropOpen}
          onCropped={async ({ file, previewUrl }) => {
            // Immediate upload so refresh won't lose the image even if user doesn't click "Save Changes".
            setAvatarFile(file);
            setAvatarPreview(previewUrl);
            try {
              await uploadMyAvatarRaw(file);
              await qc.invalidateQueries({ queryKey: ['me', 'profile-full'] });
              toast.success('Photo updated');
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Failed to upload photo');
            }
          }}
        />
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/[0.07] px-5 py-6 shadow-[0_24px_60px_-38px_hsl(var(--foreground)/0.22)] sm:mb-10 sm:px-8 sm:py-8">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/12 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-24 -bottom-28 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
            aria-hidden
          />

          <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90">
            Account
          </p>
          <h1 className="relative mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {profileData.name?.trim() ? (
              <>
                Profile{' '}
                <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  overview
                </span>
              </>
            ) : (
              <>
                Profile{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  overview
                </span>
              </>
            )}
          </h1>
          <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Manage your personal details, public profile, and settings — everything stays synced across the platform.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full h-auto p-1 gap-1 overflow-x-auto flex flex-nowrap sm:flex-wrap justify-start lg:grid lg:w-full lg:grid-cols-6 lg:overflow-visible rounded-xl bg-muted/50 border border-border/60 snap-x snap-mandatory touch-pan-x">
            <TabsTrigger value="overview" className="shrink-0 snap-start">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="shrink-0 snap-start">
              Profile
            </TabsTrigger>
            <TabsTrigger value="activities" className="shrink-0 snap-start">
              Activities
            </TabsTrigger>
            <TabsTrigger value="resume" className="shrink-0 snap-start">
              Resume
            </TabsTrigger>
            <TabsTrigger value="security" className="shrink-0 snap-start">
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="shrink-0 snap-start">
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProfileOverviewSection
              profileData={profileData}
              avatarDisplaySrc={avatarDisplaySrc}
              composedPhone={composedPhone}
              composedWhatsapp={composedWhatsapp}
              serverUserId={serverUser?.id}
              authUserId={authUser?.id}
              onEditProfile={() => {
                setIsEditing(true);
                setActiveTab('profile');
              }}
              onCopyPublicLink={() => {
                const id = serverUser?.id ?? authUser?.id;
                if (!id) return;
                const url = getAbsoluteSiteUrl(getPublicProfilePath(id));
                void navigator.clipboard.writeText(url).then(
                  () => toast.success('Public profile link copied'),
                  () => toast.error('Could not copy link'),
                );
              }}
              itemCount={itemCount}
              unreadCount={unreadCount}
              recentCartItems={cart?.items?.slice(0, 5) ?? []}
            />
            <WellnessMoodProfileCard
              wellnessMood={serverDetails?.wellnessMood}
              wellnessMoodUpdatedAt={serverDetails?.wellnessMoodUpdatedAt}
              wellnessLastImprovementPercent={serverDetails?.wellnessLastImprovementPercent}
            />
            <MoodWidget />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="shrink-0 w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarDisplaySrc} alt={profileData.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xl">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium">Profile photo</p>
                      <p className="text-sm text-muted-foreground">PNG/JPG/WebP · up to 3MB</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      id="profile-avatar-input"
                      disabled={!isEditing}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        if (!f) return;
                        try {
                          const url = URL.createObjectURL(f);
                          setAvatarCropSrc(url);
                          setAvatarCropOpen(true);
                        } catch {
                          toast.error('Could not read that image. Please try another file.');
                        } finally {
                          // allow selecting the same file again
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isEditing}
                      onClick={() => document.getElementById('profile-avatar-input')?.click()}
                    >
                      Upload photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isEditing || (!serverDetails?.avatarUrl && !avatarPreview)}
                      onClick={async () => {
                        try {
                          await removeMyAvatar();
                          setAvatarFile(null);
                          setAvatarPreview('');
                          await qc.invalidateQueries({ queryKey: ['me', 'profile-full'] });
                          toast.success('Photo removed');
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : 'Failed to remove photo');
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={profileData.headline}
                      onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g. Meditation practitioner · Volunteer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://example.com"
                    />
                    {isEditing ? <SocialLinkPeek platform="website" raw={profileData.website} /> : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself…"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                      disabled={!isEditing}
                      placeholder="@username"
                    />
                    {isEditing ? <SocialLinkPeek platform="instagram" raw={profileData.instagram} /> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                      disabled={!isEditing}
                      placeholder="linkedin.com/in/..."
                    />
                    {isEditing ? <SocialLinkPeek platform="linkedin" raw={profileData.linkedin} /> : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-national">Phone</Label>
                    <div className="flex gap-2">
                      <Select
                        value={profileData.phoneDial || DEFAULT_PHONE_DIAL}
                        onValueChange={(phoneDial) => setProfileData((p) => ({ ...p, phoneDial }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="h-11 w-[124px] shrink-0 px-2" id="phone-dial">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {!PHONE_DIAL_OPTIONS.some((o) => o.dial === profileData.phoneDial) &&
                          profileData.phoneDial ? (
                            <SelectItem value={profileData.phoneDial}>{profileData.phoneDial}</SelectItem>
                          ) : null}
                          {PHONE_DIAL_OPTIONS.map((o) => (
                            <SelectItem key={o.dial} value={o.dial}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone-national"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        className="min-w-0 flex-1"
                        placeholder="Mobile number"
                        value={profileData.phoneNational}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phoneNational: e.target.value.replace(/[^\d]/g, ''),
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-national">WhatsApp</Label>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Optional. Turn off “same as phone” only if different.
                      </p>
                      <label
                        className={cn(
                          "flex items-center gap-2 text-xs text-muted-foreground select-none",
                          !isEditing && "opacity-70"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={whatsappSameAsPhone}
                          onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                          disabled={!isEditing}
                        />
                        Same as phone
                      </label>
                    </div>

                    {!whatsappSameAsPhone ? (
                      <div className="flex gap-2">
                        <Select
                          value={profileData.whatsappDial || DEFAULT_PHONE_DIAL}
                          onValueChange={(whatsappDial) => setProfileData((p) => ({ ...p, whatsappDial }))}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="h-11 w-[124px] shrink-0 px-2" id="whatsapp-dial">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                          <SelectContent>
                            {!PHONE_DIAL_OPTIONS.some((o) => o.dial === profileData.whatsappDial) &&
                            profileData.whatsappDial ? (
                              <SelectItem value={profileData.whatsappDial}>{profileData.whatsappDial}</SelectItem>
                            ) : null}
                            {PHONE_DIAL_OPTIONS.map((o) => (
                              <SelectItem key={`wa-${o.dial}`} value={o.dial}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="whatsapp-national"
                          type="tel"
                          inputMode="tel"
                          className="min-w-0 flex-1"
                          placeholder="WhatsApp number (optional)"
                          value={profileData.whatsappNational}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              whatsappNational: e.target.value.replace(/[^\d]/g, ''),
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        WhatsApp will use your phone number.
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN / ZIP code</Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      id="pincode"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="e.g. 110001 (India)"
                      value={profileData.pincode}
                      onChange={(e) =>
                        setProfileData({ ...profileData, pincode: e.target.value.replace(/[^\d\w\s-]/g, '') })
                      }
                      onBlur={() => {
                        if (!isEditing) return;
                        const digits = profileData.pincode.replace(/\D/g, '');
                        if (digits.length === 6) void applyIndiaPincode(profileData.pincode);
                      }}
                      disabled={!isEditing}
                      className="sm:max-w-xs"
                    />
                    {isEditing ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        disabled={pincodeLookupBusy || profileData.pincode.replace(/\D/g, '').length !== 6}
                        onClick={() => void applyIndiaPincode(profileData.pincode)}
                      >
                        {pincodeLookupBusy ? 'Looking up…' : 'Fill address from PIN'}
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For India, enter 6 digits — we fill state, district and address. Other countries: use the lists
                    below.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={profileData.country || undefined}
                      onValueChange={(country) =>
                        setProfileData((p) => ({ ...p, country, state: '', city: '' }))
                      }
                      disabled={!isEditing || countriesGeoQ.isPending}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={countriesGeoQ.isPending ? 'Loading countries…' : 'Select country'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(countriesGeoQ.data ?? []).map((c) => (
                          <SelectItem key={c.code} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State / province</Label>
                    <Select
                      value={profileData.state || undefined}
                      onValueChange={(state) => setProfileData((p) => ({ ...p, state, city: '' }))}
                      disabled={!isEditing || !profileData.country?.trim() || statesGeoQ.isPending}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue
                          placeholder={
                            !profileData.country?.trim()
                              ? 'Select country first'
                              : statesGeoQ.isPending
                                ? 'Loading states…'
                                : 'Select state'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={profileData.city || undefined}
                    onValueChange={(city) => setProfileData((p) => ({ ...p, city }))}
                    disabled={!isEditing || !profileData.state?.trim() || citiesGeoQ.isPending}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          !profileData.state?.trim()
                            ? 'Select state first'
                            : citiesGeoQ.isPending
                              ? 'Loading cities…'
                              : 'Select city'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine">Full address</Label>
                  <Textarea
                    id="addressLine"
                    rows={3}
                    value={profileData.addressLine}
                    onChange={(e) => setProfileData({ ...profileData, addressLine: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Filled automatically from PIN, or type your address"
                    className="resize-y min-h-[5rem]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={profileData.education}
                      onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      value={profileData.skills}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={
                        profileData.gender &&
                        !GENDER_OPTIONS.some((g) => g.value === profileData.gender)
                          ? `__legacy__:${profileData.gender}`
                          : profileData.gender || '__none__'
                      }
                      onValueChange={(v) => {
                        if (v === '__none__') {
                          setProfileData((p) => ({ ...p, gender: '' }));
                          return;
                        }
                        if (v.startsWith('__legacy__:')) {
                          setProfileData((p) => ({ ...p, gender: v.replace(/^__legacy__:/, '') }));
                          return;
                        }
                        setProfileData((p) => ({ ...p, gender: v }));
                      }}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="gender" className="h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not specified</SelectItem>
                        {profileData.gender &&
                        !GENDER_OPTIONS.some((g) => g.value === profileData.gender) ? (
                          <SelectItem value={`__legacy__:${profileData.gender}`}>
                            {profileData.gender} (saved)
                          </SelectItem>
                        ) : null}
                        {GENDER_OPTIONS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableFrom">Available from</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      value={profileData.availableFrom}
                      onChange={(e) => setProfileData({ ...profileData, availableFrom: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={profileData.duration}
                    onChange={(e) => setProfileData({ ...profileData, duration: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. 3 months"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {saveM.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                  </div>

                  <aside className="lg:sticky lg:top-24">
                    <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-background p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Live strength
                          </p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {liveStrengthPercent}%{' '}
                            <span className="text-xs font-medium text-muted-foreground">right now</span>
                          </p>
                        </div>
                        <div className="shrink-0">
                          <ProfileStrengthMeter value={liveStrengthPercent} className="w-[210px] max-w-[210px]" />
                        </div>
                      </div>

                      {!isEditing ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Click <span className="font-medium text-foreground">Edit Profile</span> to see live changes.
                        </p>
                      ) : null}

                      <div className="mt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Biggest upgrades
                        </p>
                        <div className="mt-2 grid gap-2">
                          {liveStrengthBreakdown.gaps.slice(0, 6).map((f) => (
                            <div
                              key={f.key}
                              className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-foreground">{f.label}</p>
                                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{f.tip}</p>
                              </div>
                              <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold tabular-nums text-primary">
                                +{f.pointsIfFilled}%
                              </span>
                            </div>
                          ))}
                          {liveStrengthBreakdown.gaps.length === 0 ? (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3 text-xs text-emerald-900 dark:text-emerald-100/90">
                              Everything is filled in this model — your profile is strong.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 min-w-0 overflow-x-hidden lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="overflow-hidden min-w-0 max-w-full">
                <CardHeader className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password & protection
                  </CardTitle>
                  <CardDescription>Rotate your password and keep attackers out.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-5 min-w-0">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-current">Current</Label>
                      <Input
                        id="sec-current"
                        type="password"
                        value={securityPw.current}
                        onChange={(e) => setSecurityPw((p) => ({ ...p, current: e.target.value }))}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full min-w-0"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-new">New</Label>
                      <Input
                        id="sec-new"
                        type="password"
                        value={securityPw.next}
                        onChange={(e) => setSecurityPw((p) => ({ ...p, next: e.target.value }))}
                        placeholder="Min 10 chars, A/a/0"
                        autoComplete="new-password"
                        className="w-full min-w-0"
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-confirm">Confirm</Label>
                      <Input
                        id="sec-confirm"
                        type="password"
                        value={securityPw.confirm}
                        onChange={(e) => setSecurityPw((p) => ({ ...p, confirm: e.target.value }))}
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        className="w-full min-w-0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => changePasswordM.mutate()} disabled={changePasswordM.isPending}>
                      {changePasswordM.isPending ? 'Updating…' : 'Update password'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This will revoke other active sessions for your account.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
                    <p className="text-sm font-semibold">Security checklist</p>
                    <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                      <li>Use a unique password (never reused)</li>
                      <li>Enable 2FA below (recommended)</li>
                      <li>Review active sessions and revoke unknown devices</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6 min-w-0">
                <Card className="overflow-hidden min-w-0 max-w-full">
                  <CardHeader className="border-b border-border/60 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10">
                    <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
                    <CardDescription>Works with Google Authenticator, Microsoft Authenticator, Authy, etc.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Status</p>
                        <p className="text-sm text-muted-foreground">
                          {twoFaStatusQ.data?.data?.enabled ? 'Enabled' : 'Not enabled'}
                        </p>
                      </div>
                      {!twoFaStatusQ.data?.data?.enabled ? (
                        <Button
                          variant="outline"
                          onClick={() => start2faM.mutate()}
                          disabled={start2faM.isPending}
                        >
                          {start2faM.isPending ? 'Starting…' : 'Start setup'}
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                          Protected
                        </Badge>
                      )}
                    </div>

                    {twoFaSetup && !twoFaStatusQ.data?.data?.enabled && (
                      <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3 min-w-0 overflow-x-hidden">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">Step 1: Add to authenticator</p>
                          <p className="text-xs text-muted-foreground">
                            Copy this secret into your authenticator app (setup expires at {new Date(twoFaSetup.expiresAt).toLocaleString()}).
                          </p>
                        </div>
                        <div className="grid gap-2 min-w-0">
                          <div className="space-y-1">
                            <Label>Secret</Label>
                            <Input value={twoFaSetup.secret} readOnly className="w-full min-w-0 font-mono text-xs" />
                          </div>
                          <div className="space-y-1">
                            <Label>otpauth URL</Label>
                            <Input
                              value={twoFaSetup.otpauthUrl}
                              readOnly
                              className="w-full min-w-0 font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Step 2: Verify</p>
                          <div className="flex flex-wrap items-end gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="twofa-code">6-digit code</Label>
                              <Input
                                id="twofa-code"
                                value={twoFaCode}
                                onChange={(e) => setTwoFaCode(e.target.value)}
                                placeholder="123 456"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                className="w-44"
                              />
                            </div>
                            <Button onClick={() => enable2faM.mutate()} disabled={enable2faM.isPending}>
                              {enable2faM.isPending ? 'Enabling…' : 'Enable 2FA'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {twoFaRecoveryCodes && twoFaRecoveryCodes.length > 0 && (
                      <div className="rounded-2xl border border-border/60 bg-amber-500/10 p-4">
                        <p className="text-sm font-semibold">Recovery codes (save now)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Store these somewhere safe. Each code works once.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                          {twoFaRecoveryCodes.map((c) => (
                            <div key={c} className="rounded-lg border border-border/60 bg-background/70 px-2 py-2">
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {twoFaStatusQ.data?.data?.enabled && (
                      <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 space-y-3">
                        <p className="text-sm font-semibold">Disable 2FA</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={twoFaDisable.password}
                              onChange={(e) => setTwoFaDisable((p) => ({ ...p, password: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Code or recovery</Label>
                            <Input
                              value={twoFaDisable.code}
                              onChange={(e) => setTwoFaDisable((p) => ({ ...p, code: e.target.value }))}
                              placeholder="123 456 or ABCDE-FGHIJ"
                            />
                          </div>
                        </div>
                        <Button variant="destructive" onClick={() => disable2faM.mutate()} disabled={disable2faM.isPending}>
                          {disable2faM.isPending ? 'Disabling…' : 'Disable 2FA'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden min-w-0 max-w-full">
                  <CardHeader className="border-b border-border/60">
                    <CardTitle>Active sessions</CardTitle>
                    <CardDescription>See where your account is signed in and revoke access instantly.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Button variant="outline" onClick={() => sessionsQ.refetch()} disabled={sessionsQ.isFetching}>
                        {sessionsQ.isFetching ? 'Refreshing…' : 'Refresh'}
                      </Button>
                      <Button variant="destructive" onClick={() => revokeOthersM.mutate()} disabled={revokeOthersM.isPending}>
                        {revokeOthersM.isPending ? 'Revoking…' : 'Revoke other sessions'}
                      </Button>
                    </div>

                    {(sessionsQ.data?.data?.items || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sessions found.</p>
                    ) : (
                      <div className="space-y-2">
                        {(sessionsQ.data?.data?.items || []).map((s) => (
                          <div
                            key={s.id}
                            className={cn(
                              'rounded-2xl border border-border/60 bg-background/60 p-3',
                              s.isCurrent ? 'ring-1 ring-emerald-500/20' : ''
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold truncate">
                                    {s.userAgent ? s.userAgent : 'Unknown device'}
                                  </p>
                                  {s.isCurrent ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">Current</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-muted/60">Active</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {s.ip ? `IP: ${s.ip} • ` : ''}
                                  Created: {new Date(s.createdAt).toLocaleString()} • Expires: {new Date(s.expiresAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!!s.isCurrent || revokeSessionM.isPending}
                                onClick={() => revokeSessionM.mutate(s.id)}
                              >
                                Revoke
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
                <CardDescription>
                  Track achievements, seva, programs, events, services, and personal notes — everything shows up in your resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Real-time tracking + summary */}
                <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">Session log</p>
                        <p className="text-xs text-muted-foreground">
                          Log activities even if you didn’t keep the site open — add start/end time and we auto-calculate hours.
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-muted/60 ring-1 ring-border/60">Smart hours</Badge>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-[200px_1fr]">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={quickSession.kind}
                          onValueChange={(v) => setQuickSession((p) => ({ ...p, kind: v as any }))}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seva">Seva</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="program">Program</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                            <SelectItem value="achievement">Achievement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={quickSession.title}
                          onChange={(e) => setQuickSession((p) => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. Seva kitchen shift"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Started at</Label>
                        <Input
                          type="datetime-local"
                          value={quickSession.startedAt}
                          onChange={(e) => setQuickSession((p) => ({ ...p, startedAt: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ended at</Label>
                        <Input
                          type="datetime-local"
                          value={quickSession.endedAt}
                          onChange={(e) => setQuickSession((p) => ({ ...p, endedAt: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px] md:items-end">
                      <div className="space-y-2">
                        <Label>Location (optional)</Label>
                        <Input
                          value={quickSession.location}
                          onChange={(e) => setQuickSession((p) => ({ ...p, location: e.target.value }))}
                          placeholder="e.g. Kitchen area"
                        />
                      </div>
                      <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Auto hours</p>
                        <p className="mt-1 text-xl font-semibold tabular-nums">
                          {computedQuickHours != null ? `${computedQuickHours}h` : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={async () => {
                          if (!quickSession.title.trim()) {
                            toast.error('Title is required.');
                            return;
                          }
                          if (computedQuickHours == null) {
                            toast.error('Please set valid start/end time.');
                            return;
                          }
                          try {
                            await createMyActivity({
                              kind: quickSession.kind,
                              title: quickSession.title.trim(),
                              location: quickSession.location.trim() || undefined,
                              startDate: quickSession.startedAt,
                              endDate: quickSession.endedAt,
                              hours: computedQuickHours,
                            });
                            await qc.invalidateQueries({ queryKey: ['me', 'activities', 'all'] });
                            toast.success('Saved');
                            setQuickSession((p) => ({ ...p, title: '', location: '' }));
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'Failed to save session');
                          }
                        }}
                      >
                        Save session
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const now = new Date();
                          const pad = (n: number) => String(n).padStart(2, '0');
                          const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                          setQuickSession((p) => ({ ...p, startedAt: local, endedAt: local }));
                        }}
                      >
                        Set to now
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">Your progress</p>
                        <p className="text-xs text-muted-foreground">Quick insights to help you stay consistent.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={activityRange} onValueChange={(v) => setActivityRange(v as any)}>
                          <SelectTrigger className="h-9 w-[150px]">
                            <SelectValue placeholder="Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={exportActivitiesCsv} disabled={rangedActivities.length === 0}>
                          Export CSV
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Entries</p>
                        <p className="mt-1 text-xl font-semibold tabular-nums">{activityStats.totalItems}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Hours logged</p>
                        <p className="mt-1 text-xl font-semibold tabular-nums">{Math.round(activityStats.totalHours * 100) / 100}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Top categories</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activityStats.topKinds.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Add a few activities to see insights.</span>
                        ) : (
                          activityStats.topKinds.map(([k, v]) => (
                            <Badge key={k} variant="secondary" className="bg-muted/60 ring-1 ring-border/60">
                              {k} · {v.count}
                              {v.hours ? ` · ${Math.round(v.hours * 10) / 10}h` : ''}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="space-y-2">
                    <Label htmlFor="activity-title">{editingActivityId ? 'Edit activity' : 'Add activity'}</Label>
                    <Input
                      id="activity-title"
                      value={activityDraft.title}
                      onChange={(e) => setActivityDraft((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Volunteered at seva kitchen"
                      disabled={upsertActivityM.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={activityDraft.kind}
                      onValueChange={(kind) => setActivityDraft((p) => ({ ...p, kind: kind as any }))}
                      disabled={upsertActivityM.isPending}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="seva">Seva</SelectItem>
                        <SelectItem value="program">Program</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="activity-org">Organization (optional)</Label>
                    <Input
                      id="activity-org"
                      value={activityDraft.org}
                      onChange={(e) => setActivityDraft((p) => ({ ...p, org: e.target.value }))}
                      placeholder="e.g. The Art of Living"
                      disabled={upsertActivityM.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-location">Location (optional)</Label>
                    <Input
                      id="activity-location"
                      value={activityDraft.location}
                      onChange={(e) => setActivityDraft((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Bangalore"
                      disabled={upsertActivityM.isPending}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="activity-start">Start date (optional)</Label>
                    <Input
                      id="activity-start"
                      type="date"
                      value={activityDraft.startDate}
                      onChange={(e) => setActivityDraft((p) => ({ ...p, startDate: e.target.value }))}
                      disabled={upsertActivityM.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-end">End date (optional)</Label>
                    <Input
                      id="activity-end"
                      type="date"
                      value={activityDraft.endDate}
                      onChange={(e) => setActivityDraft((p) => ({ ...p, endDate: e.target.value }))}
                      disabled={upsertActivityM.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-hours">Hours (optional)</Label>
                    <Input
                      id="activity-hours"
                      inputMode="decimal"
                      value={activityDraft.hours}
                      onChange={(e) => setActivityDraft((p) => ({ ...p, hours: e.target.value.replace(/[^\d.]/g, '') }))}
                      placeholder="e.g. 12"
                      disabled={upsertActivityM.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-desc">Description (optional)</Label>
                  <Textarea
                    id="activity-desc"
                    value={activityDraft.description}
                    onChange={(e) => setActivityDraft((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Add details that make this feel real: what you did, outcomes, learnings…"
                    className="min-h-[96px]"
                    disabled={upsertActivityM.isPending}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => upsertActivityM.mutate()}
                    disabled={!activityDraft.title.trim() || upsertActivityM.isPending}
                  >
                    {upsertActivityM.isPending ? 'Saving…' : editingActivityId ? 'Update activity' : 'Add activity'}
                  </Button>
                  {editingActivityId ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingActivityId(null);
                        setActivityDraft({
                          kind: 'achievement',
                          title: '',
                          description: '',
                          org: '',
                          department: '',
                          location: '',
                          startDate: '',
                          endDate: '',
                          hours: '',
                        });
                      }}
                    >
                      Cancel edit
                    </Button>
                  ) : null}
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="space-y-2">
                    <Label htmlFor="activity-search">Search</Label>
                    <Input
                      id="activity-search"
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      placeholder="Search by title, org, location…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Filter</Label>
                    <Select
                      value={activityFilterKind}
                      onValueChange={(v) => setActivityFilterKind(v as any)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="achievement">Achievements</SelectItem>
                        <SelectItem value="seva">Seva</SelectItem>
                        <SelectItem value="program">Programs</SelectItem>
                        <SelectItem value="event">Events</SelectItem>
                        <SelectItem value="service">Services</SelectItem>
                        <SelectItem value="note">Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {activitiesQ.isPending ? (
                  <div className="py-6">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="mt-2 h-10 w-[85%] rounded-xl" />
                    <Skeleton className="mt-2 h-10 w-[92%] rounded-xl" />
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-medium">No activities yet.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add your first activity above — it will appear here and in your resume export.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredActivities.map((a: any) => {
                      const dates = a.startDate || a.endDate
                        ? `${a.startDate ? String(a.startDate).slice(0, 10) : ''}${a.endDate ? ` → ${String(a.endDate).slice(0, 10)}` : ''}`.replace(/^ → /, '')
                        : '';
                      const meta = [
                        a.org ? String(a.org) : null,
                        a.location ? String(a.location) : null,
                        typeof a.hours === 'number' ? `${a.hours}h` : null,
                        dates || null,
                      ].filter(Boolean).join(' · ');

                      return (
                        <div
                          key={a._id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-background/60 p-3 shadow-sm"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="bg-muted/60 ring-1 ring-border/60">
                                {a.kind}
                              </Badge>
                              <p className="font-medium truncate">{a.title}</p>
                            </div>
                            {meta ? (
                              <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                            ) : null}
                            {a.description ? (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.description}</p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingActivityId(a._id);
                                setActivityDraft({
                                  kind: (a.kind || 'achievement') as any,
                                  title: a.title || '',
                                  description: a.description || '',
                                  org: a.org || '',
                                  department: a.department || '',
                                  location: a.location || '',
                                  startDate: a.startDate ? String(a.startDate).slice(0, 10) : '',
                                  endDate: a.endDate ? String(a.endDate).slice(0, 10) : '',
                                  hours: typeof a.hours === 'number' ? String(a.hours) : '',
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteActivityM.mutate(a._id)}
                              disabled={deleteActivityM.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Tab — tall pane (same budget as before: ~1.5× viewport min) so compose + preview get full vertical room */}
          <TabsContent
            value="resume"
            className="mt-6 flex h-[calc(min(92vh,calc(100dvh_-_8rem))*1.5)] min-h-[42rem] flex-col overflow-hidden outline-none data-[state=inactive]:hidden sm:mt-8"
          >
            <ResumeStudio
              profileReady={meQ.isSuccess}
              initialResume={meQ.data?.data?.resume ?? null}
              displayName={profileData.name || authUser?.name || 'Your name'}
              displayEmail={profileData.email || authUser?.email || ''}
              displayPhone={composedPhone || ''}
              displayWhatsapp={composedWhatsapp || ''}
              profileDetailLines={resumeProfileLines}
              achievements={(achievementsQ.data?.data?.items ?? []) as Array<{ _id?: string; title: string; description?: string }>}
              profileForResumeMerge={profileForResumeMerge}
            />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky save bar while editing */}
        {isEditing && (
          <div className="fixed inset-x-0 bottom-0 z-40">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="container pointer-events-auto max-w-6xl px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/75 p-3 shadow-[0_18px_60px_-40px_hsl(var(--foreground)/0.35)] backdrop-blur-xl">
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">
                    {isDirty ? 'Unsaved changes' : 'Editing'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDirty ? 'Save to apply updates across the platform.' : 'Make your changes, then save.'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" onClick={handleCancel} className="rounded-xl">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveM.mutate()}
                    disabled={saveM.isPending || !isDirty}
                    className="rounded-xl"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveM.isPending ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
