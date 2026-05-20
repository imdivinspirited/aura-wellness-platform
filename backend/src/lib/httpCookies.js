import { config, isProd } from '../config.js';

function baseOpts() {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
  };
}

/** @param {import('express').Response} res */
export function setUserRefreshCookie(res, rawToken, maxAgeMs) {
  res.cookie(config.refreshCookieName, rawToken, {
    ...baseOpts(),
    maxAge: maxAgeMs,
  });
}

/** @param {import('express').Response} res */
export function clearUserRefreshCookie(res) {
  res.clearCookie(config.refreshCookieName, { path: '/', sameSite: 'lax', secure: isProd() });
}

/** Session cookie: omit maxAge so the cookie is cleared when the browser session ends. */
export function setRootRefreshCookieSession(res, token) {
  res.cookie(config.rootRefreshCookieName, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
  });
}

export function clearRootRefreshCookie(res) {
  res.clearCookie(config.rootRefreshCookieName, { path: '/', sameSite: 'lax', secure: isProd() });
}
