/**
 * Services Overview - Data
 *
 * Service registry for the overview hub page.
 */

import type { ServicesPageData } from './types';

export const servicesData: ServicesPageData = {
  hero: {
    title: 'Campus Services',
    subtitle: 'Everything you need for a comfortable and enriching stay at the ashram',
  },

  services: [
    {
      id: 'shopping',
      name: 'Shopping',
      type: 'shopping',
      description: 'Books, spiritual items, ayurveda products, souvenirs, and more',
      icon: 'ShoppingBag',
      status: 'open',
      timings: '9:00 AM - 8:00 PM',
      link: '/services/shopping',
      quickInfo: 'Multiple shops across campus',
      image: '/images/services/card_service_shopping.jpg',
    },
    {
      id: 'dining',
      name: 'Dining',
      type: 'dining',
      description: 'Satvik vegetarian meals served with love three times daily',
      icon: 'Utensils',
      status: 'open',
      timings: 'Breakfast: 7:00 AM | Lunch: 12:30 PM | Dinner: 7:00 PM',
      link: '/services/dining',
      quickInfo: 'Dining pass required for meals',
      image: '/images/services/card_service_dining.jpg',
    },
    {
      id: 'stay',
      name: 'Stay & Meals',
      type: 'stay',
      description: 'Comfortable accommodation options with meal plans',
      icon: 'Hotel',
      status: 'open',
      timings: 'Check-in: 2:00 PM | Check-out: 11:00 AM',
      link: '/services/stay',
      quickInfo: 'Advance booking recommended',
      image: '/images/services/card_service_stay.jpg',
    },
    {
      id: 'transport',
      name: 'Transport',
      type: 'transport',
      description: 'EV Buggy service and transport assistance within campus',
      icon: 'Bus',
      status: 'open',
      timings: '7:00 AM - 9:00 PM',
      link: '/services/transport',
      quickInfo: 'First-come-first-serve basis',
      image: '/images/services/card_service_transport.jpg',
    },
    {
      id: 'facilities',
      name: 'Facilities',
      type: 'facilities',
      description: 'Washrooms, medical center, charging points, and essential amenities',
      icon: 'Mountain',
      status: 'open',
      timings: '24/7 available',
      link: '/services/facilities',
      quickInfo: 'Accessible throughout campus',
      image: '/images/services/card_service_facilities.jpg',
    },
  ],

  quickLinks: {
    emergency: [
      {
        id: 'medical',
        service: 'Medical Emergency',
        phone: '+91-80-2843-2100',
        extension: '101',
        available: '24/7',
        location: 'Medical Center, Main Building',
      },
      {
        id: 'security',
        service: 'Security',
        phone: '+91-80-2843-2100',
        extension: '102',
        available: '24/7',
        location: 'Security Office, Main Gate',
      },
      {
        id: 'fire',
        service: 'Fire Emergency',
        phone: '101',
        available: '24/7',
        location: 'Emergency Response Team',
      },
    ],
    helpDesks: [
      {
        id: 'main-helpdesk',
        name: 'Main Help Desk',
        description: 'General inquiries and assistance',
        timings: {
          monday: { open: '7:00', close: '21:00' },
          tuesday: { open: '7:00', close: '21:00' },
          wednesday: { open: '7:00', close: '21:00' },
          thursday: { open: '7:00', close: '21:00' },
          friday: { open: '7:00', close: '21:00' },
          saturday: { open: '7:00', close: '21:00' },
          sunday: { open: '7:00', close: '21:00' },
        },
        status: 'open',
        category: 'essential',
        location: {
          name: 'Main Reception',
          building: 'Main Building',
          floor: 'Ground Floor',
        },
        contact: {
          phone: '+91-80-2843-2100',
          extension: '100',
        },
        accessibility: {
          wheelchair: true,
          visual: true,
          hearing: true,
          assistance: true,
        },
        emergency: false,
        operatingHours: 'scheduled',
      },
    ],
    rules: [
      {
        id: 'general',
        title: 'General Rules & Guidelines',
        link: '/connect/faqs',
      },
      {
        id: 'dining',
        title: 'Dining Rules',
        link: '/services/dining#rules',
      },
      {
        id: 'stay',
        title: 'Accommodation Rules',
        link: '/services/stay#rules',
      },
    ],
  },
};
