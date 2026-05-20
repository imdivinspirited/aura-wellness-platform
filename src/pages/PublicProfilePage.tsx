/**
 * Public profile — opened via shared link `/u/:userId` (no login).
 * Server omits email, phone, WhatsApp, street address, and PIN.
 */
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicProfile } from '@/lib/api/profile';
import { SocialProfilePreviewCards } from '@/components/profile/SocialProfilePreviewCards';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const q = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => getPublicProfile(userId!),
    enabled: Boolean(userId?.trim()),
  });

  const data = q.data?.data;
  const details = data?.details;
  const name = data?.user?.name || 'Member';
  const avatarBase = details?.avatarUrl || '';
  const v = details?.avatarUpdatedAt;
  const avatarSrc =
    avatarBase && !avatarBase.startsWith('blob:')
      ? v
        ? `${avatarBase.split('?')[0]}?v=${encodeURIComponent(String(v))}`
        : avatarBase
      : '';

  const loc = [details?.city, details?.state, details?.country].filter(Boolean).join(', ');

  if (q.isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-10">
          <Skeleton className="mb-6 h-9 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (q.isError || !data) {
    return (
      <MainLayout>
        <div className="container max-w-lg py-16 text-center">
          <h1 className="font-display text-2xl font-semibold text-foreground">Profile unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {q.error instanceof Error ? q.error.message : 'This link may be invalid or the profile was removed.'}
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back home
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8 sm:py-10">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2 text-muted-foreground" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={avatarSrc || undefined} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl text-primary-foreground">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle className="text-2xl">{name}</CardTitle>
                {details?.headline ? (
                  <CardDescription className="text-base font-medium text-foreground/80">{details.headline}</CardDescription>
                ) : (
                  <CardDescription className="text-sm">Aura Wellness member</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {details?.bio?.trim() ? (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{details.bio.trim()}</p>
              </div>
            ) : null}

            {loc ? (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="text-muted-foreground">{loc}</span>
              </div>
            ) : null}

            {details?.instagram?.trim() || details?.linkedin?.trim() || details?.website?.trim() ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Connect</p>
                <SocialProfilePreviewCards
                  instagram={details.instagram || ''}
                  linkedin={details.linkedin || ''}
                  website={details.website || ''}
                />
              </div>
            ) : null}

            {(details?.education?.trim() || details?.skills?.trim()) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {details?.education?.trim() ? (
                  <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card p-3 text-sm">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Education</p>
                      <p className="leading-snug">{details.education}</p>
                    </div>
                  </div>
                ) : null}
                {details?.skills?.trim() ? (
                  <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-card p-3 text-sm">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Skills</p>
                      <p className="leading-snug">{details.skills}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {data.achievements?.length ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Achievements</p>
                <ul className="space-y-2">
                  {data.achievements.map((a, i) => (
                    <li
                      key={`${a.title}-${i}`}
                      className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-foreground">{a.title}</p>
                      {a.description?.trim() ? (
                        <p className="mt-1 text-muted-foreground">{a.description.trim()}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Shared profile — contact details are hidden.{' '}
          <Link to="/auth/login" className="underline underline-offset-2 hover:text-foreground">
            Sign in
          </Link>{' '}
          to use your own dashboard.
        </p>
      </div>
    </MainLayout>
  );
}
