/**
 * Facilities - Data
 *
 * Comprehensive campus facilities information.
 */

import type { Facility, EmergencyContact } from '../types';

export const facilitiesData: {
  facilities: Facility[];
  emergencyContacts: EmergencyContact[];
} = {
  facilities: [
    {
      id: 'washrooms',
      name: 'Washrooms',
      category: 'essential',
      description: 'Clean and well-maintained washrooms located throughout the campus. Separate facilities for men and women. Accessible washrooms available.',
      timings: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' },
      },
      status: 'open',
      accessibility: {
        wheelchair: true,
        visual: true,
        hearing: true,
        assistance: false,
      },
      emergency: false,
      operatingHours: '24/7',
      location: {
        name: 'Multiple Locations',
        building: 'Throughout Campus',
        directions: 'Washrooms available near all major buildings and activity areas',
      },
      rules: [
        'Please maintain cleanliness',
        'Respectful use expected',
        'Report any issues to help desk',
      ],
    },
    {
      id: 'drinking-water',
      name: 'Drinking Water',
      category: 'essential',
      description: 'Purified drinking water stations located throughout the campus. Water coolers and filtered water available at multiple points.',
      timings: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { open: '00:00', close: '23:59' },
      },
      status: 'open',
      accessibility: {
        wheelchair: true,
        visual: true,
        hearing: true,
        assistance: false,
      },
      emergency: false,
      operatingHours: '24/7',
      location: {
        name: 'Multiple Locations',
        building: 'Throughout Campus',
      },
      rules: [
        'Bring your own water bottle',
        'Water is safe for drinking',
        'Please conserve water',
      ],
    },
    {
      id: 'medical-center',
      name: 'Medical Center',
      category: 'essential',
      description: 'On-campus medical center with basic first aid, doctor consultation, and emergency medical assistance. Qualified medical staff available.',
      timings: {
        monday: { open: '07:00', close: '21:00' },
        tuesday: { open: '07:00', close: '21:00' },
        wednesday: { open: '07:00', close: '21:00' },
        thursday: { open: '07:00', close: '21:00' },
        friday: { open: '07:00', close: '21:00' },
        saturday: { open: '07:00', close: '21:00' },
        sunday: { open: '07:00', close: '21:00' },
      },
      status: 'open',
      accessibility: {
        wheelchair: true,
        visual: true,
        hearing: true,
        assistance: true,
      },
      emergency: true,
      operatingHours: 'scheduled',
      location: {
        name: 'Medical Center',
        building: 'Main Building',
        floor: 'Ground Floor',
        directions: 'Near the main reception, clearly marked',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '101',
      },
      rules: [
        'Emergency services available 24/7',
        'Basic first aid available',
        'Doctor consultation during operating hours',
        'Bring any necessary medications',
      ],
    },
    {
      id: 'charging-points',
      name: 'Charging Points',
      category: 'convenience',
      description: 'Mobile phone and device charging points available at multiple locations. Charging lockers available for secure charging.',
      timings: {
        monday: { open: '07:00', close: '22:00' },
        tuesday: { open: '07:00', close: '22:00' },
        wednesday: { open: '07:00', close: '22:00' },
        thursday: { open: '07:00', close: '22:00' },
        friday: { open: '07:00', close: '22:00' },
        saturday: { open: '07:00', close: '22:00' },
        sunday: { open: '07:00', close: '22:00' },
      },
      status: 'open',
      accessibility: {
        wheelchair: true,
        visual: true,
        hearing: true,
        assistance: false,
      },
      emergency: false,
      operatingHours: 'scheduled',
      location: {
        name: 'Multiple Locations',
        building: 'Main Building, Dining Hall, Meditation Halls',
      },
      rules: [
        'Bring your own charging cable',
        'Charging lockers available for secure charging',
        'Please do not leave devices unattended',
      ],
    },
    {
      id: 'cloak-rooms',
      name: 'Cloak Rooms',
      category: 'convenience',
      description: 'Secure storage facilities for bags, luggage, and personal items. Lockers available for valuables. Free service for visitors.',
      timings: {
        monday: { open: '07:00', close: '21:00' },
        tuesday: { open: '07:00', close: '21:00' },
        wednesday: { open: '07:00', close: '21:00' },
        thursday: { open: '07:00', close: '21:00' },
        friday: { open: '07:00', close: '21:00' },
        saturday: { open: '07:00', close: '21:00' },
        sunday: { open: '07:00', close: '21:00' },
      },
      status: 'open',
      accessibility: {
        wheelchair: true,
        visual: true,
        hearing: true,
        assistance: true,
      },
      emergency: false,
      operatingHours: 'scheduled',
      location: {
        name: 'Cloak Room',
        building: 'Main Building',
        floor: 'Ground Floor',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '105',
      },
      rules: [
        'Free service for all visitors',
        'Lockers available for valuables',
        'Please collect items before closing time',
        'Do not store perishable items',
      ],
    },
    {
      id: 'meditation-halls',
      name: 'Meditation Halls',
      category: 'special',
      description: 'Spacious meditation halls for collective practice. Multiple halls available for different programs and activities.',
      timings: {
        monday: { open: '05:00', close: '22:00' },
        tuesday: { open: '05:00', close: '22:00' },
        wednesday: { open: '05:00', close: '22:00' },
        thursday: { open: '05:00', close: '22:00' },
        friday: { open: '05:00', close: '22:00' },
        saturday: { open: '05:00', close: '22:00' },
        sunday: { open: '05:00', close: '22:00' },
      },
      status: 'open',
      capacity: 5000,
      accessibility: {
        wheelchair: true,
        visual: true,
        hearing: true,
        assistance: true,
      },
      emergency: false,
      operatingHours: 'scheduled',
      location: {
        name: 'Main Meditation Hall',
        building: 'Meditation Hall Complex',
        floor: 'Ground Floor',
      },
      rules: [
        'Silence must be maintained',
        'Remove shoes before entering',
        'Respectful behavior expected',
        'Follow program schedule',
      ],
    },
  ],

  emergencyContacts: [
    {
      id: 'medical-emergency',
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
    {
      id: 'help-desk',
      service: 'Help Desk',
      phone: '+91-80-2843-2100',
      extension: '100',
      available: 'scheduled',
      location: 'Main Reception',
    },
  ],
};
