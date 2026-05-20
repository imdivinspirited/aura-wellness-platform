#!/usr/bin/env node
/**
 * One-command dev stack:
 * - Starts Mongo + Redis via Docker if available
 * - Ensures backend/.env exists + safe dev JWT secrets
 * - Starts backend (port 4000) with restart-on-crash
 * - Waits for /healthz then starts Vite
 *
 * Goal: `npm run dev` should never boot a half-broken app that fails login.
 */
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const backendDir = path.join(root, 'backend');

const API_HOST = '127.0.0.1';
const API_PORT = 4000;
const VITE_PORT = 8080;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function dockerDaemonUp() {
  return new Promise((resolve) => {
    const p = spawn('docker', ['info'], { stdio: 'ignore' });
    p.on('exit', (c) => resolve(c === 0));
    p.on('error', () => resolve(false));
  });
}

function run(cmd, args, opts = {}) {
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

function waitForPort(port, host, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const s = net.createConnection({ port, host }, () => {
        s.end();
        resolve(true);
      });
      s.on('error', () => {
        s.destroy();
        if (Date.now() > deadline) return reject(new Error(`Timeout waiting for ${host}:${port}`));
        setTimeout(tryOnce, 350);
      });
    };
    tryOnce();
  });
}

async function httpJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text };
}

function ensureBackendEnvExists() {
  const envPath = path.join(backendDir, '.env');
  if (fs.existsSync(envPath)) return envPath;
  const examplePath = path.join(backendDir, '.env.example');
  if (!fs.existsSync(examplePath)) return envPath;
  try {
    fs.copyFileSync(examplePath, envPath);
    console.log('\x1b[32m[dev]\x1b[0m Created backend/.env from backend/.env.example');
  } catch {
    // ignore
  }
  return envPath;
}

function ensureBackendEnvSecrets() {
  const envPath = ensureBackendEnvExists();
  let raw = '';
  try {
    raw = fs.readFileSync(envPath, 'utf8');
  } catch {
    return;
  }

  const makeSecret = () => crypto.randomBytes(48).toString('base64');
  const patchLine = (name, nextVal) => {
    const re = new RegExp(`^\\s*${name}\\s*=.*$`, 'm');
    if (re.test(raw)) raw = raw.replace(re, `${name}=${nextVal}`);
    else raw = `${raw.replace(/\n?$/, '\n')}${name}=${nextVal}\n`;
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
    // ignore
  }
}

function backendUsesAtlas() {
  try {
    const raw = fs.readFileSync(path.join(backendDir, '.env'), 'utf8');
    return /^\s*MONGODB_URI\s*=\s*mongodb\+srv:/m.test(raw);
  } catch {
    return false;
  }
}

async function startDockerDbIfPossible() {
  const hasDocker = await dockerDaemonUp();
  if (!hasDocker) {
    console.warn('\x1b[33m[dev]\x1b[0m Docker not running — will use local MongoDB or Atlas from backend/.env.');
    return false;
  }
  try {
    console.log('\x1b[36m[dev]\x1b[0m Starting MongoDB + Redis (Docker)…');
    await run('docker', ['compose', '-f', 'docker-compose.yml', 'up', '-d', 'mongo', 'redis'], { cwd: root });
    return true;
  } catch {
    console.warn('\x1b[33m[dev]\x1b[0m docker compose failed — continuing (Atlas/local Mongo may be used).');
    return false;
  }
}

async function ensureMongoReachableOrExit() {
  if (backendUsesAtlas()) {
    console.log('\x1b[36m[dev]\x1b[0m backend/.env uses Atlas (mongodb+srv) — skipping localhost Mongo check.');
    return;
  }
  try {
    await waitForPort(27017, '127.0.0.1', 120_000);
    console.log('\x1b[32m[dev]\x1b[0m MongoDB reachable at 127.0.0.1:27017');
  } catch {
    console.error(
      '\x1b[31m[dev]\x1b[0m MongoDB not reachable at 127.0.0.1:27017.\n' +
        'Start Docker Desktop (recommended) or set MONGODB_URI to Atlas in backend/.env, then re-run `npm run dev`.'
    );
    process.exit(1);
  }
}

function spawnBackend() {
  const p = spawn('npm', ['run', 'dev'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });
  return p;
}

/**
 * Wait until Express is up **and** MongoDB is connected. `/healthz` always returns ok:true even when
 * mongoReady is false — we must not start Vite until the DB is usable or login/sign-up will 500/503.
 */
async function waitForApiHealth(maxMs) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const { ok, json } = await httpJson(`http://${API_HOST}:${API_PORT}/healthz`);
      if (ok && json && json.ok === true && json.mongoReady === true) return true;
    } catch {
      // ignore
    }
    await sleep(350);
  }
  return false;
}

function spawnVite() {
  const p = spawn('npm', ['run', 'dev:vite', '--', '--host', '0.0.0.0', '--port', String(VITE_PORT)], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env },
  });
  return p;
}

async function verifyBackendImportGraphOrExit() {
  try {
    await run('npm', ['run', 'verify:imports', '--prefix', 'backend'], { cwd: root });
  } catch {
    console.error(
      '\x1b[31m[dev]\x1b[0m Backend route graph failed to load (fix the error above, then re-run).\n' +
        '  • Run: npm run verify:imports --prefix backend\n' +
        '  • Or:  npm run verify:backend (ESLint + import check)'
    );
    process.exit(1);
  }
}

async function main() {
  ensureBackendEnvSecrets();
  await verifyBackendImportGraphOrExit();
  await startDockerDbIfPossible();
  await ensureMongoReachableOrExit();

  let stopRequested = false;
  let backend = null;
  let vite = null;

  const stopAll = () => {
    stopRequested = true;
    for (const p of [vite, backend]) {
      if (p?.pid) {
        try {
          p.kill('SIGINT');
        } catch {
          // ignore
        }
      }
    }
  };

  process.on('SIGINT', stopAll);
  process.on('SIGTERM', stopAll);

  // Start backend; do not start Vite until MongoDB is connected (avoids “login → 500”).
  let backendBootAttempt = 0;

  const startBackendLoop = async (exitProcessOnFailure) => {
    while (!stopRequested) {
      backendBootAttempt += 1;
      if (backendBootAttempt > 1) {
        console.warn(`\x1b[33m[dev]\x1b[0m Backend (re)start attempt ${backendBootAttempt}.`);
      }
      backend = spawnBackend();

      const apiReady = await waitForApiHealth(180_000);
      if (!apiReady) {
        console.error(
          '\x1b[31m[dev]\x1b[0m API did not become ready with MongoDB connected within 3 minutes.\n' +
            '  • Open http://127.0.0.1:4000/healthz — you need "mongoReady": true (not only "ok": true).\n' +
            '  • Local: run `npm run docker:db` and set MONGODB_URI=mongodb://127.0.0.1:27017/… in backend/.env\n' +
            '  • Atlas: check IP allowlist, credentials, and MONGODB_URI in backend/.env'
        );
        try {
          backend.kill('SIGINT');
        } catch {
          /* ignore */
        }
        if (exitProcessOnFailure) process.exit(1);
        return;
      }
      console.log(`\x1b[32m[dev]\x1b[0m API + MongoDB ready on http://${API_HOST}:${API_PORT}`);
      return;
    }
  };

  await startBackendLoop(true);
  if (stopRequested) return;

  // Start Vite after backend is up.
  console.log(`\x1b[36m[dev]\x1b[0m Starting Vite on http://localhost:${VITE_PORT} …\n`);
  vite = spawnVite();

  // If backend exits later, restart it (keep Vite running; proxy will recover).
  backend?.on('exit', async (code) => {
    if (stopRequested) return;
    console.error(`\x1b[31m[dev]\x1b[0m Backend exited (code ${code ?? 'unknown'}). Restarting…`);
    await startBackendLoop(false);
  });

  // If Vite exits, stop everything.
  vite?.on('exit', (code) => {
    if (stopRequested) return;
    console.error(`\x1b[31m[dev]\x1b[0m Vite exited (code ${code ?? 'unknown'}). Stopping…`);
    stopAll();
    process.exit(code ?? 0);
  });
}

main().catch((e) => {
  console.error('\x1b[31m[dev]\x1b[0m Fatal:', e?.message || e);
  process.exit(1);
});

