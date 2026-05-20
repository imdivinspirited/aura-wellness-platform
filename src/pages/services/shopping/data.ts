/**
 * Shopping - Data
 *
 * Comprehensive shop listings with real-world details.
 */

import type { Shop } from '../types';

export const shoppingData: {
  shops: Shop[];
} = {
  shops: [
    {
      id: 'bookstore',
      name: 'Wisdom Bookstore',
      category: 'bookstore',
      description: 'Extensive collection of spiritual books, meditation guides, and wisdom literature in multiple languages. Books by Gurudev, ancient texts, and contemporary spiritual works.',
      timings: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '20:00' },
      },
      status: 'open',
      location: {
        name: 'Main Building',
        building: 'Main Building',
        floor: 'Ground Floor',
        directions: 'Near the main reception area',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '201',
      },
      priceRange: {
        min: 50,
        max: 5000,
        currency: 'INR',
      },
      paymentMethods: ['cash', 'card', 'upi'],
      products: [
        { id: 'book-1', name: 'The Art of Living', category: 'Books', price: 250, available: true },
        { id: 'book-2', name: 'Meditation Guide', category: 'Books', price: 180, available: true },
        { id: 'book-3', name: 'Wisdom Series', category: 'Books', price: 350, available: true },
      ],
      specialItems: ['Prasadam books', 'Gurudev\'s books', 'Multi-language editions'],
      images: ['/images/shops/bookstore-1.jpg', '/images/shops/bookstore-2.jpg'],
      rules: [
        'Books are available in multiple languages',
        'Special discounts for bulk purchases',
        'Gift wrapping available',
      ],
    },
    {
      id: 'ayurveda',
      name: 'Ayurveda & Wellness Shop',
      category: 'ayurveda',
      description: 'Authentic ayurvedic products, herbal supplements, wellness items, and traditional remedies. All products are sourced from trusted suppliers and certified.',
      timings: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { open: '09:00', close: '19:00' },
      },
      status: 'open',
      location: {
        name: 'Wellness Center',
        building: 'Wellness Building',
        floor: 'Ground Floor',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '202',
      },
      priceRange: {
        min: 100,
        max: 3000,
        currency: 'INR',
      },
      paymentMethods: ['cash', 'card', 'upi'],
      products: [
        { id: 'ayur-1', name: 'Herbal Supplements', category: 'Wellness', price: 450, available: true },
        { id: 'ayur-2', name: 'Ayurvedic Oils', category: 'Wellness', price: 350, available: true },
      ],
      specialItems: ['Customized wellness packages', 'Consultation available'],
      images: ['/images/shops/ayurveda-1.jpg'],
      rules: [
        'Consultation with ayurvedic doctor available',
        'Products are certified and authentic',
        'Custom formulations on request',
      ],
    },
    {
      id: 'souvenirs',
      name: 'Souvenirs & Gifts',
      category: 'souvenirs',
      description: 'Beautiful souvenirs, spiritual items, gift sets, and mementos to remember your ashram experience. Perfect for gifting to loved ones.',
      timings: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '20:00' },
      },
      status: 'open',
      location: {
        name: 'Shopping Arcade',
        building: 'Shopping Complex',
        floor: 'Ground Floor',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '203',
      },
      priceRange: {
        min: 50,
        max: 2000,
        currency: 'INR',
      },
      paymentMethods: ['cash', 'card', 'upi'],
      products: [
        { id: 'souv-1', name: 'Spiritual Mementos', category: 'Souvenirs', price: 150, available: true },
        { id: 'souv-2', name: 'Gift Sets', category: 'Gifts', price: 500, available: true },
      ],
      specialItems: ['Custom gift wrapping', 'Bulk orders welcome'],
      images: ['/images/shops/souvenirs-1.jpg'],
      rules: [
        'Gift wrapping service available',
        'Bulk orders can be arranged',
        'Export packaging available',
      ],
    },
    {
      id: 'clothing',
      name: 'Clothing & Accessories',
      category: 'clothing',
      description: 'Traditional and comfortable clothing suitable for ashram activities. Includes kurtas, shawls, meditation shawls, and accessories.',
      timings: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { open: '09:00', close: '19:00' },
      },
      status: 'open',
      location: {
        name: 'Shopping Arcade',
        building: 'Shopping Complex',
        floor: 'First Floor',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '204',
      },
      priceRange: {
        min: 200,
        max: 2500,
        currency: 'INR',
      },
      paymentMethods: ['cash', 'card', 'upi'],
      products: [
        { id: 'cloth-1', name: 'Kurtas', category: 'Clothing', price: 800, available: true },
        { id: 'cloth-2', name: 'Meditation Shawls', category: 'Accessories', price: 1200, available: true },
      ],
      specialItems: ['Custom sizing available', 'Traditional designs'],
      images: ['/images/shops/clothing-1.jpg'],
      rules: [
        'Modest clothing preferred',
        'Try-on facilities available',
        'Alterations can be arranged',
      ],
    },
    {
      id: 'spiritual',
      name: 'Spiritual Items Shop',
      category: 'spiritual',
      description: 'Sacred items, prayer beads, incense, spiritual accessories, and items for your spiritual practice. All items are blessed and sourced from authentic suppliers.',
      timings: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '20:00' },
      },
      status: 'open',
      location: {
        name: 'Spiritual Center',
        building: 'Meditation Hall Complex',
        floor: 'Ground Floor',
      },
      contact: {
        phone: '+91-80-2843-2100',
        extension: '205',
      },
      priceRange: {
        min: 100,
        max: 5000,
        currency: 'INR',
      },
      paymentMethods: ['cash', 'card', 'upi', 'donation'],
      products: [
        { id: 'spir-1', name: 'Prayer Beads', category: 'Spiritual', price: 500, available: true },
        { id: 'spir-2', name: 'Incense & Fragrances', category: 'Spiritual', price: 200, available: true },
        { id: 'spir-3', name: 'Sacred Items', category: 'Spiritual', price: 1000, available: true },
      ],
      specialItems: ['Blessed items', 'Custom prayer beads', 'Prasadam items'],
      images: ['/images/shops/spiritual-1.jpg'],
      rules: [
        'Items are blessed before sale',
        'Respectful handling requested',
        'Donation-based pricing available for some items',
      ],
    },
  ],
};
