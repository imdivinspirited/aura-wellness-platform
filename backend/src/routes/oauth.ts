/**
 * OAuth Routes
 *
 * Provider start + callback handlers for social login.
 */

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

export const oauthRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables must be set');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const APP_WEB_URL = (process.env.APP_WEB_URL || 'http://localhost:5173').replace(/\/$/, '');

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function parseDurationMs(value: string): number {
  const v = String(value || '').trim();
  const m = v.match(/^(\d+)\s*([smhd])$/i);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  return n * 24 * 60 * 60 * 1000;
}

function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as any,
  } as any);

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET as string, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  } as any);

  return { accessToken, refreshToken };
}

async function persistRefreshToken(opts: { userId: string; refreshToken: string; req: Request }) {
  const tokenHash = sha256Hex(opts.refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationMs(JWT_REFRESH_EXPIRES_IN));
  await RefreshToken.create({
    userId: opts.userId,
    tokenHash,
    expiresAt,
    createdByIp: opts.req.ip,
    createdByUserAgent: opts.req.get('user-agent') || undefined,
  });
}

type OAuthProfile = {
  provider: 'google' | 'facebook' | 'github';
  id: string;
  email?: string;
  displayName?: string;
};

async function upsertOAuthUser(p: OAuthProfile) {
  const oauthKey =
    p.provider === 'google'
      ? 'oauth.googleId'
      : p.provider === 'facebook'
        ? 'oauth.facebookId'
        : 'oauth.githubId';

  const byProvider = await User.findOne({ [oauthKey]: p.id } as any);
  if (byProvider) return byProvider;

  const email = (p.email || '').toLowerCase().trim();
  if (email) {
    const byEmail = await User.findOne({ email });
    if (byEmail) {
      (byEmail as any).oauth = { ...(byEmail as any).oauth, [oauthKey.split('.')[1]]: p.id };
      if (!byEmail.isEmailVerified) byEmail.isEmailVerified = true;
      await byEmail.save();
      return byEmail;
    }
  }

  const name = p.displayName?.trim() || 'User';
  const newUser = new User({
    email: email || `${p.provider}_${p.id}@oauth.local`,
    name,
    isEmailVerified: Boolean(email),
    oauth: {
      googleId: p.provider === 'google' ? p.id : undefined,
      facebookId: p.provider === 'facebook' ? p.id : undefined,
      githubId: p.provider === 'github' ? p.id : undefined,
    },
  });
  await newUser.save();
  return newUser;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

passport.serializeUser((user: any, done) => done(null, user?.id || user?._id?.toString()));
passport.deserializeUser(async (id: string, done) => {
  try {
    const u = await User.findById(id);
    done(null, u || null);
  } catch (e) {
    done(e as any);
  }
});

// Google
passport.use(
  new GoogleStrategy(
    {
      clientID: requireEnv('OAUTH_GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('OAUTH_GOOGLE_CLIENT_SECRET'),
      callbackURL: requireEnv('OAUTH_GOOGLE_CALLBACK_URL'),
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: (err: any, user?: any) => void
    ) => {
      try {
        const email = (profile.emails?.[0]?.value || '').toLowerCase();
        const user = await upsertOAuthUser({
          provider: 'google',
          id: profile.id,
          email,
          displayName: profile.displayName,
        });
        done(null, user);
      } catch (e) {
        done(e as any);
      }
    }
  )
);

// Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: requireEnv('OAUTH_FACEBOOK_APP_ID'),
      clientSecret: requireEnv('OAUTH_FACEBOOK_APP_SECRET'),
      callbackURL: requireEnv('OAUTH_FACEBOOK_CALLBACK_URL'),
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: (err: any, user?: any) => void
    ) => {
      try {
        const email = (profile.emails?.[0]?.value || '').toLowerCase();
        const user = await upsertOAuthUser({
          provider: 'facebook',
          id: profile.id,
          email,
          displayName: (profile as any).displayName,
        });
        done(null, user);
      } catch (e) {
        done(e as any);
      }
    }
  )
);

// GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: requireEnv('OAUTH_GITHUB_CLIENT_ID'),
      clientSecret: requireEnv('OAUTH_GITHUB_CLIENT_SECRET'),
      callbackURL: requireEnv('OAUTH_GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: (err: any, user?: any) => void
    ) => {
      try {
        // GitHub often requires a separate API call for primary email; passport-github2 may provide it sometimes.
        const email = ((profile.emails?.[0]?.value as string | undefined) || '').toLowerCase();
        const user = await upsertOAuthUser({
          provider: 'github',
          id: profile.id,
          email,
          displayName: profile.displayName || profile.username || 'GitHub User',
        });
        done(null, user);
      } catch (e) {
        done(e as any);
      }
    }
  )
);

oauthRouter.use(passport.initialize());

function oauthStart(provider: 'google' | 'facebook' | 'github') {
  if (provider === 'google') return passport.authenticate('google', { scope: ['profile', 'email'], session: false });
  if (provider === 'facebook') return passport.authenticate('facebook', { scope: ['email'], session: false });
  return passport.authenticate('github', { session: false });
}

function oauthCallback(provider: 'google' | 'facebook' | 'github') {
  return passport.authenticate(provider, { session: false, failureRedirect: `${APP_WEB_URL}/auth/login?oauth=failed` });
}

oauthRouter.get('/oauth/google/start', oauthStart('google'));
oauthRouter.get('/oauth/facebook/start', oauthStart('facebook'));
oauthRouter.get('/oauth/github/start', oauthStart('github'));

oauthRouter.get('/oauth/google/callback', oauthCallback('google'), async (req: any, res: Response) => {
  const user = req.user as any;
  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await persistRefreshToken({ userId: user._id.toString(), refreshToken, req });
  res.redirect(`${APP_WEB_URL}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
});

oauthRouter.get('/oauth/facebook/callback', oauthCallback('facebook'), async (req: any, res: Response) => {
  const user = req.user as any;
  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await persistRefreshToken({ userId: user._id.toString(), refreshToken, req });
  res.redirect(`${APP_WEB_URL}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
});

oauthRouter.get('/oauth/github/callback', oauthCallback('github'), async (req: any, res: Response) => {
  const user = req.user as any;
  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await persistRefreshToken({ userId: user._id.toString(), refreshToken, req });
  res.redirect(`${APP_WEB_URL}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);
});

/**
 * Apple Sign-In: implemented in a follow-up file (`/oauth/apple/start`, `/oauth/apple/callback`)
 * because it requires custom JWT client secret generation + id_token verification.
 */

