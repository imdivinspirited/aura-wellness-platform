/**
 * Profile Overview — dashboard-style layout (memoized for stable child props).
 */
import { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Edit,
  Globe,
  GraduationCap,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProfileStrengthMeter } from '@/components/profile/ProfileStrengthMeter';
import { ProfileStrengthAnalysisDialog } from '@/components/profile/ProfileStrengthAnalysisDialog';
import { ShareProfileDialog } from '@/components/profile/ShareProfileDialog';
import {
  computeProfileCompletenessPercent,
  getProfileEnhancementHint,
  structuredLocationRedundantWithAddressLine,
  type ProfileCompletenessInput,
} from '@/lib/profileOverviewUtils';
import {
  instagramProfileHref,
  linkedinProfileHref,
  websiteProfileHref,
} from '@/lib/socialLinks';
import { SocialProfilePreviewCards } from '@/components/profile/SocialProfilePreviewCards';
import type { CartItem } from '@/lib/cart/types';
import { getAbsoluteSiteUrl, getPublicProfilePath } from '@/lib/routes';

function mailtoHref(email: string) {
  const e = email.trim();
  return e ? `mailto:${encodeURIComponent(e)}` : '';
}

function waMeHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export type OverviewProfileData = {
  name: string;
  email: string;
  headline: string;
  bio: string;
  phoneDial: string;
  phoneNational: string;
  whatsappDial: string;
  whatsappNational: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  addressLine: string;
  education: string;
  skills: string;
  gender: string;
  instagram: string;
  linkedin: string;
  website: string;
};

export type ProfileOverviewSectionProps = {
  profileData: OverviewProfileData;
  avatarDisplaySrc: string;
  composedPhone: string;
  composedWhatsapp: string;
  serverUserId?: string;
  authUserId?: string;
  onEditProfile: () => void;
  onCopyPublicLink: () => void;
  itemCount: number;
  unreadCount: number;
  recentCartItems: CartItem[];
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export const ProfileOverviewSection = memo(function ProfileOverviewSection({
  profileData,
  avatarDisplaySrc,
  composedPhone,
  composedWhatsapp,
  serverUserId,
  authUserId,
  onEditProfile,
  onCopyPublicLink,
  itemCount,
  unreadCount,
  recentCartItems,
}: ProfileOverviewSectionProps) {
  const completenessInput: ProfileCompletenessInput = useMemo(
    () => ({
      name: profileData.name,
      email: profileData.email,
      headline: profileData.headline,
      bio: profileData.bio,
      phoneNational: profileData.phoneNational,
      whatsappNational: profileData.whatsappNational,
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
    [profileData],
  );

  const completeness = useMemo(
    () => computeProfileCompletenessPercent(completenessInput),
    [completenessInput],
  );
  const hint = useMemo(() => getProfileEnhancementHint(completenessInput), [completenessInput]);

  const locationBlock = useMemo(() => {
    const addr = profileData.addressLine?.trim() ?? '';
    const city = profileData.city?.trim() ?? '';
    const state = profileData.state?.trim() ?? '';
    const country = profileData.country?.trim() ?? '';
    const pin = profileData.pincode?.trim() ?? '';
    const hasLoc = [addr, city, state, country, pin].some((x) => x);
    if (!hasLoc) return null;
    const locSecondary = [city, state, country, pin ? `PIN ${pin}` : ''].filter(Boolean).join(', ');
    const redundant = structuredLocationRedundantWithAddressLine(addr, city, state, pin);
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-muted/25 p-4 text-sm backdrop-blur-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
          {addr ? <span className="block text-foreground">{addr}</span> : null}
          {!addr ? (
            <span className="block text-muted-foreground">{locSecondary}</span>
          ) : redundant ? (
            country && !addr.toLowerCase().includes(country.toLowerCase()) ? (
              <span className="block text-muted-foreground">{country}</span>
            ) : null
          ) : (
            <span className="block text-muted-foreground">{locSecondary}</span>
          )}
        </div>
      </div>
    );
  }, [profileData]);

  const hasPublicLink = Boolean(serverUserId || authUserId);
  const headlineTrim = profileData.headline?.trim() ?? '';
  const bioTrim = profileData.bio?.trim() ?? '';
  const hasHeadline = Boolean(headlineTrim);
  const showAboutYouBlock = Boolean(bioTrim && hasHeadline);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const publicProfileUrl = useMemo(() => {
    const id = serverUserId || authUserId;
    if (!id) return '';
    return getAbsoluteSiteUrl(getPublicProfilePath(id));
  }, [serverUserId, authUserId]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero */}
      <section
        aria-labelledby="profile-overview-title"
        className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[0_24px_60px_-32px_hsl(var(--foreground)/0.18)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background:
              'radial-gradient(1200px 400px at 10% -20%, hsl(var(--primary) / 0.14), transparent 55%), radial-gradient(900px 360px at 90% 0%, hsl(var(--secondary) / 0.12), transparent 50%), radial-gradient(700px 280px at 50% 120%, hsl(var(--accent) / 0.1), transparent 45%)',
          }}
        />
        <div className="relative p-5 sm:p-8 lg:p-10">
          {/* Profile + meter side-by-side (70/30) — not stacked vertically */}
          <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-start gap-4 sm:gap-8 lg:gap-10">
            <div className="min-w-0">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div
                    className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/50 via-secondary/30 to-accent/40 opacity-80 blur-md"
                    aria-hidden
                  />
                  <Avatar className="relative h-28 w-28 border-4 border-background shadow-xl sm:h-32 sm:w-32">
                    <AvatarImage src={avatarDisplaySrc} alt={profileData.name || 'Profile photo'} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-3xl font-display text-primary-foreground">
                      {profileData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p
                    id="profile-overview-title"
                    className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary/90"
                  >
                    Your space
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {profileData.name || 'Your profile'}
                  </h2>
                  {hasHeadline ? (
                    <p className="mt-2 text-base font-medium text-muted-foreground sm:text-lg">{headlineTrim}</p>
                  ) : bioTrim ? (
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {bioTrim}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground/85">
                      Open <span className="font-medium text-foreground/90">Edit profile</span> to add a headline, bio,
                      and other details.
                    </p>
                  )}
                  {profileData.email ? (
                    <p className="mt-3 inline-flex max-w-full items-center gap-2 truncate rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm sm:text-sm">
                      <span className="truncate">{profileData.email}</span>
                    </p>
                  ) : null}

                  <div className="mt-6 flex w-full max-w-md flex-col gap-2 sm:max-w-lg sm:flex-row sm:flex-wrap">
                    {hasPublicLink ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 justify-center gap-2 rounded-xl border-2 border-primary/40 bg-background text-foreground shadow-sm hover:bg-muted/60 hover:text-foreground dark:border-primary/50 dark:bg-background/80 sm:min-w-[160px]"
                        onClick={onCopyPublicLink}
                      >
                        <Link2 className="h-4 w-4 shrink-0" />
                        Copy public link
                      </Button>
                    ) : null}
                    {hasPublicLink && publicProfileUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 justify-center gap-2 rounded-xl border-border/60 bg-background/80 text-foreground shadow-sm hover:bg-muted/60 sm:min-w-[140px]"
                        onClick={() => setShareOpen(true)}
                      >
                        <Mail className="h-4 w-4 shrink-0" aria-hidden />
                        Share
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      className="h-11 flex-1 justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 sm:min-w-[140px]"
                      onClick={onEditProfile}
                    >
                      <Edit className="h-4 w-4" />
                      Edit profile
                    </Button>
                  </div>

                  {hint ? (
                    <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{hint}</p>
                  ) : (
                    <div className="mt-4 max-w-xl space-y-2">
                      {profileData.education?.trim() || profileData.skills?.trim() ? (
                        <div className="space-y-2">
                          {profileData.education?.trim() ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Education
                              </span>
                              <Badge variant="secondary" className="rounded-full">
                                {profileData.education.trim()}
                              </Badge>
                            </div>
                          ) : null}
                          {profileData.skills?.trim() ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Skills
                              </span>
                              {profileData.skills
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean)
                                .slice(0, 6)
                                .map((s) => (
                                  <Badge key={s} variant="outline" className="rounded-full">
                                    {s}
                                  </Badge>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="flex max-w-xl items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400/90 sm:text-sm">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          Add your <span className="font-medium">education</span> and <span className="font-medium">skills</span> to strengthen your profile.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-col items-stretch gap-3 self-start pt-1 sm:items-end sm:pt-0">
              <div className="flex w-full justify-end">
                <ProfileStrengthMeter value={completeness} className="w-full max-w-[min(280px,100%)] scale-[0.92] sm:scale-100" />
              </div>
              <div className="w-full max-w-[min(280px,100%)] space-y-2 sm:ml-auto">
                <p className="text-[11px] leading-snug text-muted-foreground sm:text-right">
                  Field-by-field impact, strong vs missing areas, and what raises your score the most.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-full gap-2 rounded-xl border-primary/35 bg-background/80 text-xs font-medium shadow-sm hover:bg-muted/50 sm:min-w-[200px]"
                  onClick={() => setAnalysisOpen(true)}
                >
                  <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Full profile analysis
                </Button>
              </div>
            </div>
          </div>

          <ProfileStrengthAnalysisDialog
            open={analysisOpen}
            onOpenChange={setAnalysisOpen}
            input={completenessInput}
            onEditProfile={onEditProfile}
          />
          {publicProfileUrl ? (
            <ShareProfileDialog
              open={shareOpen}
              onOpenChange={setShareOpen}
              publicUrl={publicProfileUrl}
              name={profileData.name}
            />
          ) : null}

          {showAboutYouBlock ? (
            <motion.div
              className="relative mt-8 rounded-2xl border border-border/40 bg-background/60 p-5 backdrop-blur-md sm:p-6"
              {...fadeUp}
              transition={{ duration: 0.35 }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">About you</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">{bioTrim}</p>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Contact + location + education bento */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card via-card to-muted/10 p-5 shadow-sm sm:p-6",
            "shadow-[0_20px_50px_-34px_hsl(var(--foreground)/0.18)]",
          )}
          {...fadeUp}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reach you</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Fast ways to connect</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep at least one channel active so people can reach you easily.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {profileData.email?.trim() ? (
              <a
                href={mailtoHref(profileData.email)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#EA4335]/15 via-[#FBBC05]/10 to-[#34A853]/15 text-foreground ring-1 ring-border/50">
                    <Mail className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Email</p>
                    <p className="truncate text-xs text-muted-foreground">{profileData.email.trim()}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:underline">Write</span>
              </a>
            ) : null}

            {composedPhone?.trim() ? (
              <a
                href={`tel:${composedPhone.replace(/\s/g, '')}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-border/50 transition-colors group-hover:bg-primary/15">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Call</p>
                    <p className="truncate text-xs text-muted-foreground">{composedPhone}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:underline">Call</span>
              </a>
            ) : null}
            {composedWhatsapp?.trim() && waMeHref(composedWhatsapp) ? (
              <a
                href={waMeHref(composedWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 ring-1 ring-border/50 dark:text-emerald-400">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">WhatsApp</p>
                    <p className="truncate text-xs text-muted-foreground">{composedWhatsapp}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 group-hover:underline dark:text-emerald-400">
                  Chat
                </span>
              </a>
            ) : null}
            {!profileData.email?.trim() &&
            !composedPhone?.trim() &&
            !(composedWhatsapp?.trim() && waMeHref(composedWhatsapp)) ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 p-5 text-center">
                <p className="text-sm font-medium text-foreground">No contact details yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add email, phone, or WhatsApp in <span className="font-medium">Edit profile</span>.
                </p>
              </div>
            ) : null}
          </div>
        </motion.div>

        {locationBlock ? (
          <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.08 }}>
            {locationBlock}
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 p-6 text-center"
            {...fadeUp}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">No location yet — add it under Profile for better context.</p>
          </motion.div>
        )}
      </div>

      {(profileData.education?.trim() || profileData.skills?.trim()) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {profileData.education?.trim() ? (
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary-foreground">
                  <GraduationCap className="h-5 w-5 text-secondary" aria-hidden />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Education</p>
                  <p className="mt-1 leading-relaxed text-foreground">{profileData.education}</p>
                </div>
              </div>
            </div>
          ) : null}
          {profileData.skills?.trim() ? (
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Skills</p>
                  <p className="mt-1 leading-relaxed text-foreground">{profileData.skills}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Social */}
      <section className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/30 via-card to-card p-5 sm:p-6" aria-label="Social profiles">
        {profileData.instagram?.trim() || profileData.linkedin?.trim() || profileData.website?.trim() ? (
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preview cards</p>
            <SocialProfilePreviewCards
              instagram={profileData.instagram}
              linkedin={profileData.linkedin}
              website={profileData.website}
              className="mt-3"
            />
          </div>
        ) : null}

        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick connect</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {profileData.email?.trim() ? (
            <a
              href={mailtoHref(profileData.email)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#EA4335] via-[#FBBC05] to-[#34A853] text-white shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 dark:ring-white/10"
              aria-label="Email"
              title="Email"
            >
              <Mail className="h-5 w-5" strokeWidth={2.25} />
            </a>
          ) : null}
          {profileData.linkedin?.trim() ? (
            <a
              href={linkedinProfileHref(profileData.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-[#0A66C2] text-white shadow-md transition-transform hover:scale-105"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          ) : null}
          {profileData.instagram?.trim() ? (
            <a
              href={instagramProfileHref(profileData.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-md transition-transform hover:scale-105"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          ) : null}
          {profileData.website?.trim() ? (
            <a
              href={websiteProfileHref(profileData.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm transition-transform hover:scale-105"
              aria-label="Website"
            >
              <Globe className="h-5 w-5" />
            </a>
          ) : null}
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Cart',
            icon: ShoppingCart,
            value: itemCount,
            sub: 'Items ready',
            link: '/cart',
            linkLabel: 'View cart',
            showLink: itemCount > 0,
          },
          {
            title: 'Programs',
            icon: BookOpen,
            value: 0,
            sub: 'Enrolled',
            link: '/programs',
            linkLabel: 'Browse',
            showLink: true,
          },
          {
            title: 'Alerts',
            icon: Bell,
            value: unreadCount,
            sub: 'Unread',
            link: '#',
            linkLabel: '',
            showLink: false,
          },
        ].map((s) => (
          <motion.div
            key={s.title}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300',
              'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5',
            )}
            {...fadeUp}
            transition={{ duration: 0.28 }}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <s.icon className="h-9 w-9 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-3xl font-semibold tabular-nums tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </div>
            {s.showLink && s.linkLabel ? (
              <Button variant="link" className="mt-2 h-auto px-0 text-primary" asChild>
                <Link to={s.link}>{s.linkLabel}</Link>
              </Button>
            ) : null}
          </motion.div>
        ))}
      </div>

      {/* Activity */}
      <section
        className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
        aria-labelledby="recent-activity-heading"
      >
        <div className="border-b border-border/50 bg-muted/20 px-5 py-4 sm:px-6">
          <h3 id="recent-activity-heading" className="font-display text-lg font-semibold">
            Recent activity
          </h3>
          <p className="text-sm text-muted-foreground">Cart and interactions at a glance</p>
        </div>
        <div className="p-5 sm:p-6">
          {recentCartItems.length > 0 ? (
            <ul className="space-y-0 divide-y divide-border/60">
              {recentCartItems.map((item) => (
                <li key={item.itemId} className="flex items-center gap-4 py-4 first:pt-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {item.itemType}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 py-14 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="h-8 w-8 text-primary" aria-hidden />
              </div>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                No activity yet. Explore programs and services — your journey will show up here.
              </p>
              <Button className="mt-6 rounded-xl" asChild>
                <Link to="/programs">Browse programs</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
});
