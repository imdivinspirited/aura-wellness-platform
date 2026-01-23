/**
 * Services Section - Type Definitions
 *
 * Centralized types for all Services pages.
 * Designed for real-world operational needs.
 */

/* ==================== BASE TYPES ==================== */

export interface BaseService {
  id: string;
  name: string;
  description: string;
  timings: ServiceTimings;
  status: 'open' | 'closed' | 'limited' | 'maintenance';
  location?: ServiceLocation;
  contact?: ContactInfo;
  rules?: string[];
  metadata?: Record<string, unknown>;
}

export interface ServiceTimings {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  special?: Array<{
    date: string;
    timings: TimeRange;
    note?: string;
  }>;
  notes?: string;
}

export interface TimeRange {
  open: string; // HH:MM format
  close: string; // HH:MM format
  breaks?: Array<{
    start: string;
    end: string;
  }>;
}

export interface ServiceLocation {
  name: string;
  building?: string;
  floor?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  directions?: string;
  mapMarker?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  extension?: string;
  helpDesk?: string;
}

/* ==================== SHOPPING ==================== */

export type ShopCategory = 'bookstore' | 'ayurveda' | 'souvenirs' | 'clothing' | 'spiritual' | 'other';

export interface Shop extends BaseService {
  category: ShopCategory;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  paymentMethods: ('cash' | 'card' | 'upi' | 'donation')[];
  products: Product[];
  specialItems?: string[];
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price?: number;
  description?: string;
  image?: string;
  available: boolean;
}

/* ==================== DINING ==================== */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DiningLocation extends BaseService {
  capacity: number;
  mealTypes: MealType[];
  menuPhilosophy: string;
  dietaryAccommodations: string[];
  slots: MealSlot[];
}

export interface MealSlot {
  id: string;
  mealType: MealType;
  time: TimeRange;
  capacity: number;
  available: number;
  requiresPass: boolean;
}

export interface DiningPass {
  id: string;
  mealType: MealType;
  date: string;
  slotId: string;
  guestName: string;
  dietaryRequirements?: string[];
  status: 'pending' | 'confirmed' | 'cancelled';
}

/* ==================== STAY & MEALS ==================== */

export type RoomType = 'shared' | 'private' | 'dormitory' | 'family' | 'special';

export interface Room extends BaseService {
  type: RoomType;
  capacity: number;
  maxGuests: number;
  amenities: string[];
  pricing: PricingTier[];
  images: string[];
  mealIncluded: boolean;
  eligibility?: {
    minAge?: number;
    familyFriendly: boolean;
    specialNeeds: boolean;
  };
}

export interface PricingTier {
  id: string;
  name: string;
  contribution: number;
  currency: string;
  description?: string;
  conditions?: string[];
}

export interface Availability {
  date: string;
  roomId: string;
  available: number;
  booked: number;
  total: number;
}

export interface Booking {
  id: string;
  roomId: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  guests: number;
  guestInfo: {
    name: string;
    email: string;
    phone: string;
    country: string;
  };
  meals: {
    included: boolean;
    preferences?: string[];
  };
  specialRequirements?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

/* ==================== TRANSPORT ==================== */

export type TransportType = 'ev-buggy' | 'shuttle' | 'taxi' | 'external';

export interface Route {
  id: string;
  name: string;
  type: TransportType;
  stops: RouteStop[];
  timings: RouteTiming[];
  frequency?: number; // minutes
  capacity: number;
  accessibility: {
    wheelchair: boolean;
    assistance: boolean;
    specialNeeds: boolean;
  };
  rules: string[];
}

export interface RouteStop {
  id: string;
  name: string;
  location: ServiceLocation;
  order: number;
}

export interface RouteTiming {
  time: string; // HH:MM
  available: boolean;
  nextAvailable?: string;
}

export interface EVBuggyBooking {
  id: string;
  routeId: string;
  date: string;
  time: string;
  passengers: number;
  guestInfo: {
    name: string;
    phone: string;
    location: string;
  };
  specialNeeds?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

/* ==================== FACILITIES ==================== */

export type FacilityCategory = 'essential' | 'convenience' | 'special' | 'emergency';

export interface Facility extends BaseService {
  category: FacilityCategory;
  accessibility: {
    wheelchair: boolean;
    visual: boolean;
    hearing: boolean;
    assistance: boolean;
  };
  emergency: boolean;
  operatingHours: '24/7' | 'scheduled' | 'on-demand';
  capacity?: number;
  images?: string[];
}

export interface EmergencyContact {
  id: string;
  service: string;
  phone: string;
  extension?: string;
  available: '24/7' | 'scheduled';
  location?: string;
}

/* ==================== SERVICES OVERVIEW ==================== */

export interface ServiceOverview {
  id: string;
  name: string;
  type: 'shopping' | 'dining' | 'stay' | 'transport' | 'facilities';
  description: string;
  icon: string;
  status: BaseService['status'];
  timings: string; // Human-readable
  link: string;
  quickInfo?: string;
}

export interface ServicesPageData {
  hero: {
    title: string;
    subtitle: string;
  };
  services: ServiceOverview[];
  quickLinks: {
    emergency: EmergencyContact[];
    helpDesks: Facility[];
    rules: Array<{
      id: string;
      title: string;
      link: string;
    }>;
  };
}
