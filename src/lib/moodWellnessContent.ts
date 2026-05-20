/**
 * Curated Gurudev / Art of Living YouTube sessions + micro-practices per UI mood.
 * Video IDs point to official channel uploads (titles describe intent for each mood).
 */
import type { MoodType } from '@/stores/userStore';

export type MoodKey = NonNullable<MoodType>;

export type WellnessVideo = {
  youtubeId: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
};

export const WELLNESS_VIDEOS: Record<MoodKey, WellnessVideo[]> = {
  happy: [
    {
      youtubeId: '4Rtaw8gbpiM',
      titleEn: 'Guided meditation — expand joy & inner peace',
      titleHi: 'निर्देशित ध्यान — आनंद व आंतरिक शांति',
      descEn: 'A short guided sit with Gurudev to channel uplifted energy without scattering it.',
      descHi: 'गुरudev के साथ संक्षिप्त निर्देशित ध्यान — उत्साह को बिखराए बिना केंद्रित करें।',
    },
    {
      youtubeId: 'ztLkLKMN5L8',
      titleEn: 'Stargazing — deep rest after a full day',
      titleHi: 'स्टारगेज़िंग — दिन भर के बाद गहरा आराम',
      descEn: 'Gentle visualization and breath — beautiful when your mind is bright but tired.',
      descHi: 'कोमल कल्पना और श्वास — जब मन प्रसन्न हो पर थका हो।',
    },
    {
      youtubeId: 'zLJu3wQA1Ko',
      titleEn: 'Yoga Nidra — soak in stillness',
      titleHi: 'योग निद्रा — शांति में विसर्जन',
      descEn: 'Non-sleep deep rest to integrate positivity into the body.',
      descHi: 'गहरी विश्राम अवस्था — सकारात्मकता को शरीर में उतारने के लिए।',
    },
  ],
  calm: [
    {
      youtubeId: 'zLJu3wQA1Ko',
      titleEn: 'Yoga Nidra with Gurudev',
      titleHi: 'गुरudev के साथ योग निद्रा',
      descEn: 'Systematic relaxation — ideal when you are already calm and want to go deeper.',
      descHi: 'व्यवस्थित विश्राम — जब आप शांत हों और गहराई चाहें।',
    },
    {
      youtubeId: 'RcXemRLVW1Q',
      titleEn: 'Advanced Yoga Nidra — long-form rest',
      titleHi: 'उन्नत योग निद्रा — लंबा सत्र',
      descEn: 'Extended NSDR-style session for sustained quietness.',
      descHi: 'लंबा एनएसडीआर-शैली सत्र — लगातार शांति के लिए।',
    },
    {
      youtubeId: '4Rtaw8gbpiM',
      titleEn: 'Inner peace — breath-led stillness',
      titleHi: 'आंतरिक शांति — श्वास के साथ स्थिरता',
      descEn: 'Simple guided meditation to refine the calm you already feel.',
      descHi: 'सरल निर्देशित ध्यान — मौजूदा शांति को निखारने के लिए।',
    },
  ],
  neutral: [
    {
      youtubeId: '4Rtaw8gbpiM',
      titleEn: 'Guided meditation for clarity',
      titleHi: 'स्पष्टता के लिए निर्देशित ध्यान',
      descEn: 'When you feel even — use this to gently awaken curiosity and presence.',
      descHi: 'जब मन सामान्य हो — जिज्ञासा और उपस्थिति जगाने के लिए।',
    },
    {
      youtubeId: 'zLJu3wQA1Ko',
      titleEn: 'Yoga Nidra — recharge without sleep',
      titleHi: 'योग निद्रा — नींद के बिना ऊर्जा',
      descEn: 'A structured reset that meets you where you are.',
      descHi: 'संरचित रीसेट — जहाँ आप हैं वहीं से शुरू।',
    },
    {
      youtubeId: 'ztLkLKMN5L8',
      titleEn: 'Evening wind-down with Gurudev',
      titleHi: 'शाम का विश्राम गुरudev के साथ',
      descEn: 'Soft guidance for transitioning from flatness to ease.',
      descHi: 'सपाटता से सहजता की ओर संक्रमण के लिए कोमल मार्गदर्शन।',
    },
  ],
  sad: [
    {
      youtubeId: '4Rtaw8gbpiM',
      titleEn: 'Held in kindness — inner peace meditation',
      titleHi: 'दया में आश्रय — आंतरिक शांति ध्यान',
      descEn: 'Slow, compassionate pacing; let the breath move what feels heavy.',
      descHi: 'धीमा, करुणामय लय — भारीपन में श्वास को चलने दें।',
    },
    {
      youtubeId: 'ztLkLKMN5L8',
      titleEn: 'Night-time release — stargazing meditation',
      titleHi: 'रात में विमोचन — स्टारगेज़िंग',
      descEn: 'Soothing imagery when emotions feel close to the surface.',
      descHi: 'जब भावना सतह के पास हो — सुखद कल्पना।',
    },
    {
      youtubeId: 'zLJu3wQA1Ko',
      titleEn: 'Yoga Nidra — nervous system care',
      titleHi: 'योग निद्रा — तंत्रिका तंत्र की देखभाल',
      descEn: 'Deep rest without needing to “fix” anything first.',
      descHi: 'पहले “ठीक” किए बिना गहरा आराम।',
    },
  ],
  depressed: [
    {
      youtubeId: 'zLJu3wQA1Ko',
      titleEn: 'Gentle Yoga Nidra — minimum effort',
      titleHi: 'कोमल योग निद्रा — न्यूनतम प्रयास',
      descEn: 'Lie down if you can; the practice meets exhaustion with softness.',
      descHi: 'लेट सकें तो लेटें — थकान से कोमलता से मिलन।',
    },
    {
      youtubeId: 'ztLkLKMN5L8',
      titleEn: 'Deep rest — sleep-oriented guidance',
      titleHi: 'गहरा आराम — नींद की दिशा में मार्गदर्शन',
      descEn: 'No pressure to feel better — only safety and breath.',
      descHi: 'बेहतर महसूस करने का दबाव नहीं — केवल सुरक्षा और श्वास।',
    },
    {
      youtubeId: '4Rtaw8gbpiM',
      titleEn: 'Short peace practice — tiny steps',
      titleHi: 'छोटी शांति अभ्यास — छोटे कदम',
      descEn: 'If a full session feels like too much, try just the opening minutes.',
      descHi: 'अगर पूरा सत्र भारी लगे, शुरुआत के कुछ मिनट आज़माएँ।',
    },
  ],
  stressed: [
    {
      youtubeId: '4Rtaw8gbpiM',
      titleEn: 'Stress relief — guided inner peace',
      titleHi: 'तनाव मुक्ति — निर्देशित आंतरिक शांति',
      descEn: 'Breath-led settling for wired minds and tight bodies.',
      descHi: 'बेचैन मन और तनावपूर्ण शरीर के लिए श्वास से शांति।',
    },
    {
      youtubeId: 'zLJu3wQA1Ko',
      titleEn: 'Yoga Nidra — downshift the nervous system',
      titleHi: 'योग निद्रा — तंत्रिका तंत्र शांत करें',
      descEn: 'Evidence-informed deep rest used worldwide for overload.',
      descHi: 'दुनिया में अधिभार के लिए उपयोग होने वाला गहरा आराम।',
    },
    {
      youtubeId: 'RcXemRLVW1Q',
      titleEn: 'Long Yoga Nidra — complete reset',
      titleHi: 'लंबा योग निद्रा — पूर्ण रीसेट',
      descEn: 'When you have time, let the body unclench fully.',
      descHi: 'जब समय हो — शरीर को पूरी तरह ढीला होने दें।',
    },
  ],
};

export const WELLNESS_TIPS: Record<MoodKey, { en: string[]; hi: string[] }> = {
  happy: {
    en: [
      'Take three slow breaths before your next message or meeting — keep the joy steady, not scattered.',
      'Offer one small act of seva today; channeling light outward often deepens it inward.',
      'Notice where the smile lives in the body — shoulders, eyes, chest — and stay there for one minute.',
      'Journal one sentence: “What I wish to share from this mood is…”',
    ],
    hi: [
      'अगला संदेश या मीटिंग से पहले तीन धीमी साँसें — आनंद को बिखराए नहीं, स्थिर रखें।',
      'आज एक छोटा सेवा कदम — बाहर की रोशनी अक्सर भीतर गहराती है।',
      'मुस्कान शरीर में कहाँ है — कंधे, आँखें, छाती — एक मिनट वहीं रहें।',
      'एक वाक्य लिखें: “इस मूड से मैं क्या साझा करना चाहता/चाहती हूँ…”',
    ],
  },
  calm: {
    en: [
      'Sit with spine tall but soft; exhale twice as long as inhale for two minutes.',
      'Walk barefoot on grass or earth if you can — five mindful steps are enough.',
      'Limit inputs: silence notifications for a short window and notice the quality of calm.',
      'Sip warm water slowly; treat it as part of the practice.',
    ],
    hi: [
      'रीढ़ सीधी पर नरम; दो मिनट तक साँस छोड़ना लंबा रखें।',
      'यदि हो सके नंगे पैर घास पर — पाँच सचेत कदम काफ़ी हैं।',
      'इनपुट कम करें: थोड़ी देर सूचनाएँ बंद रखें और शांति की गुणवत्ता देखें।',
      'गर्म पानी धीरे पिएं — इसे अभ्यास का हिस्सा मानें।',
    ],
  },
  neutral: {
    en: [
      'Name three sounds you hear right now — curiosity breaks autopilot.',
      'Stretch arms overhead, interlace fingers, breathe into the side ribs.',
      'Read one paragraph of wisdom slowly, aloud or silently, with full attention.',
      'Choose one tiny “yes” for today — a short walk, a glass of water, one page of a book.',
    ],
    hi: [
      'अभी तीन आवाज़ें गिनें — जिज्ञासा ऑटोपायलट तोड़ती है।',
      'बाँहें ऊपर, उंगलियाँ फँसाकर, पसलियों में साँस भरें।',
      'एक अनुच्छेद ज्ञान धीरे पढ़ें — पूरा ध्यान।',
      'आज के लिए एक छोटा “हाँ” चुनें — छोटी सैर, पानी, एक पृष्ठ।',
    ],
  },
  sad: {
    en: [
      'Place one hand on the heart, one on the belly — breathe as if comforting a friend.',
      'Let tears be allowed; softness is not weakness.',
      'Reach out to one trusted person with a single honest sentence — no need for a solution.',
      'Keep the room a little warmer and lighting gentle — your system deserves care.',
    ],
    hi: [
      'एक हाथ हृदय पर, एक पेट पर — जैसे मित्र को सांत्वना।',
      'आँसों को अनुमति — कोमलता कमज़ोरी नहीं।',
      'एक भरोसेमंद व्यक्ति को एक ईमानदार वाक्य — समाधान ज़रूरी नहीं।',
      'कमरा थोड़ा गर्म, रोशनी कोमल — आपके तंत्र को देखभाल चाहिए।',
    ],
  },
  depressed: {
    en: [
      'Smallest possible action: sit up, drink water, open a window — victory counts.',
      'Avoid judging the day by morning mood; move in micro-steps.',
      'If you need human contact, our Connect page lists listening support — you do not have to carry this alone.',
      'Nature or daylight near a window for a few minutes can shift chemistry gently.',
    ],
    hi: [
      'सबसे छोटा कदम: बैठें, पानी पिएं, खिड़की खोलें — जीत गिनती है।',
      'दिन को सुबह के मूड से नापें — सूक्ष्म कदम।',
      'संपर्क चाहिए तो कनेक्ट पर सुनने वाली सहायता — अकेले नहीं।',
      'प्रकृति या खिड़की के पास कुछ मिनट — रसायन को हल्के से बदल सकता है।',
    ],
  },
  stressed: {
    en: [
      'Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4 — three rounds.',
      'Unclench jaw and drop shoulders on every exhale for one minute.',
      'Write a “brain dump” list — paper can hold what the mind is juggling.',
      'Short walk, even indoors — pace change signals safety to the body.',
    ],
    hi: [
      'बॉक्स श्वास: 4 भरें · 4 रोकें · 4 छोड़ें · 4 रोकें — तीन चक्र।',
      'हर छोड़ते समय जबड़ा ढीला, कंधे नीचे — एक मिनट।',
      '“ब्रेन डम्प” लिस्ट लिखें — कागज़ संभाल सकता है जो मन जगल कर रहा है।',
      'छोटी सैर, घर के अंदर भी — गति बदलना शरीर को सुरक्षा का संकेत।',
    ],
  },
};

export function getWellnessVideos(mood: MoodKey): WellnessVideo[] {
  return WELLNESS_VIDEOS[mood] ?? WELLNESS_VIDEOS.neutral;
}

export function getWellnessTips(mood: MoodKey, lang: string): string[] {
  const t = WELLNESS_TIPS[mood] ?? WELLNESS_TIPS.neutral;
  return lang === 'hi' ? t.hi : t.en;
}
