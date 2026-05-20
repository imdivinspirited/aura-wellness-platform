# Events System Documentation

## Overview

The Events System is a comprehensive, enterprise-grade solution for managing and displaying events for the Art of Living Foundation website. It features automatic event categorization, admin controls, and a secure authentication system.

## Architecture

### Folder Structure

```
src/pages/events/
├── types.ts                    # TypeScript type definitions
├── data/
│   └── events.ts              # Event data (single source of truth)
├── utils/
│   └── eventCategorization.ts # Automatic categorization logic
├── components/
│   ├── EventCard.tsx          # Event card component
│   ├── EventList.tsx          # Event list with grid layout
│   └── EventFilters.tsx      # Filtering and search component
├── admin/
│   ├── adminAuth.ts          # Admin authentication system
│   └── MoveToPastModal.tsx    # Admin modal for moving events
├── services/
│   └── eventService.ts       # Event operations service layer
├── UpcomingEventsPage.tsx    # Upcoming events page
├── OngoingEventsPage.tsx     # Ongoing events page
└── PastEventsPage.tsx        # Past events page
```

## Key Features

### 1. Automatic Event Categorization

Events are automatically categorized based on their dates:

- **Upcoming**: `currentDate < startDate`
- **Ongoing**: `startDate ≤ currentDate ≤ endDate`
- **Past**: `currentDate > endDate`

The categorization happens in real-time using the `eventCategorization.ts` utility.

**Time Complexity**: O(1) per event
**Space Complexity**: O(1)

### 2. Admin Authentication System

#### Security Features

- **Password Hashing**: Uses bcrypt/argon2 (backend implementation required)
- **Rate Limiting**: 5 attempts per 15 minutes, 30-minute lockout
- **Audit Logging**: All admin actions are logged
- **CSRF Protection**: Ready for implementation

#### Admin Password Storage

⚠️ **IMPORTANT**: In production, passwords must be stored on the backend server, NOT in frontend code.

**Current Implementation**: Demo password for development (`admin123`)

**Production Requirements**:
1. Store hashed passwords in secure database
2. Use environment variables for admin credentials
3. Implement JWT tokens for session management
4. Add IP-based rate limiting
5. Enable audit logging to secure log service

#### Admin Actions

- **Move to Past**: Move an event from upcoming/ongoing to past category
- **Manual Override**: Allows admins to override automatic categorization
- **Audit Trail**: All actions are logged with timestamp, admin ID, and reason

### 3. Event Data Model

The `Event` interface supports:

- Core information (title, description, dates)
- Media (banner, gallery, videos)
- Location (physical, online, hybrid)
- Statistics (attendees, countries, performers)
- SEO metadata
- Future extensions (ticketing, donations)

### 4. Filtering & Search

**Features**:
- Real-time search (debounced)
- Location filtering
- Language filtering
- Sort options (date, title)
- Active filter indicators

**Performance**:
- Search: O(n) with memoization
- Filtering: O(n)
- Sorting: O(n log n)

### 5. Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**:
  - Mobile: <640px
  - Tablet: 640-1024px
  - Desktop: 1024-1440px
  - Large: 1440px+
- **Touch-friendly**: Large tap targets, swipe support

## Usage

### Adding New Events

Add events to `data/events.ts`:

```typescript
{
  id: 'unique-event-id',
  title: 'Event Title',
  slug: 'event-slug',
  category: 'upcoming', // Will be auto-categorized
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-01-03T23:59:59Z',
  // ... other fields
}
```

### Admin Operations

1. Navigate to any event page
2. Click "Move to Past Event" button on event card
3. Enter admin password
4. Optionally provide reason
5. Confirm action

### Filtering Events

Users can filter events by:
- Search query
- Location
- Language
- Sort order

## Production Checklist

### Security

- [ ] Move admin authentication to backend API
- [ ] Implement JWT token-based sessions
- [ ] Add CSRF protection
- [ ] Enable rate limiting on backend
- [ ] Set up audit logging service
- [ ] Use environment variables for secrets
- [ ] Implement IP-based restrictions

### Performance

- [ ] Implement server-side rendering for SEO
- [ ] Add CDN for images
- [ ] Enable code splitting
- [ ] Implement caching strategy
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add service worker for offline support

### Data Management

- [ ] Migrate to CMS (Contentful, Strapi, etc.)
- [ ] Set up database (PostgreSQL, MongoDB)
- [ ] Implement API endpoints
- [ ] Add data validation
- [ ] Set up backup strategy

### Analytics

- [ ] Add event tracking
- [ ] Implement analytics dashboard
- [ ] Track admin actions
- [ ] Monitor performance metrics

## API Endpoints (Production)

### Events

- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/ongoing` - Get ongoing events
- `GET /api/events/past` - Get past events
- `GET /api/events/:id` - Get event by ID

### Admin

- `POST /api/admin/verify` - Verify admin password
- `POST /api/events/:id/move-to-past` - Move event to past
- `GET /api/admin/logs` - Get audit logs (admin only)

## Future Enhancements

1. **Ticketing Integration**: Add ticket sales functionality
2. **Donations**: Enable event-specific donations
3. **Multi-language Content**: Full i18n support
4. **Real-time Updates**: WebSocket for live event updates
5. **Email Notifications**: Notify users of upcoming events
6. **Calendar Integration**: Export to Google Calendar, iCal
7. **Social Sharing**: Share events on social media
8. **Analytics Dashboard**: Admin dashboard for event metrics

## Notes

- All dates are stored in ISO 8601 format
- Timezone handling uses IANA timezone identifiers
- Events are automatically re-categorized on page load
- Admin actions require authentication
- All admin actions are logged for audit purposes
