

## Problem

The `.env` file is repeatedly being deleted/lost between edits, causing `supabase/client.ts` to call `createClient(undefined, undefined)` which crashes the app with a white screen.

## Fix

1. **Recreate `.env`** with the three required variables (project ID, anon key, URL) pointing to `wiodohcrgwvgncbvgokw`.

2. **Add a defensive guard in `client.ts`** — since we cannot edit the auto-generated file, instead add a global error handler in `main.tsx` that catches the `supabaseUrl is required` error gracefully and shows the ErrorBoundary fallback instead of a white screen. This prevents future crashes if the env vars are ever missing again.

Actually, since `client.ts` is auto-generated and we can't edit it, and the `.env` is auto-generated too, the only fix is to recreate `.env`. But to prevent recurring white screens, we should wrap the app initialization in `main.tsx` with better error handling.

## Changes

| File | Change |
|------|--------|
| `.env` | Recreate with correct Supabase credentials |
| `src/main.tsx` | Add `window.addEventListener('error', ...)` before `createRoot` to catch initialization crashes and show a user-friendly message instead of white screen |

