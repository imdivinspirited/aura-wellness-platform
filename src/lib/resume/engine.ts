/**
 * Public surface for the resume engine: types, defaults, 300-slot manifest,
 * and extended primitives (A4/print, ATS, document transforms, advanced pipeline).
 */
export * from './types';
export * from './emptyResume';
export * from './manifest';
export * from './primitives';
export * from './pageSpec';
export * from './layoutPresets';

export const RESUME_ENGINE_VERSION = '1.1.0' as const;
