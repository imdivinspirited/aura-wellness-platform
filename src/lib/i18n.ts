import React from 'react';
import { useUserStore } from '@/stores/userStore';

// Translation keys type
export type TranslationKey =
  | 'nav.programs'
  | 'nav.services'
  | 'nav.events'
  | 'nav.explore'
  | 'nav.opportunities'
  | 'nav.connect'
  | 'nav.sevaCareers'
  | 'nav.home'
  | 'nav.settings'
  | 'nav.profile'
  | 'nav.logout'
  | 'nav.myPrograms'
  | 'nav.helpSupport'
  | 'search.placeholder'
  | 'common.loading'
  | 'common.error'
  | 'common.notFound'
  | 'common.back'
  | 'common.continue'
  | 'common.skip'
  | 'common.confirm'
  | 'common.cancel'
  | 'common.save'
  | 'common.edit'
  | 'common.delete'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'breadcrumbs.home'
  | 'empty.noData'
  | 'empty.noResults'
  | 'empty.tryAgain'
  | string; // Allow any string key for dynamic content

// Translation structure
interface Translations {
  [key: string]: string | Translations;
}

// Global language state - single source of truth
let currentLanguage: string = 'en';
const languageListeners: Set<() => void> = new Set();

// Subscribe to language changes
export function subscribeToLanguageChange(listener: () => void): () => void {
  languageListeners.add(listener);
  return () => {
    languageListeners.delete(listener);
  };
}

// Notify all listeners of language change
function notifyLanguageChange() {
  languageListeners.forEach(listener => listener());
}

// Update current language and notify listeners
export function updateGlobalLanguage(lang: string) {
  if (currentLanguage !== lang) {
    currentLanguage = lang;
    notifyLanguageChange();
  }
}

// English translations (default/base)
const en: Translations = {
  nav: {
    programs: 'Programs',
    services: 'Services',
    events: 'Events',
    explore: 'Explore',
    opportunities: 'Opportunities',
    connect: 'Connect',
    sevaCareers: 'Seva & Careers',
    home: 'Home',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    myPrograms: 'My Programs',
    helpSupport: 'Help & Support',
  },
  search: {
    placeholder: 'Search programs, events, services... (⌘K)',
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    notFound: 'Not Found',
    back: 'Back',
    continue: 'Continue',
    skip: 'Skip',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
  },
  breadcrumbs: {
    home: 'Home',
  },
  empty: {
    noData: 'No data available',
    noResults: 'No results found',
    tryAgain: 'Try again',
  },
};

// Hindi translations
const hi: Translations = {
  nav: {
    programs: 'कार्यक्रम',
    services: 'सेवाएं',
    events: 'कार्यक्रम',
    explore: 'अन्वेषण',
    opportunities: 'अवसर',
    connect: 'संपर्क',
    sevaCareers: 'सेवा और करियर',
    home: 'होम',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
    myPrograms: 'मेरे कार्यक्रम',
    helpSupport: 'सहायता',
  },
  search: {
    placeholder: 'कार्यक्रम, कार्यक्रम, सेवाएं खोजें... (⌘K)',
  },
  common: {
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    notFound: 'नहीं मिला',
    back: 'वापस',
    continue: 'जारी रखें',
    skip: 'छोड़ें',
    confirm: 'पुष्टि करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
  },
  breadcrumbs: {
    home: 'होम',
  },
  empty: {
    noData: 'कोई डेटा उपलब्ध नहीं',
    noResults: 'कोई परिणाम नहीं मिला',
    tryAgain: 'पुनः प्रयास करें',
  },
};

// Kannada translations
const kn: Translations = {
  nav: {
    programs: 'ಕಾರ್ಯಕ್ರಮಗಳು',
    services: 'ಸೇವೆಗಳು',
    events: 'ಕಾರ್ಯಕ್ರಮಗಳು',
    explore: 'ಅನ್ವೇಷಿಸಿ',
    opportunities: 'ಅವಕಾಶಗಳು',
    connect: 'ಸಂಪರ್ಕಿಸಿ',
    home: 'ಹೋಮ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    logout: 'ಲಾಗ್ ಔಟ್',
    myPrograms: 'ನನ್ನ ಕಾರ್ಯಕ್ರಮಗಳು',
    helpSupport: 'ಸಹಾಯ',
  },
  search: {
    placeholder: 'ಕಾರ್ಯಕ್ರಮಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು, ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ... (⌘K)',
  },
  common: {
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    error: 'ದೋಷ',
    notFound: 'ಕಂಡುಬಂದಿಲ್ಲ',
    back: 'ಹಿಂದೆ',
    continue: 'ಮುಂದುವರಿಸಿ',
    skip: 'ಬಿಟ್ಟುಬಿಡಿ',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    save: 'ಉಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    search: 'ಹುಡುಕಿ',
    filter: 'ಫಿಲ್ಟರ್',
    sort: 'ವಿಂಗಡಿಸಿ',
  },
  breadcrumbs: {
    home: 'ಹೋಮ್',
  },
  empty: {
    noData: 'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ',
    noResults: 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
  },
};

// Tamil translations
const ta: Translations = {
  nav: {
    programs: 'திட்டங்கள்',
    services: 'சேவைகள்',
    events: 'நிகழ்வுகள்',
    explore: 'ஆராயுங்கள்',
    opportunities: 'வாய்ப்புகள்',
    connect: 'இணை',
    home: 'வீடு',
    settings: 'அமைப்புகள்',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    myPrograms: 'எனது திட்டங்கள்',
    helpSupport: 'உதவி',
  },
  search: {
    placeholder: 'திட்டங்கள், நிகழ்வுகள், சேவைகளைத் தேடுங்கள்... (⌘K)',
  },
  common: {
    loading: 'லோட் ஆகிறது...',
    error: 'பிழை',
    notFound: 'கிடைக்கவில்லை',
    back: 'பின்',
    continue: 'தொடரவும்',
    skip: 'தவிர்',
    confirm: 'உறுதிப்படுத்து',
    cancel: 'ரத்து',
    save: 'சேமி',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    search: 'தேடு',
    filter: 'வடிகட்டு',
    sort: 'வரிசைப்படுத்து',
  },
  breadcrumbs: {
    home: 'வீடு',
  },
  empty: {
    noData: 'தரவு இல்லை',
    noResults: 'முடிவுகள் இல்லை',
    tryAgain: 'மீண்டும் முயற்சிக்கவும்',
  },
};

// Telugu translations
const te: Translations = {
  nav: {
    programs: 'కార్యక్రమాలు',
    services: 'సేవలు',
    events: 'ఈవెంట్లు',
    explore: 'అన్వేషించండి',
    opportunities: 'అవకాశాలు',
    connect: 'కనెక్ట్',
    home: 'హోమ్',
    settings: 'సెట్టింగులు',
    profile: 'ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
    myPrograms: 'నా కార్యక్రమాలు',
    helpSupport: 'సహాయం',
  },
  search: {
    placeholder: 'కార్యక్రమాలు, ఈవెంట్లు, సేవలను శోధించండి... (⌘K)',
  },
  common: {
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం',
    notFound: 'కనుగొనబడలేదు',
    back: 'వెనుక',
    continue: 'కొనసాగించు',
    skip: 'దాటవేయి',
    confirm: 'నిర్ధారించు',
    cancel: 'రద్దు',
    save: 'సేవ్',
    edit: 'సవరించు',
    delete: 'తొలగించు',
    search: 'శోధించు',
    filter: 'ఫిల్టర్',
    sort: 'వర్గీకరించు',
  },
  breadcrumbs: {
    home: 'హోమ్',
  },
  empty: {
    noData: 'డేటా లభ్యం కాదు',
    noResults: 'ఫలితాలు లేవు',
    tryAgain: 'మళ్లీ ప్రయత్నించండి',
  },
};

// Translation map
const translations: Record<string, Translations> = {
  en,
  hi,
  kn,
  ta,
  te,
  // Add more languages as needed, defaulting to English for unsupported languages
};

// Helper function to get nested translation value
function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let value: any = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return key as fallback
    }
  }

  return typeof value === 'string' ? value : path;
}

// Get translation function (now uses global state)
export function t(key: TranslationKey, language?: string): string {
  // Use provided language, then global current, then store fallback
  const lang = language || currentLanguage || useUserStore.getState().language || 'en';
  const translation = translations[lang] || translations.en;

  // If key is already a full string path, use it directly
  if (!key.includes('.')) {
    // Try common patterns
    const commonTranslation = getNestedValue(translation, `common.${key}`);
    if (commonTranslation !== `common.${key}`) return commonTranslation;

    return getNestedValue(translation, key) || key;
  }

  return getNestedValue(translation, key) || getNestedValue(translations.en, key) || key;
}

// React hook for translations - MANDATORY for reactive updates
export function useTranslation() {
  // Subscribe to both Zustand store and global language changes
  const { language, setLanguage } = useUserStore();
  const [updateTrigger, setUpdateTrigger] = React.useState(0);

  // Sync global state with Zustand store
  React.useEffect(() => {
    updateGlobalLanguage(language);
  }, [language]);

  // Subscribe to global language changes
  React.useEffect(() => {
    const unsubscribe = subscribeToLanguageChange(() => {
      setUpdateTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const translate = (key: TranslationKey): string => {
    // Always use current global language for reactive updates
    try {
      return t(key, currentLanguage || language || 'en');
    } catch (error) {
      // Fallback to key if translation fails
      console.warn('Translation error for key:', key, error);
      return String(key);
    }
  };

  return {
    t: translate,
    language: currentLanguage || language || 'en',
    setLanguage,
    _updateTrigger: updateTrigger, // Force re-render when language changes
  };
}

// Initialize global language from store on load
if (typeof window !== 'undefined') {
  const initialState = useUserStore.getState().language;
  if (initialState) {
    currentLanguage = initialState;
  }
}

// Export default translation function
export default t;
