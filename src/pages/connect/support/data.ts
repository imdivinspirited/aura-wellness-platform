// ==================== TYPE DEFINITIONS ====================
export interface Program {
  id: string;
  name: string;
  category?: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  value: string;
}

export interface SupportFormData {
  programs: Program[];
  timeSlots: TimeSlot[];
  consentText: string;
}

// ==================== SUPPORT DESK DATA ====================
export const supportFormData: SupportFormData = {
  programs: [
    { id: 'happiness-program', name: 'Happiness Program', category: 'Beginning' },
    { id: 'sri-sri-yoga', name: 'Sri Sri Yoga Classes', category: 'Beginning' },
    { id: 'sahaj-samadhi', name: 'Sahaj Samadhi Dhyan Yoga', category: 'Beginning' },
    { id: 'silence-retreat', name: 'Silence Retreat', category: 'Beginning' },
    { id: 'wellness', name: 'Wellness Programs', category: 'Beginning' },
    { id: 'corporate', name: 'Corporate Programs', category: 'Beginning' },
    { id: 'amp', name: 'Advanced Meditation Program (AMP)', category: 'Advanced' },
    { id: 'dsn', name: 'Dynamism for Self & Nation (DSN)', category: 'Advanced' },
    { id: 'blessings', name: 'The Blessings Program', category: 'Advanced' },
    { id: 'ssy-level-2', name: 'Sri Sri Yoga Deep Dive (Level 2)', category: 'Advanced' },
    { id: 'samyam', name: 'Samyam', category: 'Advanced' },
    { id: 'other', name: 'Other / General Inquiry', category: 'Other' },
  ],
  timeSlots: [
    { id: 'morning', label: 'Morning (9:00 AM - 12:00 PM IST)', value: 'morning' },
    { id: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM IST)', value: 'afternoon' },
    { id: 'evening', label: 'Evening (4:00 PM - 7:00 PM IST)', value: 'evening' },
    { id: 'flexible', label: 'Flexible / Any Time', value: 'flexible' },
  ],
  consentText:
    'I consent to Art of Living Foundation contacting me via phone or email regarding my inquiry. I understand that my information will be used solely for the purpose of responding to my request and will be handled in accordance with the Privacy Policy.',
};
