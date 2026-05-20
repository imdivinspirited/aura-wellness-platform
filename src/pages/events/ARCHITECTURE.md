# Events System - Architecture Overview

## System Design

### Data Flow

```
User Request
    ↓
Event Page (Upcoming/Ongoing/Past)
    ↓
Event Filters Component
    ↓
Event List Component
    ↓
Event Card Component
    ↓
Admin Modal (if admin action)
    ↓
Event Service
    ↓
Backend API (Production)
    ↓
Database
```

### Automatic Categorization Flow

```
1. Event data loaded from source
2. Current date/time retrieved
3. For each event:
   - Compare currentDate with startDate and endDate
   - Determine category: upcoming/ongoing/past
   - Apply manual override if exists
4. Filter events by target category
5. Display filtered events
```

### Admin Action Flow

```
1. Admin clicks "Move to Past Event" button
2. Modal opens requesting password
3. Password sent to backend API
4. Backend verifies password (hashed comparison)
5. Backend updates event in database
6. Backend logs action to audit trail
7. Frontend receives success response
8. Page refreshes to show updated list
```

## Performance Optimizations

### 1. Memoization

- Event filtering: `useMemo` prevents unnecessary recalculations
- Filter options: Extracted once, reused
- Sorted events: Cached until dependencies change

### 2. Debouncing

- Search input: 300ms debounce to reduce filter operations
- Validation: 500ms debounce for form validation

### 3. Lazy Loading

- Images: `loading="lazy"` attribute
- Components: Code splitting ready
- Maps: Loaded on demand

### 4. Code Splitting

Ready for implementation:
```typescript
const EventCard = lazy(() => import('./components/EventCard'));
const MoveToPastModal = lazy(() => import('./admin/MoveToPastModal'));
```

## Security Architecture

### Frontend (Current)

- Password input (masked)
- Rate limiting simulation
- Client-side validation
- Secure modal UI

### Backend (Required for Production)

- Password hashing (bcrypt/argon2)
- JWT token management
- Rate limiting (Redis)
- Audit logging
- CSRF protection
- IP-based restrictions

## Scalability Considerations

### Current Implementation

- **Events**: ~20 events (in-memory array)
- **Performance**: O(n) filtering, O(n log n) sorting
- **Memory**: Minimal (events loaded once)

### Production Scaling

For 10,000+ events:

1. **Pagination**: Implement server-side pagination
2. **Caching**: Redis cache for frequently accessed events
3. **Database Indexing**: Index on dates, categories, locations
4. **CDN**: Serve images and static assets via CDN
5. **Search**: Use Elasticsearch or similar for full-text search
6. **Real-time Updates**: WebSocket for live event status

## Data Migration Path

### Current → CMS

1. Export events to JSON
2. Import into CMS (Contentful/Strapi)
3. Update data source to fetch from CMS API
4. Maintain backward compatibility

### Current → Database

1. Create database schema
2. Migrate events to database
3. Update eventService to use database queries
4. Implement caching layer

## Testing Strategy

### Unit Tests

- Event categorization logic
- Filter functions
- Sort functions
- Date utilities

### Integration Tests

- Admin authentication flow
- Event filtering
- Search functionality

### E2E Tests

- Complete admin workflow
- User filtering and search
- Responsive behavior

## Monitoring & Analytics

### Metrics to Track

- Page load times
- Filter usage
- Search queries
- Admin actions
- Error rates
- User engagement

### Tools

- Google Analytics
- Sentry (error tracking)
- Custom analytics dashboard
- Performance monitoring

## Future Enhancements

1. **Real-time Updates**: WebSocket for live event status
2. **Email Notifications**: Notify users of upcoming events
3. **Calendar Integration**: Export to Google Calendar, iCal
4. **Social Sharing**: Share events on social media
5. **Ticketing**: Integrated ticket sales
6. **Donations**: Event-specific donation campaigns
7. **Multi-language**: Full i18n support
8. **Mobile App**: Native mobile app integration
