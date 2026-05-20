import { describe, it, expect } from 'vitest';
import { rateLimitClientKey } from '../../backend/src/lib/rateLimitClientKey.js';

describe('rateLimitClientKey', () => {
  it('uses req.ip when valid', () => {
    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: {},
    } as Parameters<typeof rateLimitClientKey>[0];
    expect(rateLimitClientKey(req)).toBe('127.0.0.1');
  });

  it('falls back to X-Forwarded-For when req.ip missing (Vite proxy)', () => {
    const req = {
      ip: undefined,
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
      socket: { remoteAddress: '::1' },
    } as Parameters<typeof rateLimitClientKey>[0];
    expect(rateLimitClientKey(req)).toBe('203.0.113.1');
  });

  it('never returns empty string', () => {
    const req = {
      ip: undefined,
      headers: {},
      socket: {},
    } as Parameters<typeof rateLimitClientKey>[0];
    expect(rateLimitClientKey(req)).toBe('127.0.0.1');
  });
});
