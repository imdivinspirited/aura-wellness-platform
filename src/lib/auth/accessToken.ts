/**
 * Access JWT:
 * - kept in-memory for runtime speed
 * - mirrored to storage so refresh does not force re-login
 * Refresh token stays in httpOnly cookie.
 */
let accessToken: string | null = null;

const SESSION_KEY = 'aol_access_token_v1';
const LOCAL_KEY = 'aol_access_token_local_v1';

export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (token) sessionStorage.setItem(SESSION_KEY, token);
      else sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(LOCAL_KEY, token);
      else localStorage.removeItem(LOCAL_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const t = sessionStorage.getItem(SESSION_KEY);
      if (t) {
        accessToken = t;
        return t;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const t = localStorage.getItem(LOCAL_KEY);
      if (t) {
        accessToken = t;
        return t;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearAccessToken() {
  setAccessToken(null);
}
