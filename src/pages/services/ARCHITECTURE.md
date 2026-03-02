# Services Section - Information Architecture

## Research-Based Design Patterns

### Inspiration Sources (Abstracted Patterns)
- **Large Ashrams/Retreat Centers**: Service timings, capacity management, donation-based pricing
- **Temple Campuses**: Prasadam distribution, multiple service points, visitor flow
- **Wellness Resorts**: Slot-based bookings, dietary accommodations, facility access
- **University Campuses**: Service hubs, operational hours, capacity constraints
- **Airport Systems**: Route-based transport, real-time availability, accessibility
- **Hospital Systems**: Emergency contacts, medical facilities, help desks

### Core Principles Extracted
1. **Operational Clarity**: Clear timings, rules, and expectations
2. **Visitor-Centric**: First-time visitor friendly, zero confusion
3. **Capacity Management**: Slot-based systems, availability indicators
4. **Accessibility**: Elder-friendly, multi-language ready, clear instructions
5. **Trust-Based**: Transparent pricing, clear rules, no hidden costs

## Page Architecture

### 1. Services Overview Hub (`/services`)

**Information Architecture:**
```
Hero Section
├── Welcome message
├── Service overview
└── Quick access to all services

Service Categories Grid
├── Shopping
├── Dining
├── Stay & Meals
├── Transport
└── Facilities

Live Status Indicators
├── Current availability
├── Operating hours
└── Service status

Service Cards
├── Icon + name
├── Brief description
├── Timings
├── Status indicator
└── CTA to deep page

Quick Links
├── Emergency contacts
├── Help desk locations
└── Rules & guidelines
```

**Data Model:**
- Service registry (id, name, type, description, timings, status, availability)
- Service categories
- Live status updates

### 2. Shopping (`/services/shopping`)

**Information Architecture:**
```
Hero Section
├── Shopping overview
└── Key information

Shop Categories
├── Bookstore
├── Ayurveda & Wellness
├── Souvenirs & Gifts
├── Clothing & Accessories
└── Spiritual Items

Shop Listings
├── Shop card with:
│   ├── Name & description
│   ├── Location map
│   ├── Timings
│   ├── Price range
│   ├── Payment methods
│   ├── Special items
│   └── Contact info

Filter & Search
├── Category filter
├── Location filter
└── Search by name/item

Product Highlights
├── Featured items
├── New arrivals
└── Special offers
```

**Data Model:**
- Shops (id, name, category, description, location, timings, priceRange, paymentMethods, products, contact)
- Shop categories
- Products (id, name, shopId, category, price, description, image)

### 3. Dining (`/services/dining`)

**Information Architecture:**
```
Hero Section
├── Dining philosophy (satvik)
└── Meal schedule overview

Dining Locations
├── Main Dining Hall (Annapurna)
├── Cafeteria
└── Special dining areas

Meal Information
├── Breakfast (timings, menu philosophy)
├── Lunch (timings, menu philosophy)
├── Dinner (timings, menu philosophy)
└── Special meals (festivals, events)

Dining Pass Form
├── Preserve existing form
├── Enhanced validation
├── Slot availability
└── Dietary requirements

Rules & Guidelines
├── Meal timings
├── Seating capacity
├── Dietary accommodations
├── Fasting days
└── Special instructions
```

**Data Model:**
- Dining locations (id, name, capacity, timings)
- Meal types (breakfast, lunch, dinner)
- Meal slots (id, mealType, time, capacity, available)
- Dining passes (form data structure)

### 4. Stay & Meals (`/services/stay`)

**Information Architecture:**
```
Hero Section
├── Accommodation overview
└── Booking information

Room Types
├── Shared rooms
├── Private rooms
├── Dormitories
└── Special accommodations

Room Details
├── Capacity
├── Amenities
├── Pricing/contribution
├── Images
└── Availability

Booking Rules
├── Check-in/check-out times
├── Eligibility
├── Meal inclusion
├── Family vs individual
└── Cancellation policy

Availability Calendar
├── Date range selector
├── Room availability
└── Booking conflicts

Booking Form
├── Date selection
├── Room type selection
├── Guest information
├── Meal preferences
└── Special requirements
```

**Data Model:**
- Room types (id, name, type, capacity, amenities, pricing, images)
- Availability (date, roomId, available, booked)
- Bookings (id, roomId, checkIn, checkOut, guests, meals, status)

### 5. Transport (`/services/transport`)

**Information Architecture:**
```
Hero Section
├── Transport services overview
└── Route information

EV Buggy Service
├── Preserve existing form
├── Route map
├── Timings
├── Capacity rules
└── First-come-first-serve

Routes & Locations
├── Route list
├── Stops/locations
├── Timings per route
└── Frequency

Accessibility
├── Wheelchair access
├── Special needs
└── Assistance available

External Transport
├── Airport transfers
├── Railway station
├── Bus station
└── Taxi services

Rules & Guidelines
├── Capacity limits
├── Priority rules
├── Safety guidelines
└── Contact information
```

**Data Model:**
- Routes (id, name, stops, timings, frequency, capacity)
- EV Buggy bookings (form data)
- Transport services (id, type, description, contact, pricing)

### 6. Facilities (`/services/facilities`)

**Information Architecture:**
```
Hero Section
├── Campus facilities overview
└── Accessibility information

Facility Categories
├── Essential Services
│   ├── Washrooms
│   ├── Drinking water
│   ├── Medical center
│   └── Emergency contacts
├── Convenience
│   ├── Charging points
│   ├── Cloak rooms
│   ├── Lockers
│   └── ATMs
└── Special Facilities
    ├── Meditation halls
    ├── Prayer rooms
    └── Quiet spaces

Facility Cards
├── Name & description
├── Location (map)
├── Timings
├── Accessibility info
└── Contact/help

Interactive Map
├── Facility markers
├── Click for details
└── Directions

Emergency Information
├── Medical emergency
├── Security
├── Fire safety
└── Help desk locations
```

**Data Model:**
- Facilities (id, name, category, description, location, timings, accessibility, contact, emergency)
- Facility categories
- Emergency contacts

## Technical Architecture

### Component Structure
```
services/
├── ServicesPage.tsx (Overview Hub)
├── components/
│   ├── ServiceCard.tsx
│   ├── ServiceStatusIndicator.tsx
│   └── QuickLinksSection.tsx
├── shopping/
│   ├── ShoppingPage.tsx
│   ├── components/
│   │   ├── ShopCard.tsx
│   │   ├── ShopCategories.tsx
│   │   ├── ProductHighlights.tsx
│   │   └── LocationMap.tsx
│   └── data.ts
├── dining/
│   ├── DiningPage.tsx
│   ├── components/
│   │   ├── DiningLocationCard.tsx
│   │   ├── MealSchedule.tsx
│   │   ├── DiningPassForm.tsx (preserve existing)
│   │   └── RulesSection.tsx
│   └── data.ts
├── stay/
│   ├── StayPage.tsx
│   ├── components/
│   │   ├── RoomTypeCard.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── BookingForm.tsx
│   │   └── RulesSection.tsx
│   └── data.ts
├── transport/
│   ├── TransportPage.tsx
│   ├── components/
│   │   ├── RouteCard.tsx
│   │   ├── EVBuggyForm.tsx (preserve existing)
│   │   ├── RouteMap.tsx
│   │   └── AccessibilityInfo.tsx
│   └── data.ts
├── facilities/
│   ├── FacilitiesPage.tsx
│   ├── components/
│   │   ├── FacilityCard.tsx
│   │   ├── FacilityMap.tsx
│   │   ├── EmergencyContacts.tsx
│   │   └── CategorySection.tsx
│   └── data.ts
└── types.ts (shared types)
```

### Data Structures

**Service Registry (HashMap)**
```typescript
Map<serviceId, Service> // O(1) lookup
```

**Availability System**
```typescript
Map<serviceId, Set<slotId>> // Available slots
Map<date, Map<serviceId, number>> // Capacity tracking
```

**Booking System**
```typescript
Map<bookingId, Booking> // Active bookings
Set<conflictKeys> // Conflict detection
```

## Performance Optimizations

1. **Lazy Loading**
   - Images: `loading="lazy"`
   - Maps: Load on demand
   - Forms: Code split

2. **Caching**
   - Service data: 5 min TTL
   - Availability: 1 min TTL
   - Static content: Long cache

3. **Validation**
   - Client-side: Immediate feedback
   - Server-side: Final validation
   - Conflict detection: O(1) lookup

## Security & Privacy

1. **Form Security**
   - Input sanitization
   - Rate limiting
   - CSRF protection ready
   - PII protection

2. **Booking Security**
   - Conflict prevention
   - Abuse detection
   - Audit logging
   - Capacity enforcement

## Accessibility

1. **Visual**
   - High contrast mode
   - Large text support
   - Clear icons
   - Color not sole indicator

2. **Interaction**
   - Keyboard navigation
   - Screen reader support
   - Touch-friendly
   - Elder-friendly UX

3. **Content**
   - Clear instructions
   - Plain language
   - Visual aids
   - Multiple formats

## Future Extensions

1. **Real-time Updates**
   - WebSocket for availability
   - Live status indicators
   - Queue management

2. **Advanced Features**
   - Online payments
   - QR code check-in
   - Mobile app integration
   - Multi-language support

3. **Analytics**
   - Service usage tracking
   - Capacity optimization
   - Visitor flow analysis
