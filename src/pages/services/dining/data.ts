/**
 * Dining - Data
 *
 * Comprehensive dining information with locations, meals, and slots.
 */

import type { DiningLocation, MealSlot } from '../types';

export const diningData: {
  locations: DiningLocation[];
  mealSlots: MealSlot[];
} = {
  locations: [
    {
      id: 'annapurna',
      name: 'Annapurna Dining Hall',
      description: 'The main dining hall serving satvik vegetarian meals prepared with love and following yogic dietary principles. Spacious hall accommodating hundreds of participants.',
      timings: {
        monday: { open: '07:00', close: '20:00' },
        tuesday: { open: '07:00', close: '20:00' },
        wednesday: { open: '07:00', close: '20:00' },
        thursday: { open: '07:00', close: '20:00' },
        friday: { open: '07:00', close: '20:00' },
        saturday: { open: '07:00', close: '20:00' },
        sunday: { open: '07:00', close: '20:00' },
      },
      status: 'open',
      capacity: 3000,
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      menuPhilosophy: 'Satvik vegetarian cuisine prepared with fresh, locally sourced ingredients. Meals are designed to support meditation practice and overall well-being. No onion, garlic, or processed foods.',
      dietaryAccommodations: [
        'Vegetarian only',
        'Vegan options available',
        'Gluten-free options',
        'Allergy accommodations (advance notice required)',
        'Fasting day meals available',
      ],
      slots: [],
      location: {
        name: 'Main Dining Complex',
        building: 'Dining Building',
        floor: 'Ground Floor',
        directions: 'Near the main meditation hall',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '301',
      },
      rules: [
        'Dining pass required for all meals',
        'Meals are served at specific times only',
        'Silence is maintained during meals',
        'Please finish all food on your plate',
        'No outside food allowed',
        'Respectful behavior expected',
      ],
    },
    {
      id: 'cafeteria',
      name: 'Cafeteria',
      description: 'A smaller dining area offering light meals, snacks, and beverages throughout the day. Perfect for quick refreshments between programs.',
      timings: {
        monday: { open: '08:00', close: '21:00' },
        tuesday: { open: '08:00', close: '21:00' },
        wednesday: { open: '08:00', close: '21:00' },
        thursday: { open: '08:00', close: '21:00' },
        friday: { open: '08:00', close: '21:00' },
        saturday: { open: '08:00', close: '21:00' },
        sunday: { open: '08:00', close: '21:00' },
      },
      status: 'open',
      capacity: 200,
      mealTypes: ['snacks'],
      menuPhilosophy: 'Light, healthy snacks and beverages. Fresh juices, tea, coffee, and simple vegetarian snacks.',
      dietaryAccommodations: ['Vegetarian snacks', 'Fresh juices', 'Herbal teas'],
      slots: [],
      location: {
        name: 'Cafeteria',
        building: 'Main Building',
        floor: 'Ground Floor',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '302',
      },
      rules: [
        'No dining pass required',
        'Pay as you go',
        'Limited seating available',
      ],
    },
  ],

  mealSlots: [
    {
      id: 'breakfast-1',
      mealType: 'breakfast',
      time: { open: '07:00', close: '09:00' },
      capacity: 3000,
      available: 2500,
      requiresPass: true,
    },
    {
      id: 'lunch-1',
      mealType: 'lunch',
      time: { open: '12:30', close: '14:30' },
      capacity: 3000,
      available: 2800,
      requiresPass: true,
    },
    {
      id: 'dinner-1',
      mealType: 'dinner',
      time: { open: '19:00', close: '20:30' },
      capacity: 3000,
      available: 2700,
      requiresPass: true,
    },
  ],
};
