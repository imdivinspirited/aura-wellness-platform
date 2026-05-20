// ==================== TYPE DEFINITIONS ====================
export interface TransportInfo {
  title: string;
  description: string;
  details: string[];
}

export interface BookingAssistance {
  title: string;
  description: string;
  contactInfo: {
    phone: string;
    email: string;
    hours: string;
  };
}

export interface Timing {
  location: string;
  timings: string;
  notes?: string;
}

export interface ContactMethod {
  type: 'phone' | 'email';
  label: string;
  value: string;
  action?: 'call' | 'email' | 'copy';
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  fullAddress: string;
}

export interface SocialMedia {
  platform: string;
  url: string;
  icon: string; // Icon name from lucide-react
}

export interface TravelOption {
  id: string;
  title: string;
  description: string;
  details: string[];
}

export interface FounderInfo {
  name: string;
  title: string;
  description: string;
}

export interface ContactPageData {
  transportInfo: TransportInfo;
  bookingAssistance: BookingAssistance;
  timings: Timing[];
  contactMethods: ContactMethod[];
  address: Address;
  socialMedia: SocialMedia[];
  travelOptions: TravelOption[];
  founder: FounderInfo;
  mapLocation: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

// ==================== CONTACT PAGE DATA ====================
export const contactPageData: ContactPageData = {
  transportInfo: {
    title: 'Transport Updates',
    description: 'BMTC A/C Bus Information',
    details: [
      'BMTC A/C buses are available from various points in Bangalore to the Ashram',
      'Route numbers: 335, 335A, 335B, 335C',
      'Frequency: Every 30-45 minutes during peak hours',
      'Operating hours: 6:00 AM to 10:00 PM',
      'For latest schedules and route updates, please contact BMTC helpline: 080-2295-2000',
    ],
  },
  bookingAssistance: {
    title: 'Booking Assistance',
    description: 'Need help with bookings? Our team is here to assist you.',
    contactInfo: {
      phone: '+91-80-2843-2000',
      email: 'bookings@artofliving.org',
      hours: 'Monday to Saturday, 9:00 AM to 6:00 PM IST',
    },
  },
  timings: [
    {
      location: 'Vishalakshi Mantap',
      timings: '6:00 AM - 9:00 PM (Daily)',
      notes: 'Meditation and prayer hall. Open for all visitors.',
    },
    {
      location: 'Check-in Counter',
      timings: '7:00 AM - 9:00 PM (Daily)',
      notes: 'For accommodation and program registrations.',
    },
  ],
  contactMethods: [
    {
      type: 'phone',
      label: 'Main Phone',
      value: '+91-80-2843-2000',
      action: 'call',
    },
    {
      type: 'phone',
      label: 'Helpline',
      value: '+91-80-2843-2100',
      action: 'call',
    },
    {
      type: 'email',
      label: 'General Inquiries',
      value: 'info@artofliving.org',
      action: 'email',
    },
    {
      type: 'email',
      label: 'Programs',
      value: 'programs@artofliving.org',
      action: 'email',
    },
  ],
  address: {
    name: 'Art of Living International Center',
    street: '21st Km, Kanakapura Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560082',
    country: 'India',
    fullAddress: 'Art of Living International Center, 21st Km, Kanakapura Road, Udayapura, Bangalore, Karnataka 560082, India',
  },
  socialMedia: [
    {
      platform: 'Facebook',
      url: 'https://www.facebook.com/artofliving',
      icon: 'Facebook',
    },
    {
      platform: 'Instagram',
      url: 'https://www.instagram.com/artofliving',
      icon: 'Instagram',
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/artofliving',
      icon: 'Twitter',
    },
    {
      platform: 'YouTube',
      url: 'https://www.youtube.com/artofliving',
      icon: 'Youtube',
    },
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/company/artofliving',
      icon: 'Linkedin',
    },
  ],
  travelOptions: [
    {
      id: 'nice-road',
      title: 'Via NICE Road',
      description: 'The fastest route from Bangalore Airport',
      details: [
        'Take NICE Road from Bangalore Airport',
        'Exit at Kanakapura Road',
        'Continue on Kanakapura Road for approximately 15 km',
        'Look for Art of Living signage on the right',
        'Total distance: ~45 km from airport',
        'Estimated time: 1.5 - 2 hours depending on traffic',
      ],
    },
    {
      id: 'flight',
      title: 'By Flight',
      description: 'Kempegowda International Airport (BLR)',
      details: [
        'Nearest airport: Kempegowda International Airport (BLR)',
        'Distance from airport: ~45 km',
        'Taxi services available: Ola, Uber, Meru',
        'Pre-booked airport transfers available',
        'Contact: +91-80-2843-2000 for airport pickup arrangements',
        'Approximate taxi fare: ₹1,500 - ₹2,500',
      ],
    },
    {
      id: 'bus-metro-train',
      title: 'By Bus / Metro / Train',
      description: 'Public transportation options',
      details: [
        'From Bangalore City Railway Station: Take BMTC bus 335 or 335A',
        'From Majestic Bus Stand: Direct BMTC A/C buses available',
        'From Metro Stations: Connect to BMTC buses at various metro stations',
        'Nearest Metro Station: Banashankari (connect to bus 335)',
        'BMTC Route: 335, 335A, 335B, 335C',
        'Bus frequency: Every 30-45 minutes',
        'Approximate travel time: 1.5 - 2 hours from city center',
      ],
    },
  ],
  founder: {
    name: 'Gurudev Sri Sri Ravi Shankar',
    title: 'Founder, Art of Living Foundation',
    description: 'Global humanitarian, spiritual leader, and ambassador of peace. Gurudev has touched millions of lives worldwide through his teachings of yoga, meditation, and service.',
  },
  mapLocation: {
    lat: 12.7947,
    lng: 77.5908,
    zoom: 15,
  },
};
