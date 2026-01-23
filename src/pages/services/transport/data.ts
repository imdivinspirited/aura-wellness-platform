/**
 * Transport - Data
 *
 * Comprehensive transport information including EV Buggy routes.
 */

import type { Route, EVBuggyBooking } from '../types';

export const transportData: {
  routes: Route[];
} = {
  routes: [
    {
      id: 'main-gate-meditation-hall',
      name: 'Main Gate → Meditation Hall',
      type: 'ev-buggy',
      stops: [
        {
          id: 'main-gate',
          name: 'Main Gate',
          location: {
            name: 'Main Entrance',
            coordinates: { lat: 12.7915, lng: 77.4994 },
          },
          order: 1,
        },
        {
          id: 'reception',
          name: 'Reception',
          location: {
            name: 'Main Reception',
            coordinates: { lat: 12.7920, lng: 77.4998 },
          },
          order: 2,
        },
        {
          id: 'meditation-hall',
          name: 'Meditation Hall',
          location: {
            name: 'Main Meditation Hall',
            coordinates: { lat: 12.7925, lng: 77.5002 },
          },
          order: 3,
        },
      ],
      timings: [
        { time: '07:00', available: true },
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
        { time: '17:00', available: true },
        { time: '18:00', available: true },
        { time: '19:00', available: true },
        { time: '20:00', available: true },
        { time: '21:00', available: true },
      ],
      frequency: 30, // minutes
      capacity: 8,
      accessibility: {
        wheelchair: true,
        assistance: true,
        specialNeeds: true,
      },
      rules: [
        'First-come-first-serve basis',
        'Maximum 8 passengers per trip',
        'Wheelchair accessible',
        'Priority for elderly and special needs',
        'No advance booking required',
        'Service operates 7:00 AM - 9:00 PM',
      ],
    },
    {
      id: 'dining-accommodation',
      name: 'Dining Hall → Accommodation',
      type: 'ev-buggy',
      stops: [
        {
          id: 'dining-hall',
          name: 'Dining Hall',
          location: {
            name: 'Annapurna Dining Hall',
            coordinates: { lat: 12.7930, lng: 77.5005 },
          },
          order: 1,
        },
        {
          id: 'accommodation-block-a',
          name: 'Accommodation Block A',
          location: {
            name: 'Residential Complex A',
            coordinates: { lat: 12.7935, lng: 77.5010 },
          },
          order: 2,
        },
        {
          id: 'accommodation-block-b',
          name: 'Accommodation Block B',
          location: {
            name: 'Residential Complex B',
            coordinates: { lat: 12.7940, lng: 77.5015 },
          },
          order: 3,
        },
      ],
      timings: [
        { time: '07:00', available: true },
        { time: '08:00', available: true },
        { time: '12:00', available: true },
        { time: '13:00', available: true },
        { time: '19:00', available: true },
        { time: '20:00', available: true },
      ],
      frequency: 60,
      capacity: 8,
      accessibility: {
        wheelchair: true,
        assistance: true,
        specialNeeds: true,
      },
      rules: [
        'First-come-first-serve basis',
        'Maximum 8 passengers per trip',
        'Operates during meal times',
        'Priority for elderly and special needs',
      ],
    },
  ],
};
