import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export type MoodType = 'happy' | 'calm' | 'neutral' | 'sad' | 'depressed' | null;

export type ThemeType = 'light' | 'dark' | 'system';
export type ThemePreset = 'classic-spiritual' | 'ocean-calm' | 'forest-serenity';

interface AppearanceSettings {
  theme: ThemeType;
  themePreset: ThemePreset;
  calmMode: boolean;
  fontSize: 'S' | 'M' | 'L' | 'XL';
  reduceMotion: boolean;
  highContrast: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  eventReminders: boolean;
  newsletter: boolean;
}

interface AccessibilitySettings {
  screenReader: boolean;
  keyboardNav: boolean;
  focusIndicators: 'always' | 'auto';
}

interface PrivacySettings {
  analyticsConsent: boolean | null;
  personalizationConsent: boolean | null;
}

interface UserPreferences {
  language: string;
  hasCompletedLanguageSetup: boolean;
  lastMoodCheck: number | null;
  currentMood: MoodType;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
}

interface UserState extends UserPreferences {
  setLanguage: (language: string) => void;
  completeLanguageSetup: () => void;
  setMood: (mood: MoodType) => void;
  shouldShowMoodCheck: () => boolean;

  // Appearance
  setTheme: (theme: ThemeType) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setCalmMode: (enabled: boolean) => void;
  setFontSize: (size: 'S' | 'M' | 'L' | 'XL') => void;
  setReduceMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;

  // Notifications
  setEmailNotifications: (enabled: boolean) => void;
  setInAppNotifications: (enabled: boolean) => void;
  setEventReminders: (enabled: boolean) => void;
  setNewsletter: (enabled: boolean) => void;

  // Accessibility
  setScreenReader: (enabled: boolean) => void;
  setKeyboardNav: (enabled: boolean) => void;
  setFocusIndicators: (mode: 'always' | 'auto') => void;

  // Privacy
  setAnalyticsConsent: (consent: boolean) => void;
  setPersonalizationConsent: (consent: boolean) => void;

  resetOnboarding: () => void;
}

const MOOD_CHECK_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const defaultAppearance: AppearanceSettings = {
  theme: 'system',
  themePreset: 'classic-spiritual',
  calmMode: false,
  fontSize: 'M',
  reduceMotion: false,
  highContrast: false,
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  inAppNotifications: true,
  eventReminders: true,
  newsletter: true,
};

const defaultAccessibility: AccessibilitySettings = {
  screenReader: false,
  keyboardNav: true,
  focusIndicators: 'auto',
};

const defaultPrivacy: PrivacySettings = {
  analyticsConsent: null,
  personalizationConsent: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      language: 'en',
      hasCompletedLanguageSetup: false,
      lastMoodCheck: null,
      currentMood: null,
      appearance: defaultAppearance,
      notifications: defaultNotifications,
      accessibility: defaultAccessibility,
      privacy: defaultPrivacy,

      setLanguage: (language) => {
        set({ language });
        // Trigger global language update for reactive i18n
        // Use setTimeout to avoid circular dependency issues during initialization
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            // Use dynamic import to avoid circular dependency
            import('@/lib/i18n').then(({ updateGlobalLanguage }) => {
              updateGlobalLanguage(language);
            }).catch(() => {
              // Silently fail if module not ready - will sync on next render
            });
          }, 0);
        }
      },

      completeLanguageSetup: () => set({ hasCompletedLanguageSetup: true }),

      setMood: (mood) =>
        set({
          currentMood: mood,
          lastMoodCheck: Date.now(),
        }),

      shouldShowMoodCheck: () => {
        const { lastMoodCheck, hasCompletedLanguageSetup } = get();
        if (!hasCompletedLanguageSetup) return false;
        if (!lastMoodCheck) return true;
        return Date.now() - lastMoodCheck > MOOD_CHECK_INTERVAL;
      },

      // Appearance setters
      setTheme: (theme) => set((state) => ({
        appearance: { ...state.appearance, theme }
      })),
      setThemePreset: (themePreset) => set((state) => ({
        appearance: { ...state.appearance, themePreset }
      })),
      setCalmMode: (calmMode) => set((state) => ({
        appearance: { ...state.appearance, calmMode }
      })),
      setFontSize: (fontSize) => set((state) => ({
        appearance: { ...state.appearance, fontSize }
      })),
      setReduceMotion: (reduceMotion) => set((state) => ({
        appearance: { ...state.appearance, reduceMotion }
      })),
      setHighContrast: (highContrast) => set((state) => ({
        appearance: { ...state.appearance, highContrast }
      })),

      // Notification setters
      setEmailNotifications: (emailNotifications) => set((state) => ({
        notifications: { ...state.notifications, emailNotifications }
      })),
      setInAppNotifications: (inAppNotifications) => set((state) => ({
        notifications: { ...state.notifications, inAppNotifications }
      })),
      setEventReminders: (eventReminders) => set((state) => ({
        notifications: { ...state.notifications, eventReminders }
      })),
      setNewsletter: (newsletter) => set((state) => ({
        notifications: { ...state.notifications, newsletter }
      })),

      // Accessibility setters
      setScreenReader: (screenReader) => set((state) => ({
        accessibility: { ...state.accessibility, screenReader }
      })),
      setKeyboardNav: (keyboardNav) => set((state) => ({
        accessibility: { ...state.accessibility, keyboardNav }
      })),
      setFocusIndicators: (focusIndicators) => set((state) => ({
        accessibility: { ...state.accessibility, focusIndicators }
      })),

      // Privacy setters
      setAnalyticsConsent: (analyticsConsent) => set((state) => ({
        privacy: { ...state.privacy, analyticsConsent }
      })),
      setPersonalizationConsent: (personalizationConsent) => set((state) => ({
        privacy: { ...state.privacy, personalizationConsent }
      })),

      resetOnboarding: () =>
        set({
          hasCompletedLanguageSetup: false,
          lastMoodCheck: null,
          currentMood: null,
        }),
    }),
    {
      name: 'user-preferences',
    }
  )
);
