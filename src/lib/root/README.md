# Root Access System

## Overview

The Root Access System is a **non-breaking, additive layer** that enables Canva-like content editing on the live website. It provides root users with the ability to edit any content directly on the page without modifying existing code.

## Architecture

### Layered System

```
UI Layer (existing)
├── Root Overlay Layer (new) - Editing UI overlay
├── Content Abstraction Layer (new) - Stable element IDs, content map
├── Persistence Layer (new) - localStorage + DB-ready structure
└── Sync/Publish Layer (new) - Live updates, broadcasting
```

### Key Principles

1. **Non-Breaking**: All existing code remains unchanged
2. **Additive**: New features are layered on top
3. **Reversible**: Root mode can be disabled without affecting normal users
4. **Secure**: Authentication, rate limiting, audit logging

## Components

### 1. Root Authentication (`src/lib/root/auth.ts`)

- Secure password verification (backend API in production)
- Session management with expiration
- Audit logging

**⚠️ SECURITY NOTE**: In production, all authentication MUST happen on the backend. The current implementation is for development only.

### 2. Root Store (`src/stores/rootStore.ts`)

Zustand store managing:
- Root mode state
- Content map (element ID → content)
- Pending changes
- Publish/rollback operations

### 3. Root Overlay (`src/components/root/RootOverlay.tsx`)

- Hover indicators on editable elements
- Click-to-edit functionality
- Floating toolbar for actions

### 4. Root Editable (`src/components/root/RootEditable.tsx`)

Wrapper component that makes any element editable:
```tsx
<RootEditable id="hero-title" type="heading">
  <h1>Welcome</h1>
</RootEditable>
```

### 5. Content Abstraction (`src/lib/root/content.ts`)

Utilities for:
- Generating stable element IDs
- Getting/setting content values
- Managing content updates

## Usage

### 1. Login as Root

1. Navigate to Settings page
2. Click "Login as Root"
3. Enter root credentials
4. Root mode activates

### 2. Edit Content

1. Hover over any element with `data-root-id` attribute
2. See blue outline and edit icon
3. Click to edit inline
4. Changes are saved automatically

### 3. Publish Changes

1. Make edits (they appear in pending changes)
2. Click "Publish" button in floating toolbar
3. Changes persist and broadcast to all users

## File Structure

```
src/lib/root/
├── types.ts              # TypeScript types
├── auth.ts              # Authentication system
├── content.ts           # Content abstraction utilities
└── README.md            # This file

src/stores/
└── rootStore.ts         # Root state management

src/components/root/
├── RootOverlay.tsx       # Main overlay component
├── RootEditable.tsx     # Editable wrapper
├── RootLoginModal.tsx   # Login modal
└── index.ts           # Exports

private/
└── root-users.json      # Root users (backend-only in production)
```

## Security

### Development Mode

- Simple password check (NOT SECURE)
- Mock users for testing
- Console warnings about production requirements

### Production Requirements

1. **Backend API**: All authentication must be server-side
2. **Password Hashing**: Use bcrypt (10+ rounds) or argon2
3. **Session Tokens**: JWT or similar secure tokens
4. **Rate Limiting**: 5 attempts per 15 minutes
5. **Audit Logging**: Log all root actions
6. **CSRF Protection**: Validate on all state-changing operations

## Content Abstraction

Every editable element needs:
- Stable unique ID (`data-root-id`)
- Type (`text`, `heading`, `image`, etc.)
- Default value (fallback if not edited)

Example:
```tsx
<RootEditable id="hero-title" type="heading">
  <h1>Welcome to the Ashram</h1>
</RootEditable>
```

## Persistence

### Current (Development)

- localStorage for content map
- sessionStorage for root session

### Production

- Database for content storage
- Redis for session management
- WebSocket/SSE for live updates

## Future Enhancements

1. **Drag & Drop**: Reorder elements
2. **Resize Handles**: Resize images/sections
3. **Duplicate**: Clone elements
4. **Delete**: Remove elements
5. **Undo/Redo**: Version history
6. **Multi-language**: Edit content in multiple languages
7. **AI Assistance**: AI-powered content suggestions

## Testing

### Backward Compatibility

✅ All existing pages work normally
✅ Root mode only activates when logged in
✅ No UI changes for normal users
✅ Existing components unchanged

### Security Testing

- [ ] Password verification (backend)
- [ ] Session expiration
- [ ] Rate limiting
- [ ] Audit logging
- [ ] CSRF protection

## Production Checklist

- [ ] Move authentication to backend API
- [ ] Implement proper password hashing
- [ ] Set up database for content storage
- [ ] Configure WebSocket/SSE for live updates
- [ ] Enable audit logging service
- [ ] Set up rate limiting
- [ ] Configure CSRF protection
- [ ] Test rollback functionality
- [ ] Set up monitoring/alerts

## Notes

- Root users file (`/private/root-users.json`) contains placeholder hashes
- In production, root users must be stored in secure backend database
- All password verification must happen server-side
- Root mode is completely invisible to normal users
