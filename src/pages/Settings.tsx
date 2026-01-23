import { MainLayout } from '@/components/layout/MainLayout';
import { useUserStore, LANGUAGES } from '@/stores/userStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Palette, Bell, Shield, Accessibility, Moon, Sun, Monitor, Lock, LogOut, Edit } from 'lucide-react';
import { useState } from 'react';
import { RootLoginModal } from '@/components/root/RootLoginModal';
import { useRootStore } from '@/stores/rootStore';
import { logoutRootUser, getSession } from '@/lib/root/auth';

const Settings = () => {
  const {
    language, setLanguage,
    appearance, setTheme, setThemePreset, setCalmMode, setFontSize, setReduceMotion, setHighContrast,
    notifications, setEmailNotifications, setInAppNotifications, setEventReminders, setNewsletter,
    accessibility, setScreenReader, setKeyboardNav, setFocusIndicators,
    privacy, setAnalyticsConsent, setPersonalizationConsent
  } = useUserStore();

  const { isActive, deactivateRootMode } = useRootStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const session = getSession();

  const handleLogout = () => {
    logoutRootUser();
    deactivateRootMode();
  };

  return (
    <MainLayout>
      <div className="container py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>

        <div className="space-y-6">
          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Language</CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as 'light' | 'dark' | 'system')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        appearance.theme === t.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Theme Preset</Label>
                <Select value={appearance.themePreset} onValueChange={(v) => setThemePreset(v as any)}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic-spiritual">Classic Spiritual</SelectItem>
                    <SelectItem value="ocean-calm">Ocean Calm</SelectItem>
                    <SelectItem value="forest-serenity">Forest Serenity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>Calm Mode</Label><p className="text-sm text-muted-foreground">Softer colors, reduced visuals</p></div>
                  <Switch checked={appearance.calmMode} onCheckedChange={setCalmMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>Reduce Motion</Label><p className="text-sm text-muted-foreground">Minimize animations</p></div>
                  <Switch checked={appearance.reduceMotion} onCheckedChange={setReduceMotion} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>High Contrast</Label><p className="text-sm text-muted-foreground">Enhanced visibility</p></div>
                  <Switch checked={appearance.highContrast} onCheckedChange={setHighContrast} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch checked={notifications.emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <Label>In-App Notifications</Label>
                <Switch checked={notifications.inAppNotifications} onCheckedChange={setInAppNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Event Reminders</Label>
                <Switch checked={notifications.eventReminders} onCheckedChange={setEventReminders} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Newsletter</Label>
                <Switch checked={notifications.newsletter} onCheckedChange={setNewsletter} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>Analytics</Label><p className="text-sm text-muted-foreground">Help us improve</p></div>
                <Switch checked={privacy.analyticsConsent || false} onCheckedChange={setAnalyticsConsent} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>Personalization</Label><p className="text-sm text-muted-foreground">Tailored experience</p></div>
                <Switch checked={privacy.personalizationConsent || false} onCheckedChange={setPersonalizationConsent} />
              </div>
            </CardContent>
          </Card>

          {/* Root Access - Only show if not in root mode, or show logout if in root mode */}
          {!isActive ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Root Access
                </CardTitle>
                <CardDescription>
                  Login as root user to enable content editing mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setLoginModalOpen(true)} variant="outline" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Login as Root
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Root Edit Mode
                  <Badge variant="default" className="ml-2">Active</Badge>
                </CardTitle>
                <CardDescription>
                  You are logged in as {session?.username}. Root edit mode is enabled.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• Hover over any element to see edit controls</p>
                  <p>• Click elements to edit content inline</p>
                  <p>• Changes are saved automatically</p>
                </div>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout & Exit Root Mode
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <RootLoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </MainLayout>
  );
};

export default Settings;
