#!/usr/bin/env node
/**
 * Single dev entry: Docker (mongo + redis) → wait for local Mongo when needed → Vite.
 * Vite’s plugin starts the Express API on :4000 if that port is free.
 *
 * Atlas: if backend/.env uses mongodb+srv, we skip waiting for localhost:27017.
 */
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const viteJs = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

function ensureBackendEnvSecrets() {
  const envPath = path.join(root, 'backend', '.env');
  let raw = '';
  try {
    raw = fs.readFileSync(envPath, 'utf8');
  } catch {
    return;
  }

  const makeSecret = () => crypto.randomBytes(48).toString('base64');
  const patchLine = (name, nextVal) => {
    const re = new RegExp(`^\\s*${name}\\s*=.*$`, 'm');
    if (re.test(raw)) {
      raw = raw.replace(re, `${name}=${nextVal}`);
    } else {
      raw = `${raw.replace(/\n?$/, '\n')}${name}=${nextVal}\n`;
    }
  };

  const needsAccess =
    /^\s*JWT_ACCESS_SECRET\s*=\s*(replace-with|change-me|dev-only-)/im.test(raw) ||
    !/^\s*JWT_ACCESS_SECRET\s*=\s*\S+/im.test(raw);
  const needsRefresh =
    /^\s*JWT_REFRESH_SECRET\s*=\s*(replace-with|change-me|dev-only-)/im.test(raw) ||
    !/^\s*JWT_REFRESH_SECRET\s*=\s*\S+/im.test(raw);

  if (!needsAccess && !needsRefresh) return;

  if (needsAccess) patchLine('JWT_ACCESS_SECRET', makeSecret());
  if (needsRefresh) patchLine('JWT_REFRESH_SECRET', makeSecret());

  try {
    fs.writeFileSync(envPath, raw, 'utf8');
    console.log('\x1b[32m[dev]\x1b[0m Patched backend/.env JWT secrets (generated dev-safe values).');
  } catch {
    /* ignore */
  }
}

function useAtlasMongoUri() {
  try {
    const raw = fs.readFileSync(path.join(root, 'backend', '.env'), 'utf8');
    return /^\s*MONGODB_URI\s*=\s*mongodb\+srv:/m.test(raw);
  } catch {
    return false;
  }
}

function runDetached(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...opts,
    });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} → exit ${code}`))));
    p.on('error', reject);
  });
}

function dockerDaemonUp() {
  return new Promise((resolve) => {
    const p = spawn('docker', ['info'], { stdio: 'ignore' });
    p.on('exit', (c) => resolve(c === 0));
    p.on('error', () => resolve(false));
  });
}

function waitForPort(port, host, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const s = net.createConnection({ port, host }, () => {
        s.end();
        resolve();
      });
      s.on('error', () => {
        s.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timeout waiting for ${host}:${port}`));
          return;
        }
        setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

async function tryStartDockerDb() {
  try {
    await runDetached('docker', ['compose', '-f', 'docker-compose.yml', 'up', '-d', 'mongo', 'redis'], {
      cwd: root,
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Prevent “random login 500” when placeholder secrets are left in backend/.env
  ensureBackendEnvSecrets();

  const atlas = useAtlasMongoUri();
  if (atlas) {
    console.log('\x1b[36m[dev]\x1b[0m backend/.env uses Atlas (mongodb+srv) — skipping wait for localhost:27017.');
  }

  const hasDocker = await dockerDaemonUp();
  let dockerDbStarted = false;
  if (hasDocker) {
    console.log('\x1b[36m[dev]\x1b[0m Starting MongoDB + Redis (Docker)…');
    dockerDbStarted = await tryStartDockerDb();
    if (!dockerDbStarted) {
      console.warn(
        '\x1b[33m[dev]\x1b[0m `docker compose` did not start services — if Mongo runs elsewhere, that is OK.'
      );
    }
  } else {
    console.warn(
      '\x1b[33m[dev]\x1b[0m Docker not running — use Docker Desktop for automatic Mongo/Redis, or install MongoDB locally / use Atlas in backend/.env.'
    );
  }

  if (!atlas) {
    if (dockerDbStarted) {
      try {
        await waitForPort(27017, '127.0.0.1', 120_000);
        console.log('\x1b[32m[dev]\x1b[0m MongoDB reachable at 127.0.0.1:27017');
      } catch (e) {
        console.warn('\x1b[33m[dev]\x1b[0m', e?.message || e);
        console.warn('\x1b[33m[dev]\x1b[0m Check: docker ps — mongo container healthy? backend/.env MONGODB_URI');
        process.exit(1);
      }
    } else {
      try {
        await waitForPort(27017, '127.0.0.1', 5000);
        console.log('\x1b[32m[dev]\x1b[0m MongoDB already on 127.0.0.1:27017');
      } catch {
        console.warn(
          '\x1b[33m[dev]\x1b[0m No MongoDB on :27017 — set MONGODB_URI in backend/.env (local or Atlas) or run: npm run docker:db'
        );
        process.exit(1);
      }
    }
  }

  if (!fs.existsSync(viteJs)) {
    console.error('[dev] Run `npm install` in the repo root first.');
    process.exit(1);
  }

  console.log('\x1b[36m[dev]\x1b[0m Starting web + API (one command)…\n');

  // Explicitly start both processes; avoids relying on the Vite plugin to keep API alive.
  const child = spawn('npm', ['run', 'dev:stack'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env },
    shell: process.platform === 'win32',
  });

  const stop = () => {
    try {
      child.kill('SIGINT');
    } catch {
      /* ignore */
    }
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
