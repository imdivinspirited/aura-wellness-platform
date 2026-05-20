import React from 'react';
import { useUserStore } from '@/stores/userStore';
import {
  subscribeToLanguageChange,
  updateGlobalLanguage,
  getSyncedLanguage,
  setSyncedLanguageInitial,
} from '@/lib/languageSync';
import { extensionEn } from '@/lib/i18n/extensionEn';
import { moodHomeEn } from '@/lib/i18n/moodHomeEn';
import { moodHomeHi } from '@/lib/i18n/moodHomeHi';
import { moodAdvancedEn } from '@/lib/i18n/moodAdvancedEn';
import { moodAdvancedHi } from '@/lib/i18n/moodAdvancedHi';
import { navLabelsEn, navDescriptionsEn } from '@/lib/i18n/navBundleEn';
import { navLabelsHi, navDescriptionsHi } from '@/lib/i18n/navBundleHi';
import { programsBundleEn } from '@/lib/i18n/programsBundleEn';
import { programsBundleHi } from '@/lib/i18n/programsBundleHi';
import { footerBundleEn } from '@/lib/i18n/footerBundleEn';
import { footerBundleHi } from '@/lib/i18n/footerBundleHi';

// Translation keys type
export type TranslationKey =
  | 'nav.programs'
  | 'nav.services'
  | 'nav.international'
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

// English translations (default/base)
const en: Translations = {
  nav: {
    programs: 'Programs',
    services: 'Services',
    international: 'International',
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
    labels: navLabelsEn as unknown as Translations,
    descriptions: navDescriptionsEn as unknown as Translations,
    aria: {
      subNav: 'Sub navigation',
      childNav: 'Child navigation',
      toggleSidebar: 'Toggle sidebar',
    },
  },
  programs: programsBundleEn as unknown as Translations,
  footer: footerBundleEn as unknown as Translations,
  search: {
    placeholder: 'Search programs, events, services... (⌘K)',
    triggerLabel: 'Search programs, stay, articles, careers & more…',
    triggerHint: 'Programs · events · stay · services · explore · connect',
    ariaOpen: 'Open search',
    modalPlaceholder: 'Type to search…',
    modalSubtitle: 'Programs, events, stay, services & more across the site',
    recentTitle: 'Recent searches',
    suggestedLabel: 'Browse',
    quickPrograms: 'Programs',
    quickEvents: 'Events',
    quickExplore: 'Explore',
    quickServices: 'Services',
    quickConnect: 'Connect',
    quickStay: 'Stay',
    resultOne: 'result',
    resultOther: 'results',
    noResultsLine: 'No results found',
    tryAdjust: 'Try adjusting your search query or',
    clearSearchLink: 'clear your search',
    navigate: 'Navigate',
    select: 'Select',
    close: 'Close',
    ariaSearch: 'Search',
    ariaClear: 'Clear search',
    sortRelevance: 'Relevance',
    sortTitle: 'Title A–Z',
    sortCategory: 'Category',
    relatedTitle: 'Related',
    correctionsLabel: 'Adjusted:',
    saveSearch: 'Save',
    savedTitle: 'Saved searches',
    trendingTitle: 'Trending (your clicks)',
    syntaxHint:
      'Tips: "exact phrase", -word, category:Tag, tag:yoga, url:/path, OR, *wild — plus fuzzy & typo help.',
    removeSaved: 'Remove saved search',
    sortPopularity: 'Popularity (clicks)',
    exportCsv: 'CSV',
    listView: 'List view',
    compactView: 'Compact list',
    gridView: 'Grid view',
    resultLayoutGroup: 'Result layout',
    totalSearchEvents: 'Total recorded searches (this device)',
    rateLimitedTitle: 'Too many searches',
    rateLimitedHint: 'Please wait about {{seconds}} seconds, then try again.',
    moreSearchOptions: 'Search options',
    clearQueryLink: 'Clear',
    copyLink: 'Copy link',
    shareResult: 'Share',
    thumbsUp: 'Relevant',
    thumbsDown: 'Not relevant',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    voiceSearch: 'Voice input',
    voiceListening: 'Listening… speak now',
    voiceTapToStop: 'Tap again to stop',
    discoverMoreTitle: 'More — popular, saved & trends',
    popularQueriesTitle: 'Popular on this device',
    relatedQueriesTitle: 'Try refining',
    sortFreshness: 'Catalog order (newest)',
    printResults: 'Print',
    page: 'page',
    safeSearchToggle: 'Safe search',
    capMatrixButton: '501 features',
    imageQuery: 'Image → text',
    bookmarkResult: 'Bookmark',
    ttsResult: 'Read aloud',
    piiEmail: 'This looks like an email — avoid pasting personal data into search.',
    piiPhone: 'This looks like a phone number — avoid pasting personal data into search.',
    piiCard: 'This looks like card-like digits — avoid pasting payment data into search.',
    localAnalytics: 'Local analytics',
    ctrApprox: 'Approx. CTR (clicks / successful searches)',
    zeroQueriesTitle: 'Zero-result queries (this device)',
    zeroQueriesEmpty: 'No zero-result queries recorded yet.',
    capMatrixTitle: 'Enterprise search checklist (501)',
    capMatrixBlurb:
      'Every row is tracked. “In app” works in this browser build; “Partial” is an approximation; “Infrastructure” needs servers, ML, or compliance programs.',
    capSummaryInApp: 'In app',
    capSummaryPartial: 'Partial',
    capSummaryInfra: 'Infrastructure',
    capMatrixFilter: 'Filter by title, bucket, or #…',
    capMatrixEmpty: 'No rows match.',
    capTierInApp: 'In app',
    capTierPartial: 'Partial',
    capTierInfra: 'Infrastructure',
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
    more: 'More',
  },
  breadcrumbs: {
    home: 'Home',
  },
  empty: {
    noData: 'No data available',
    noResults: 'No results found',
    tryAgain: 'Try again',
  },
  errors: {
    boundary: {
      title: 'We’re sorry — something went wrong',
      subtitle:
        'This page hit an unexpected problem. Your data is still protected; you can safely go back or reload.',
      apology:
        'We apologize for the trouble and any frustration this may have caused. Thank you for your patience.',
      feedbackPrompt:
        'Please copy the details below and send them to us (with a screenshot if you can) via Help & Support or your usual contact — it helps us fix the issue faster.',
      teamNote: 'Our team reviews these reports and works to resolve problems as quickly as we can.',
      referenceLabel: 'Reference ID',
      technicalSummary: 'Summary',
      detailRedacted:
        'The technical message is hidden here to keep your account and our systems safe. Please still share the reference ID above.',
      copyFeedback: 'Copy details for support',
      copied: 'Copied to clipboard',
      goHome: 'Go home',
      reload: 'Reload page',
      feedbackEmailSubjectPrefix: '[AOLIC app feedback]',
      feedbackPageLabel: 'Page',
      feedbackTimeLabel: 'Time (UTC)',
      feedbackFooterNote:
        'Please describe what you were doing when this appeared. Do not paste passwords or card numbers.',
    },
  },
  appearance: extensionEn.appearance,
  language: extensionEn.language,
  mood: {
    modal: extensionEn.mood.modal,
    home: moodHomeEn,
    homeUi: extensionEn.mood.homeUi,
    wellness: extensionEn.mood.wellness,
    advanced: moodAdvancedEn as unknown as Translations,
  },
  home: extensionEn.home,
  contact: {
    stayConnectedTitle: 'Stay Connected',
    actionCall: 'Call',
    actionEmail: 'Email',
    copyVerb: 'Copy',
  },
};

// Hindi translations
const hi: Translations = {
  nav: {
    programs: 'कार्यक्रम',
    services: 'सेवाएं',
    international: 'अंतरराष्ट्रीय',
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
    labels: navLabelsHi as unknown as Translations,
    descriptions: navDescriptionsHi as unknown as Translations,
    aria: {
      subNav: 'उप-नेविगेशन',
      childNav: 'उप-पृष्ठ नेविगेशन',
      toggleSidebar: 'साइडबार टॉगल करें',
    },
  },
  programs: programsBundleHi as unknown as Translations,
  footer: footerBundleHi as unknown as Translations,
  contact: {
    stayConnectedTitle: 'जुड़े रहें',
    actionCall: 'कॉल',
    actionEmail: 'ईमेल',
    copyVerb: 'कॉपी',
  },
  search: {
    placeholder: 'कार्यक्रम, कार्यक्रम, सेवाएं खोजें... (⌘K)',
    triggerLabel: 'कार्यक्रम, ठहरने, लेख, करियर व अधिक खोजें…',
    triggerHint: 'कार्यक्रम · इवेंट्स · सेवाएं · एक्सप्लोर · कनेक्ट',
    ariaOpen: 'खोज खोलें',
    modalPlaceholder: 'खोजने के लिए लिखें…',
    modalSubtitle: 'साइट भर में कार्यक्रम, इवेंट्स, ठहरने, सेवाएं व अधिक',
    recentTitle: 'हाल की खोजें',
    suggestedLabel: 'ब्राउज़ करें',
    quickPrograms: 'कार्यक्रम',
    quickEvents: 'इवेंट्स',
    quickExplore: 'एक्सप्लोर',
    quickServices: 'सेवाएं',
    quickConnect: 'कनेक्ट',
    quickStay: 'ठहरने',
    resultOne: 'परिणाम',
    resultOther: 'परिणाम',
    noResultsLine: 'कोई परिणाम नहीं मिला',
    tryAdjust: 'अपनी खोज बदलकर देखें या',
    clearSearchLink: 'खोज साफ़ करें',
    navigate: 'नेविगेट',
    select: 'चुनें',
    close: 'बंद करें',
    ariaSearch: 'खोज',
    ariaClear: 'खोज साफ़ करें',
    sortRelevance: 'प्रासंगिकता',
    sortTitle: 'शीर्षक क→अ',
    sortCategory: 'श्रेणी',
    relatedTitle: 'संबंधित',
    correctionsLabel: 'समायोजित:',
    saveSearch: 'सहेजें',
    savedTitle: 'सहेजी खोजें',
    trendingTitle: 'ट्रेंडिंग (आपके क्लिक)',
    syntaxHint:
      'टिप्स: "सटीक वाक्य", -शब्द, category:टैग, tag:yoga, url:/पथ, OR, *वाइल्ड — फ़ज़ी व टाइपो सहायता।',
    removeSaved: 'सहेजी खोज हटाएं',
    sortPopularity: 'लोकप्रियता (क्लिक)',
    exportCsv: 'CSV',
    listView: 'सूची दृश्य',
    compactView: 'संक्षिप्त सूची',
    gridView: 'ग्रिड दृश्य',
    resultLayoutGroup: 'परिणाम लेआउट',
    totalSearchEvents: 'कुल दर्ज खोजें (यह डिवाइस)',
    rateLimitedTitle: 'बहुत सारी खोजें',
    rateLimitedHint: 'कृपया लगभग {{seconds}} सेकंड प्रतीक्षा करें, फिर दोबारा कोशिश करें।',
    moreSearchOptions: 'खोज विकल्प',
    clearQueryLink: 'साफ़ करें',
    copyLink: 'लिंक कॉपी करें',
    shareResult: 'साझा करें',
    thumbsUp: 'प्रासंगिक',
    thumbsDown: 'अप्रासंगिक',
    prevPage: 'पिछला पृष्ठ',
    nextPage: 'अगला पृष्ठ',
    voiceSearch: 'आवाज़ इनपुट',
    voiceListening: 'सुन रहे हैं… बोलें',
    voiceTapToStop: 'रोकने के लिए फिर टैप करें',
    discoverMoreTitle: 'और — लोकप्रिय, सहेजी व ट्रेंड',
    popularQueriesTitle: 'इस डिवाइस पर लोकप्रिय',
    relatedQueriesTitle: 'खोज सख्त करें',
    sortFreshness: 'कैटलॉग क्रम (नवीनतम)',
    printResults: 'प्रिंट',
    page: 'पृष्ठ',
    safeSearchToggle: 'सुरक्षित खोज',
    capMatrixButton: '501 फ़ीचर',
    imageQuery: 'छवि → टेक्स्ट',
    bookmarkResult: 'बुकमार्क',
    ttsResult: 'ज़ोर से पढ़ें',
    piiEmail: 'यह ईमेल जैसा लगता है — व्यक्तिगत डेटा पेस्ट न करें।',
    piiPhone: 'यह फ़ोन नंबर जैसा लगता है — व्यक्तिगत डेटा पेस्ट न करें।',
    piiCard: 'यह कार्ड जैसे अंक लगते हैं — भुगतान डेटा पेस्ट न करें।',
    localAnalytics: 'स्थानीय विश्लेषण',
    ctrApprox: 'अनुमानित CTR (क्लिक / सफल खोजें)',
    zeroQueriesTitle: 'शून्य-परिणाम वाली खोजें (यह डिवाइस)',
    zeroQueriesEmpty: 'अभी कोई शून्य-परिणाम खोज दर्ज नहीं।',
    capMatrixTitle: 'एंटरप्राइज़ खोज चेकलिस्ट (501)',
    capMatrixBlurb:
      'हर पंक्ति ट्रैक है। “इन ऐप” इस ब्राउज़र में काम करता है; “आंशिक” अनुमान है; “इन्फ्रा” सर्वर/ML/अनुपालन चाहिए।',
    capSummaryInApp: 'ऐप में',
    capSummaryPartial: 'आंशिक',
    capSummaryInfra: 'इन्फ्रास्ट्रक्चर',
    capMatrixFilter: 'शीर्षक, बकेट या # से फ़िल्टर…',
    capMatrixEmpty: 'कोई मेल नहीं।',
    capTierInApp: 'ऐप में',
    capTierPartial: 'आंशिक',
    capTierInfra: 'इन्फ्रास्ट्रक्चर',
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
    more: 'और',
  },
  breadcrumbs: {
    home: 'होम',
  },
  empty: {
    noData: 'कोई डेटा उपलब्ध नहीं',
    noResults: 'कोई परिणाम नहीं मिला',
    tryAgain: 'पुनः प्रयास करें',
  },
  errors: {
    boundary: {
      title: 'क्षमा करें — कुछ गलत हो गया',
      subtitle:
        'इस पेज पर अनपेक्षित समस्या आई। आपका डेटा सुरक्षित है; आप वापस जा सकते हैं या पेज रीलोड कर सकते हैं।',
      apology:
        'असुविधा के लिए क्षमा चाहेंगे। आपके धैर्य के लिए धन्यवाद।',
      feedbackPrompt:
        'नीचे की जानकारी कॉपी करके हमें भेजें (संभव हो तो स्क्रीनशॉट साथ) — सहायता / संपर्क से। इससे हम जल्दी ठीक कर पाते हैं।',
      teamNote: 'हमारी टीम इन रिपोर्ट को देखकर जल्द से जल्द समाधान की कोशिश करती है।',
      referenceLabel: 'संदर्भ ID',
      technicalSummary: 'संक्षिप्त विवरण',
      detailRedacted:
        'आपके खाते और सिस्टम की सुरक्षा के लिए तकनीकी संदेश यहाँ नहीं दिखाया गया। ऊपर का संदर्भ ID जरूर साझा करें।',
      copyFeedback: 'सपोर्ट के लिए विवरण कॉपी करें',
      copied: 'क्लिपबोर्ड पर कॉपी हो गया',
      goHome: 'होम पर जाएं',
      reload: 'पेज रीलोड करें',
      feedbackEmailSubjectPrefix: '[AOLIC ऐप फीडबैक]',
      feedbackPageLabel: 'पेज',
      feedbackTimeLabel: 'समय (UTC)',
      feedbackFooterNote:
        'यह दिखते समय आप क्या कर रहे थे, लिखें। पासवर्ड या कार्ड नंबर न पेस्ट करें।',
    },
  },
  language: {
    modal: {
      eyebrow: 'भाषा',
      title: 'अपनी भाषा चुनें',
      subtitle:
        'पूरी साइट — मेनू, होम, संदेश — आपकी चुनी भाषा में दिखेगी (छवियों को छोड़कर)। सेटिंग्स में कभी बदल सकते हैं।',
      legend: 'लोकप्रिय चयन · नीचे सभी भाषाएँ खोजें',
      privateNote: 'पूरी साइट पर लागू · सेटिंग्स में कभी बदलें',
      searchPlaceholder: 'भाषाएँ खोजें…',
      continue: 'जारी रखें',
      continueIn: '{{name}} में जारी रखें',
      noResults: 'कोई भाषा नहीं मिली',
      themeLabel: 'दिखावट',
      themeHint: 'लाइट, डार्क या डिवाइस के अनुसार। सेटिंग्स में कभी बदल सकते हैं।',
      themeLight: 'लाइट',
      themeDark: 'डार्क',
      themeSystem: 'सिस्टम',
    },
  },
  appearance: {
    onboarding: {
      eyebrow: 'दिखावट और आराम',
      title: 'साइट का रूप चुनें',
      privateNote: 'इस डिवाइस पर सहेजा · सेटिंग्स में कभी बदलें',
      subtitle:
        'रंग मोड, थीम और आराम विकल्प। बाद में सेटिंग्स में कभी बदल सकते हैं।',
      modeLabel: 'रंग मोड',
      modeLight: 'लाइट',
      modeDark: 'डार्क',
      modeSystem: 'सिस्टम के अनुसार',
      presetLabel: 'रंग थीम',
      presetClassic: 'क्लासिक आध्यात्मिक',
      presetOcean: 'महासागर शांति',
      presetForest: 'वन शांति',
      eyeComfortLabel: 'आँखों के अनुकूल',
      eyeComfortHint: 'नरम, गर्म टोन — आँखों पर कम दबाव',
      highContrastLabel: 'उच्च कॉन्ट्रास्ट',
      highContrastHint: 'स्पष्ट टेक्स्ट और किनारे',
      moreLabel: 'और विकल्प',
      reduceMotionLabel: 'गति कम करें',
      reduceMotionHint: 'एनिमेशन कम',
      fontSizeLabel: 'टेक्स्ट आकार',
      fontS: 'छोटा',
      fontM: 'मध्यम',
      fontL: 'बड़ा',
      fontXL: 'अति बड़ा',
      continue: 'आगे बढ़ें',
    },
  },
  mood: {
    modal: {
      eyebrow: 'पर्दा उठने से पहले',
      title: 'इस पल में — आप कैसे महसूस कर रहे हैं?',
      bodyLead:
        'जो सच लगे वो चुनें। गलत जवाब नहीं — और यहाँ कुछ भी अगला कदम नहीं बताता।',
      bodyNote: 'निजी · इस विज़िट के लिए · प्रोफ़ाइल पर नहीं',
      privacy: 'आपका जवाब सिर्फ अगला अनुभव तय करता है — उत्सुक रहिए।',
      legend: 'सबसे नज़दीकी कौन सा? · कुंजी 1–6',
      pressKey: 'कुंजी {{n}}',
      apply: 'आगे बढ़ें',
      skip: 'अभी नहीं बताना',
      reassurance: {
        happy: 'दर्ज — आगे का सफ़र इसी रोशनी के साथ मिलेगा।',
        calm: 'समझा गया — अगला कदम हल्के से मिलेगा।',
        neutral: 'संतुलन नोट — रास्ता खुला रखेंगे।',
        sad: 'सुना — यहाँ से धीरे चलेंगे।',
        depressed: 'लिया — हल्का और दयालु रखेंगे।',
        stressed: 'समझा — अगला कदम शांति की ओर होगा।',
      },
      moods: {
        happy: {
          label: 'उत्साहित',
          hint: 'आशावान, हल्का या खुश — ऊर्जा खुली महसूस हो',
        },
        calm: {
          label: 'स्थिर',
          hint: 'शरीर में स्थिर — धीमी, समान श्वास',
        },
        neutral: {
          label: 'सामान्य',
          hint: 'सपाट या संतुलित — न ऊँचा न नीचा',
        },
        sad: {
          label: 'भारी',
          hint: 'उदास, रोने जैसा या अलग — यह सही है',
        },
        depressed: {
          label: 'थका हुआ',
          hint: 'बहुत कम ऊर्जा, सुन्नता, या हिलने में मुश्किल',
        },
        stressed: {
          label: 'सक्रिय तनाव',
          hint: 'तनाव, बेचैनी, तेज़ विचार, या चिड़चिड़ापन',
        },
      },
    },
    home: moodHomeHi as unknown as Translations,
    homeUi: {
      recommendedTitle: 'इस पल के लिए चुना हुआ',
      recommendedSubtitle:
        'हर टाइल एक रास्ता खोलता है — जैसा आपने महसूस किया बताया, उसी के अनुरूप; सहज, स्पष्ट और सम्मानजनक।',
      heroBadge: 'व्यक्तिगत अभिवादन',
      secondaryCta: 'सभी कार्यक्रम देखें',
      secondaryCtaAria: 'पूरी कार्यक्रम सूची ब्राउज़ करें',
      trustA: 'बैंगलोर आश्रम',
      trustB: 'आर्ट ऑफ लिविंग',
      trustC: 'वैश्विक समुदाय · 40+ वर्ष',
      quoteLabel: 'संजोने योग्य शब्द',
      journeyTitle: 'एक शांत क्रम',
      journeySubtitle: 'तीन हल्के चरण — जितनी देर चाहें रुकें।',
      journey1Title: 'आगमन',
      journey1Body: 'पैरों को महसूस करें, कंधे ढीले करें, श्वास अपनी लय में आने दें।',
      journey2Title: 'चुनाव',
      journey2Body: 'नीचे एक सुझाव खोलें — सबसे छोटा ईमानदार कदम भी काफ़ी है।',
      journey3Title: 'साथ ले जाएँ',
      journey3Body: 'जाने से पहले, एक गुण नाम करें जिसे आप दिन के बाकी हिस्से में ले जाना चाहते हैं।',
      quickActionsTitle: 'और गहराई के रास्ते',
      quickActionsSubtitle: 'छोटे अभ्यास और धागे जो आपके मूड से अच्छे जुड़ते हैं।',
      quickMeditation: {
        title: 'निर्देशित शांति',
        desc: 'तंत्रिका तंत्र को संतुलित करने के लिए संक्षिप्त सत्र — कामों के बीच उपयुक्त।',
        cta: 'कार्यक्रम खोलें',
      },
      dailyWisdom: {
        title: 'चिंतन और कहानियाँ',
        desc: 'निबंध, धर्म और शिक्षकों व साधकों के क्षेत्र नोट्स।',
        cta: 'एक्सप्लोर पर जाएँ',
      },
      shareStory: {
        title: 'मानव संबंध',
        desc: 'स्वागत डेस्क, सेवा मंडली या सुनने वाली लाइन — बिना एजेंडा।',
        cta: 'कनेक्ट पर जाएँ',
      },
    },
    wellness: {
      mediaEyebrow: 'गुरुदेव · YouTube',
      mediaTitle: 'गुरुदेव के साथ निर्देशित ध्यान',
      mediaSubtitle:
        'आर्ट ऑफ लिविंग के आधिकारिक YouTube चैनल से चुना हुआ — एक सत्र चुनें, फिर समाप्त होने पर बताएँ कैसा महसूस हुआ।',
      tipsTitle: 'इस स्थिति के लिए छोटे अभ्यास',
      openYoutube: 'YouTube पर खोलें',
      watchInline: 'यहीं चलाएँ',
      markComplete: 'मैंने यह सत्र पूरा किया',
      channelNote: 'वीडियो © आर्ट ऑफ लिविंग / गुरudev श्री श्री रवि शंकर — YouTube में खुलता है।',
      feedbackTitle: 'यह सत्र आपके लिए कैसा रहा?',
      feedbackSubtitle:
        'आपका उत्तर इस अनुभव को बेहतर बनाने में मदद करता है; लॉग इन होने पर आपका वेलनेस मूड भी अपडेट होता है।',
      improvementLabel: 'कितना बेहतर महसूस कर रहे हैं?',
      improvementHint: '0 = कोई बदलाव नहीं · 100 = बहुत बेहतर',
      afterMoodLabel: 'अभी आप कैसा महसूस कर रहे हैं?',
      afterMoodPlaceholder: 'अपना मूड चुनें',
      afterMoodSkip: 'नहीं बताना',
      submitFeedback: 'फीडबैक सहेजें',
      feedbackSuccess: 'धन्यवाद — आपका मूड अपडेट हो गया।',
      feedbackSuccessGuest: 'धन्यवाद — आपका फीडबैक सहेजा गया।',
      profileCardTitle: 'वेलनेस मूड',
      profileCardLine:
        'अंतिम अपडेट निर्देशित सत्र से: {{mood}} · आपने {{pct}}% बेहतर महसूस किया।',
      profileCardEmpty:
        'होम पर “आपके लिए” से ध्यान पूरा करके फीडबैक दें — यहाँ आपका मूड दिखेगा।',
      recentSessions: 'हाल के सत्र',
    },
    advanced: moodAdvancedHi as unknown as Translations,
  },
  home: {
    index: {
      forYou: 'आपके लिए',
      standardHome: 'मानक होम',
      logoToggleAria: 'मानक होम और “आपके लिए” होम के बीच बदलें',
    },
    hero: {
      sectionAria: 'मुखपृष्ठ शीर्ष भाग',
      badge: '13 मई · गुरुदेव जन्मदिन समारोह',
      headline:
        'आर्ट ऑफ लिविंग बैंगलोर आश्रम में आंतरिक शांति की खोज करें',
      headlineA: 'अंतरिक शांति खोजें',
      headlineB: 'द एओएलआईसी बैंगलोर',
      subhead: 'आर्ट ऑफ लिविंग बैंगलोर आश्रम',
      description:
        'दुनिया भर में लाखों लोगों के साथ योग, ध्यान और श्वास कार्यक्रमों में बदलाव लाएँ। आधुनिक परिवेश में प्राचीन ज्ञान का अनुभव करें।',
      statEyebrow: 'वैश्विक उपस्थिति',
      statLives: 'जीवन स्पर्शित',
      statCountries: 'देश',
      statYears: 'प्रभाव के वर्ष',
      explorePrograms: 'कार्यक्रम देखें',
      watchVideo: 'वीडियो देखें',
      cardFeatured: 'स्पॉटलाइट',
      cardProgramTitle: 'हैपिनेस प्रोग्राम',
      cardProgramDesc: 'सुदर्शन क्रिया सीखें और जीवन बदलें',
      cardDates: '25 – 28 जनवरी, 2026',
      cardLocation: 'बैंगलोर आश्रम',
      cardSpots: '48 स्थान शेष',
      featuredEventCta: 'समारोह विवरण',
      featuredEventSecondary: 'पंजीकरण',
      featuredEventLive: 'अब विश्वभर में प्रसारित',
      featuredEventConcluded: 'अभिलेख देखें',
      countdownHeadingStart: 'शुरू होगा',
      countdownHeadingEnd: 'समाप्त होगा',
      countdownAriaStart: 'इस आयोजन के शुरू होने तक शेष समय',
      countdownAriaEnd: 'इस आयोजन के समाप्त होने तक शेष समय',
      registerNow: 'अभी पंजीकरण',
      videoModalTitle: 'बैंगलोर आश्रम — हवाई दृश्य (4K)',
      videoModalDesc:
        'द आर्ट ऑफ लिविंग इंटरनेशनल सेंटर पर सिनेमैटिक एफपीवी उड़ान। उच्चतम क्वालिटी के लिए प्लेयर में गियर आइकन चुनें।',
      imgAshramAlt: 'द एओएलआईसी बैंगलोर — आर्ट ऑफ लिविंग बैंगलोर आश्रम',
      imgProgramAlt: 'गुरुदेव जन्मदिन समारोह — स्पॉटलाइट आयोजन',
      kicker: 'गंभीर साधक के लिए आश्रय',
      lineage: 'स्थापना 1981 · आर्ट ऑफ लिविंग फाउंडेशन',
    },
    showcase: {
      eyebrow: 'टेम्पलेट से परे',
      headline: 'जहाँ श्वास, पत्थर और मौन एक क्षितिज साझा करते हैं।',
      lead:
        'यहाँ जो भी है वह असली पृष्ठों से जुड़ता है — बुक करने योग्य कार्यक्रम, देखने योग्य कहानियाँ, जुड़ने योग्य आयोजन। भरावट नहीं: अगला कदम एक टैप दूर।',
      brandLockup: 'द एओएलआईसी बैंगलोर',
      brandLine: 'आर्ट ऑफ लिविंग इंटरनेशनल सेंटर',
      ingressLabel: 'तीन प्रवेश',
      quickPrograms: 'कार्यक्रम हब',
      quickEvents: 'आयोजन कैलेंडर',
      quickVisit: 'आगमन, ठहरना व परिसर',
      logoAlt: 'द एओएलआईसी बैंगलोर लोगो',
      pillars: [
        {
          title: 'श्वास-प्रथम लय',
          body:
            'हम नारे से पहले तंत्रिका तंत्र सिखाते हैं। यह साइट शांत नेविगेशन रखती है ताकि आप बिना शोर के पाठ्यक्रम चुन सकें।',
          utility:
            'श्वास-आधारित कार्यक्रमों से शुरू करें — वही सुदर्शन क्रिया वंश जो परिसर पर सिखाया जाता है।',
          cta: 'सभी कार्यक्रम देखें',
          ctaSecondary: 'हैपिनेस प्रोग्राम',
        },
        {
          title: 'विरासत, उच्च रिज़ॉल्यूशन में',
          body:
            'गुरudev के चार दशकों का कार्य, संयम से — मिशन स्थिर, आवाज़ें प्रमाण।',
          utility: 'पढ़ें हम क्यों हैं, फिर शिक्षण वीडियो देखें जब गहराई चाहिए।',
          cta: 'मिशन और दृष्टि',
          ctaSecondary: 'वीडियो लाइब्रेरी',
        },
        {
          title: 'डिजिटल द्वार, मानव हॉल',
          body:
            'यह स्क्रीन बरामदा है: बदलाव अभी भी शरीर और दूसरों के साथ सत्संग में होता है।',
          utility: 'देखें क्या चल रहा है, फिर आगमन योजना बनाएँ — ठहरना, परिवहन, सेवाएँ।',
          cta: 'आगामी आयोजन',
          ctaSecondary: 'ठहरना व सेवाएँ',
        },
      ],
    },
    featured: {
      badge: 'अपना जीवन बदलें',
      title: 'आपकी यात्रा के हर चरण के लिए कार्यक्रम',
      subtitle:
        'शुरुआती से उन्नत अभ्यासियों तक — अपनी साधना गहरी करने और जीवन बदलने के लिए उपयुक्त कार्यक्रम चुनें।',
      learnMore: 'और जानें',
      exploreAll: 'सभी कार्यक्रम देखें',
      programs: {
        happiness: {
          title: 'हैपिनेस प्रोग्राम',
          description:
            'तनाव मुक्त करने और ऊर्जा पाने के लिए शक्तिशाली सुदर्शन क्रिया श्वास तकनीक सीखें।',
          level: 'शुरुआती',
          duration: '3 दिन',
          mode: 'ऑनलाइन और ऑफलाइन',
        },
        silence: {
          title: 'मौन रिट्रीट',
          description: 'शांत वातावरण में गहन मौन और ध्यान अभ्यास का अनुभव करें।',
          level: 'मध्यवर्ती',
          duration: '3–5 दिन',
          mode: 'आवासीय',
        },
        yoga: {
          title: 'श्री श्री योग',
          description: 'आसन, प्राणायाम और ध्यान से समग्र कल्याण के लिए पारंपरिक योग।',
          level: 'सभी स्तर',
          duration: 'निरंतर',
          mode: 'ऑनलाइन और ऑफलाइन',
        },
        advanced: {
          title: 'उन्नत कार्यक्रम',
          description: 'ध्यान में गहराई और उच्च चेतना की अवस्थाएँ।',
          level: 'उन्नत',
          duration: '4–7 दिन',
          mode: 'आवासीय',
        },
      },
    },
    cta: {
      badgeNewsletter: 'जुड़े रहें',
      newsletterTitle: 'अपडेट व प्रेरणा',
      newsletterDesc:
        'आने वाले कार्यक्रम, आयोजनों और गुरुदेव के संदेशों के लिए सदस्यता लें।',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      subscribe: 'सदस्यता लें',
      subscribing: 'भेजा जा रहा है...',
      privacyNote:
        'सदस्यता से आप हमारी गोपनीयता नीति से सहमत हैं। कभी भी सदस्यता समाप्त करें।',
      badgeVisit: 'हमें आएँ',
      visitTitle: 'आश्रम का अनुभव',
      visitDesc:
        'बैंगलोर की शांत पहाड़ियों में स्थित, हमारा आश्रम दुनिया भर के आगंतुकों को शांति और आध्यात्मिक विकास के लिए आमंत्रित करता है।',
      addressLabel: 'पता',
      addressLine1: 'आर्ट ऑफ लिविंग इंटरनेशनल सेंटर,',
      addressLine2: '21वाँ कि.मी., कनकपुरा रोड, उदयपुरा,',
      addressLine3: 'बेंगलुरु - 560082, भारत',
      phoneLabel: 'फ़ोन',
      emailLabel: 'ईमेल',
      getDirections: 'दिशा-निर्देश',
    },
    upcomingEvents: {
      badge: 'आगामी कार्यक्रम',
      title: 'आने वाला कुछ न चूकें',
      subtitle: 'बदलावकारी अनुभव और उत्सव में शामिल हों',
      viewAll: 'सभी कार्यक्रम देखें',
      featured: 'विशेष',
      learnMore: 'और जानें',
      expected: '{{count}} अपेक्षित',
      events: {
        '1': {
          title: 'महा शिवरात्रि उत्सव',
          description: 'ध्यान, संगीत और आध्यात्मिक अभ्यासों के साथ भव्य उत्सव में शामिल हों',
          date: '26 फ़रवरी, 2026',
          time: 'शाम 6:00 – सुबह 6:00',
          location: 'बैंगलोर आश्रम',
        },
        '2': {
          title: 'मौन रिट्रीट',
          description: 'निर्देशित मौन के साथ 3 दिनों में ध्यान में गहराई',
          date: '25 – 28 जनवरी, 2026',
          time: 'आवासीय',
          location: 'आश्रम परिसर',
        },
        '3': {
          title: 'उन्नत ध्यान कार्यक्रम',
          description: 'चेतना की गहरी परतों का अन्वेषण',
          date: '5 – 8 फ़रवरी, 2026',
          time: 'सुबह 8:00 – शाम 6:00',
          location: 'मुख्य हॉल',
        },
      },
    },
    mission: {
      missionEyebrow: 'हमारा मिशन',
      missionTitle: 'तनाव-मुक्त, हिंसा-मुक्त दुनिया',
      missionBody:
        'आर्ट ऑफ लिविंग फाउंडेशन एक वैश्विक मानवीय संगठन है जिसकी स्थापना 1981 में गुरुदेव श्री श्री रवि शंकर ने की। हमारे कार्यक्रमों ने दुनिया भर में लाखों लोगों को तनाव प्रबंधन, कल्याण और पूर्ण मानवीय क्षमता का अनुभव करने में मदद की है।',
      visionEyebrow: 'हमारी दृष्टि',
      visionBody:
        'ऐसा संसार जहाँ हर व्यक्ति स्वयं, दूसरों और प्रकृति के साथ सामंजस्य में रहे। प्राचीन ज्ञान और आधुनिक विज्ञान के माध्यम से हम लोगों को जीवन की पूरी क्षमता जीने के लिए सशक्त बनाते हैं।',
      values: {
        service: {
          title: 'सेवा',
          description: 'विश्व भर में मानवीय पहलों के माध्यम से निःस्वार्थ सेवा।',
        },
        globalPeace: {
          title: 'वैश्विक शांति',
          description: 'ध्यान और श्वास से हिंसा-मुक्त, तनाव-मुक्त समाज।',
        },
        community: {
          title: 'समुदाय',
          description: 'साझा अभ्यासों और मूल्यों से जुड़ा विश्व परिवार।',
        },
        sustainability: {
          title: 'टिकाऊपन',
          description: 'हरित ग्रह के लिए पर्यावरण पहलें और टिकाऊ अभ्यास।',
        },
      },
      stats: {
        livesTouched: 'जीवन स्पर्शित',
        countries: 'देश',
        yearsService: 'सेवा के वर्ष',
        volunteers: 'स्वयंसेवक',
      },
    },
    testimonials: {
      badge: 'सच्ची कहानियाँ',
      title: 'हमारे समुदाय की बात',
      subtitle: 'हमारे कार्यक्रमों से लाखों लोगों ने जीवन बदला — आप भी जुड़ें',
      items: {
        '1': {
          quote: 'सुदर्शन क्रिया योग ने मेरे जीवन में बड़ा बदलाव लाया',
          role: 'ट्रेनर, गणित में मास्टर, आईआईटी मुंबई',
          program: 'सुदर्शन क्रिया',
        },
        '2': {
          quote: 'मुझे और मेरी टीम को नई ऊर्जा मिलती है',
          role: 'बॉलीवुड फ़िल्म निर्माता, मुंबई',
          program: 'मौन रिट्रीट',
        },
        '3': {
          quote:
            'सहज के माध्यम से मुझे पूर्ण मौन का अनुभव हुआ। मंत्र का इतना प्रभाव पहले नहीं पता था — जब तक स्वयं अनुभव न किया!',
          role: 'भर्ती विशेषज्ञ',
          program: '',
        },
        '4': {
          quote: 'अवसाद से बाहर निकलने में मदद मिली',
          role: 'टेलीविज़न अभिनेता',
          program: '',
        },
      },
    },
  },
};

/**
 * Maps language picker codes to the one UI bundle we fully ship (avoids mixed EN + HI on screen).
 * Indic/regional → Hindi UI; world languages → English UI until dedicated bundles exist.
 */
const LOCALE_TO_CANONICAL: Record<string, string> = {
  kn: 'hi',
  ta: 'hi',
  te: 'hi',
  mr: 'hi',
  gu: 'hi',
  bn: 'hi',
  pa: 'hi',
  ml: 'hi',
  es: 'en',
  fr: 'en',
  de: 'en',
  pt: 'en',
  zh: 'en',
  ja: 'en',
  ko: 'en',
  ar: 'en',
  ru: 'en',
};

// Translation map — only full bundles; other codes resolve via canonicalLanguage()
const translations: Record<string, Translations> = {
  en,
  hi,
};

function canonicalLanguage(langCode: string): string {
  const mapped = LOCALE_TO_CANONICAL[langCode];
  if (mapped) return mapped;
  if (langCode in translations) return langCode;
  return 'en';
}

/** Raw profile language (e.g. `kn`) vs bundled UI (`hi` / `en`) — for display or logic. */
export function getCanonicalUiLanguage(rawLanguage: string | undefined): string {
  return canonicalLanguage(rawLanguage || 'en');
}

/**
 * Walk locale tree: structure from English; leaf strings only from the active bundle
 * (no English leak when Hindi or another non-English bundle is selected).
 */
function resolveTranslation(langCode: string, key: string): string {
  const canonical = canonicalLanguage(langCode);
  const parts = key.split('.').filter(Boolean);
  if (parts.length === 0) return key;

  const enRoot = translations.en as Record<string, unknown>;
  const langRoot = (translations[canonical] ?? {}) as Record<string, unknown>;
  const allowEnglishLeafFallback = canonical === 'en';

  function walk(ln: unknown, en: unknown, i: number): string | null {
    const k = parts[i];
    const eNode =
      en && typeof en === 'object' && en !== null ? (en as Record<string, unknown>)[k] : undefined;
    const lNode =
      ln && typeof ln === 'object' && ln !== null ? (ln as Record<string, unknown>)[k] : undefined;

    if (i === parts.length - 1) {
      if (typeof lNode === 'string') return lNode;
      if (allowEnglishLeafFallback && typeof eNode === 'string') return eNode;
      return null;
    }

    if (eNode === undefined || typeof eNode !== 'object' || eNode === null) {
      return null;
    }

    const nextEn = eNode as Record<string, unknown>;
    const nextLn =
      lNode !== undefined && typeof lNode === 'object' && lNode !== null
        ? (lNode as Record<string, unknown>)
        : {};

    return walk(nextLn, nextEn, i + 1);
  }

  const resolved = walk(langRoot, enRoot, 0);
  if (resolved !== null) return resolved;
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing string for "${canonical}": ${key}`);
  }
  return key;
}

// Get translation function (now uses global state)
export function t(key: TranslationKey, language?: string): string {
  /** Prefer persisted Zustand language — getSyncedLanguage can lag one frame behind (see setLanguage). */
  const lang = language || useUserStore.getState().language || getSyncedLanguage() || 'en';
  const k = String(key);
  if (!k.includes('.')) {
    const common = resolveTranslation(lang, `common.${k}`);
    if (common !== `common.${k}`) return common;
    return resolveTranslation(lang, k);
  }
  return resolveTranslation(lang, k);
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
    try {
      return t(key, language || getSyncedLanguage() || 'en');
    } catch (error) {
      // Fallback to key if translation fails
      console.warn('Translation error for key:', key, error);
      return String(key);
    }
  };

  return {
    t: translate,
    language: language || getSyncedLanguage() || 'en',
    setLanguage,
    _updateTrigger: updateTrigger, // Force re-render when language changes
  };
}

// Initialize global language from store on load
if (typeof window !== 'undefined') {
  const initialState = useUserStore.getState().language;
  if (initialState) {
    setSyncedLanguageInitial(initialState);
  }
}

// Export default translation function
export default t;

/** Re-export for callers that imported from i18n (implementation lives in languageSync). */
export { updateGlobalLanguage, subscribeToLanguageChange } from '@/lib/languageSync';
