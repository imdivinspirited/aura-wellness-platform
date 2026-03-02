/**
 * Root Access System - Type Definitions
 *
 * Types for the root-level content editing system.
 */

export type RootUserId = `root_${string}`;

export type LocaleCode = string; // e.g. 'en', 'hi', 'fr'

/**
 * Localized value container (CMS-ready)
 * Backward compatible: existing content can remain a plain string.
 */
export type LocalizedString = Record<LocaleCode, string>;

export interface RootUser {
  id: RootUserId;
  username: string;
  passwordHash: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string | null;
}

export interface RootSession {
  userId: RootUserId;
  username: string;
  token: string;
  expiresAt: number;
  createdAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ContentElement {
  id: string; // Stable unique ID
  type: 'text' | 'heading' | 'image' | 'button' | 'icon' | 'section' | 'paragraph';
  page: string; // Route path
  selector?: string; // CSS selector for targeting
  value: string | LocalizedString; // Current content value (supports i18n)
  metadata?: Record<string, unknown>;
  version: number;
  createdAt: number;
  updatedAt: number;
  updatedBy?: RootUserId;
}

export interface ContentUpdate {
  elementId: string;
  type: ContentElement['type'];
  value: string;
  page: string;
  timestamp: number;
  rootUserId: RootUserId;
  previousValue?: string;
  metadata?: Record<string, unknown>;
  language?: LocaleCode; // If set, apply update to only that locale inside value map
}

export interface ContentMap {
  [elementId: string]: ContentElement;
}

export interface RootEditState {
  isActive: boolean;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  isPublishing: boolean;
  pendingChanges: ContentUpdate[];
}

export interface AuditLog {
  id: string;
  rootUserId: RootUserId;
  action: 'login' | 'logout' | 'edit' | 'publish' | 'delete' | 'reorder' | 'add' | 'rollback';
  elementId?: string;
  page?: string;
  details?: Record<string, unknown>;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

export interface RootConfig {
  sessionDuration: number; // milliseconds
  maxFailedAttempts: number;
  lockoutDuration: number; // milliseconds
  enableAuditLogging: boolean;
  enableRateLimiting: boolean;
  requireReAuthForDestructive: boolean;
}
