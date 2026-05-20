/**
 * Country calling codes for phone/WhatsApp inputs (E.164-style + prefix + national digits).
 * Parsing matches the longest known prefix first.
 */

export const DEFAULT_PHONE_DIAL = '+91';

/** One entry per distinct international prefix shown in the selector (sorted by label). */
export const PHONE_DIAL_OPTIONS: readonly { dial: string; label: string }[] = [
  { dial: '+1', label: 'United States / Canada (+1)' },
  { dial: '+7', label: 'Russia / Kazakhstan (+7)' },
  { dial: '+20', label: 'Egypt (+20)' },
  { dial: '+27', label: 'South Africa (+27)' },
  { dial: '+30', label: 'Greece (+30)' },
  { dial: '+31', label: 'Netherlands (+31)' },
  { dial: '+32', label: 'Belgium (+32)' },
  { dial: '+33', label: 'France (+33)' },
  { dial: '+34', label: 'Spain (+34)' },
  { dial: '+36', label: 'Hungary (+36)' },
  { dial: '+39', label: 'Italy (+39)' },
  { dial: '+40', label: 'Romania (+40)' },
  { dial: '+41', label: 'Switzerland (+41)' },
  { dial: '+43', label: 'Austria (+43)' },
  { dial: '+44', label: 'United Kingdom (+44)' },
  { dial: '+45', label: 'Denmark (+45)' },
  { dial: '+46', label: 'Sweden (+46)' },
  { dial: '+47', label: 'Norway (+47)' },
  { dial: '+48', label: 'Poland (+48)' },
  { dial: '+49', label: 'Germany (+49)' },
  { dial: '+51', label: 'Peru (+51)' },
  { dial: '+52', label: 'Mexico (+52)' },
  { dial: '+53', label: 'Cuba (+53)' },
  { dial: '+54', label: 'Argentina (+54)' },
  { dial: '+55', label: 'Brazil (+55)' },
  { dial: '+56', label: 'Chile (+56)' },
  { dial: '+57', label: 'Colombia (+57)' },
  { dial: '+58', label: 'Venezuela (+58)' },
  { dial: '+60', label: 'Malaysia (+60)' },
  { dial: '+61', label: 'Australia (+61)' },
  { dial: '+62', label: 'Indonesia (+62)' },
  { dial: '+63', label: 'Philippines (+63)' },
  { dial: '+64', label: 'New Zealand (+64)' },
  { dial: '+65', label: 'Singapore (+65)' },
  { dial: '+66', label: 'Thailand (+66)' },
  { dial: '+81', label: 'Japan (+81)' },
  { dial: '+82', label: 'South Korea (+82)' },
  { dial: '+84', label: 'Vietnam (+84)' },
  { dial: '+86', label: 'China (+86)' },
  { dial: '+90', label: 'Türkiye (+90)' },
  { dial: '+91', label: 'India (+91)' },
  { dial: '+92', label: 'Pakistan (+92)' },
  { dial: '+93', label: 'Afghanistan (+93)' },
  { dial: '+94', label: 'Sri Lanka (+94)' },
  { dial: '+95', label: 'Myanmar (+95)' },
  { dial: '+98', label: 'Iran (+98)' },
  { dial: '+211', label: 'South Sudan (+211)' },
  { dial: '+212', label: 'Morocco (+212)' },
  { dial: '+213', label: 'Algeria (+213)' },
  { dial: '+216', label: 'Tunisia (+216)' },
  { dial: '+218', label: 'Libya (+218)' },
  { dial: '+220', label: 'Gambia (+220)' },
  { dial: '+221', label: 'Senegal (+221)' },
  { dial: '+234', label: 'Nigeria (+234)' },
  { dial: '+250', label: 'Rwanda (+250)' },
  { dial: '+254', label: 'Kenya (+254)' },
  { dial: '+255', label: 'Tanzania (+255)' },
  { dial: '+256', label: 'Uganda (+256)' },
  { dial: '+260', label: 'Zambia (+260)' },
  { dial: '+263', label: 'Zimbabwe (+263)' },
  { dial: '+351', label: 'Portugal (+351)' },
  { dial: '+352', label: 'Luxembourg (+352)' },
  { dial: '+353', label: 'Ireland (+353)' },
  { dial: '+354', label: 'Iceland (+354)' },
  { dial: '+355', label: 'Albania (+355)' },
  { dial: '+358', label: 'Finland (+358)' },
  { dial: '+370', label: 'Lithuania (+370)' },
  { dial: '+371', label: 'Latvia (+371)' },
  { dial: '+372', label: 'Estonia (+372)' },
  { dial: '+380', label: 'Ukraine (+380)' },
  { dial: '+385', label: 'Croatia (+385)' },
  { dial: '+386', label: 'Slovenia (+386)' },
  { dial: '+420', label: 'Czech Republic (+420)' },
  { dial: '+421', label: 'Slovakia (+421)' },
  { dial: '+852', label: 'Hong Kong (+852)' },
  { dial: '+853', label: 'Macau (+853)' },
  { dial: '+855', label: 'Cambodia (+855)' },
  { dial: '+856', label: 'Laos (+856)' },
  { dial: '+880', label: 'Bangladesh (+880)' },
  { dial: '+886', label: 'Taiwan (+886)' },
  { dial: '+960', label: 'Maldives (+960)' },
  { dial: '+961', label: 'Lebanon (+961)' },
  { dial: '+962', label: 'Jordan (+962)' },
  { dial: '+963', label: 'Syria (+963)' },
  { dial: '+964', label: 'Iraq (+964)' },
  { dial: '+965', label: 'Kuwait (+965)' },
  { dial: '+966', label: 'Saudi Arabia (+966)' },
  { dial: '+967', label: 'Yemen (+967)' },
  { dial: '+968', label: 'Oman (+968)' },
  { dial: '+970', label: 'Palestine (+970)' },
  { dial: '+971', label: 'United Arab Emirates (+971)' },
  { dial: '+972', label: 'Israel (+972)' },
  { dial: '+973', label: 'Bahrain (+973)' },
  { dial: '+974', label: 'Qatar (+974)' },
  { dial: '+975', label: 'Bhutan (+975)' },
  { dial: '+976', label: 'Mongolia (+976)' },
  { dial: '+977', label: 'Nepal (+977)' },
  { dial: '+992', label: 'Tajikistan (+992)' },
  { dial: '+993', label: 'Turkmenistan (+993)' },
  { dial: '+994', label: 'Azerbaijan (+994)' },
  { dial: '+995', label: 'Georgia (+995)' },
  { dial: '+996', label: 'Kyrgyzstan (+996)' },
  { dial: '+998', label: 'Uzbekistan (+998)' },
].sort((a, b) => a.label.localeCompare(b.label, 'en'));

const PREFIXES_LONGEST_FIRST = [...new Set(PHONE_DIAL_OPTIONS.map((o) => o.dial))].sort(
  (a, b) => b.slice(1).length - a.slice(1).length,
);

/**
 * Split a stored phone string into dial code and national digits (digits only after country code).
 */
export function splitE164(raw: string): { dial: string; national: string } {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return { dial: DEFAULT_PHONE_DIAL, national: '' };

  if (!s.startsWith('+')) {
    const digits = s.replace(/\D/g, '');
    return { dial: DEFAULT_PHONE_DIAL, national: digits };
  }

  const fullDigits = s.slice(1).replace(/\D/g, '');
  for (const p of PREFIXES_LONGEST_FIRST) {
    const prefixDigits = p.slice(1);
    if (fullDigits.startsWith(prefixDigits)) {
      return { dial: p, national: fullDigits.slice(prefixDigits.length) };
    }
  }
  return { dial: DEFAULT_PHONE_DIAL, national: fullDigits };
}

/** Combine dial (+CC) and national number into one E.164-style string (no spaces). */
export function combineE164(dial: string, national: string): string {
  const d = national.replace(/\D/g, '');
  if (!d) return '';
  const code = dial.startsWith('+') ? dial : `+${dial.replace(/^\+/, '')}`;
  return `${code}${d}`;
}
