/**
 * Dev-only: if nothing is listening on the API port, spawn `npm run dev` in /backend
 * so `npm run dev:vite` still proxies /api → Express + MongoDB.
 *
 * We wait until `/healthz` reports mongoReady:true — not only ok:true — or sign-in can 500/503.
 */
import type { Plugin } from "vite";
import fs from "node:fs";
import net from "node:net";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_PORT = 4000;
const API_HOST = "127.0.0.1";

function portHasListener(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function readBackendDotEnv(backendDir: string): string {
  try {
    return fs.readFileSync(path.join(backendDir, ".env"), "utf8");
  } catch {
    return "";
  }
}

/** Create backend/.env from .env.example when missing (same idea as `npm run dev` orchestrator). */
function ensureBackendEnvFromExample(backendDir: string): void {
  const envPath = path.join(backendDir, ".env");
  const exPath = path.join(backendDir, ".env.example");
  if (fs.existsSync(envPath) || !fs.existsSync(exPath)) return;
  try {
    fs.copyFileSync(exPath, envPath);
    console.log(
      "\x1b[32m[vite]\x1b[0m Created backend/.env from backend/.env.example (edit MONGODB_URI if needed).\n"
    );
  } catch {
    /* ignore */
  }
}

function usesAtlasMongo(raw: string): boolean {
  return (
    /^\s*MONGODB_URI\s*=\s*mongodb\+srv:/im.test(raw) ||
    /^\s*MONGO_URL\s*=\s*mongodb\+srv:/im.test(raw)
  );
}

function looksLikeLocalMongo(raw: string): boolean {
  if (usesAtlasMongo(raw)) return false;
  return /mongodb:\/\/(127\.0\.0\.1|localhost)/i.test(raw);
}

function waitForPort(port: number, host: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const s = net.createConnection({ port, host }, () => {
        s.end();
        resolve();
      });
      s.on("error", () => {
        s.destroy();
        if (Date.now() > deadline) reject(new Error(`Timeout waiting for ${host}:${port}`));
        else setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

function runDockerMongoRedis(repoRoot: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(
      "docker",
      ["compose", "-f", "docker-compose.yml", "up", "-d", "mongo", "redis"],
      {
        cwd: repoRoot,
        stdio: "inherit",
        shell: process.platform === "win32",
      }
    );
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`docker compose exited ${c}`))));
    p.on("error", reject);
  });
}

async function prepareLocalMongoIfNeeded(repoRoot: string, backendDir: string): Promise<void> {
  const raw = readBackendDotEnv(backendDir);
  if (usesAtlasMongo(raw)) {
    console.log("\x1b[36m[vite]\x1b[0m backend/.env uses Atlas — skipping Docker Mongo.\n");
    return;
  }
  if (!looksLikeLocalMongo(raw)) {
    console.warn(
      "\x1b[33m[vite]\x1b[0m No local mongodb:// URI detected in backend/.env — ensure MongoDB is reachable or set MONGODB_URI.\n"
    );
    return;
  }
  try {
    await runDockerMongoRedis(repoRoot);
    console.log("\x1b[32m[vite]\x1b[0m Docker Mongo + Redis up (or already running).\n");
  } catch (e) {
    console.warn(
      "\x1b[33m[vite]\x1b[0m Could not run docker compose (is Docker Desktop running?). " +
        "If MongoDB is already on localhost:27017, continuing…\n",
      e instanceof Error ? e.message : e
    );
  }
  try {
    await waitForPort(27017, API_HOST, 120_000);
    console.log("\x1b[32m[vite]\x1b[0m MongoDB port 127.0.0.1:27017 is open.\n");
  } catch {
    console.warn(
      "\x1b[33m[vite]\x1b[0m Timed out waiting for :27017 — backend may still use Atlas or another host.\n"
    );
  }
}

function runBackendVerifyImports(backendDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn("npm", ["run", "verify:imports"], {
      cwd: backendDir,
      stdio: "inherit",
      shell: true,
    });
    p.on("exit", (c) =>
      c === 0 ? resolve() : reject(new Error("backend verify:imports failed — fix the error above"))
    );
    p.on("error", reject);
  });
}

async function waitForApiAndMongo(maxMs: number): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://${API_HOST}:${API_PORT}/healthz`);
      if (!res.ok) throw new Error("bad status");
      const j = (await res.json()) as { ok?: boolean; mongoReady?: boolean };
      if (j.ok === true && j.mongoReady === true) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

export function startBackendInDev(): Plugin {
  let child: ChildProcess | null = null;
  let startedHere = false;

  const stopChild = () => {
    if (!startedHere || !child?.pid) return;
    try {
      child.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    child = null;
    startedHere = false;
  };

  const failDev = (msg: string) => {
    console.error(`\x1b[31m[vite]\x1b[0m ${msg}\n`);
    stopChild();
    process.exit(1);
  };

  return {
    name: "start-backend-in-dev",
    apply: "serve",
    async configureServer(server) {
      const root = path.dirname(fileURLToPath(import.meta.url));
      const backendDir = path.join(root, "backend");

      const listening = await portHasListener(API_PORT, API_HOST);
      if (listening) {
        console.log(
          `\n\x1b[32m[vite]\x1b[0m API already on http://${API_HOST}:${API_PORT} — waiting for MongoDB…\n`
        );
        const ok = await waitForApiAndMongo(180_000);
        if (!ok) {
          failDev(
            'API on :4000 never reported "mongoReady": true. Fix Mongo (http://127.0.0.1:4000/healthz), then restart.'
          );
        }
        console.log(`\x1b[32m[vite]\x1b[0m API + MongoDB ready — /api proxy OK.\n`);
        return;
      }

      ensureBackendEnvFromExample(backendDir);

      try {
        await runBackendVerifyImports(backendDir);
      } catch (e) {
        failDev(
          String(e instanceof Error ? e.message : e) +
            ". Run: npm run verify:imports --prefix backend"
        );
        return;
      }

      await prepareLocalMongoIfNeeded(root, backendDir);

      console.log(
        `\n\x1b[36m[vite]\x1b[0m Starting API on :${API_PORT} (backend/npm run dev)…\n`
      );

      child = spawn("npm", ["run", "dev"], {
        cwd: backendDir,
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        env: { ...process.env },
      });

      const prefix = (chunk: Buffer) =>
        String(chunk)
          .split("\n")
          .filter(Boolean)
          .map((line) => `\x1b[36m[api]\x1b[0m ${line}\n`)
          .join("");

      child.stdout?.on("data", (d) => process.stdout.write(prefix(d as Buffer)));
      child.stderr?.on("data", (d) => process.stderr.write(prefix(d as Buffer)));

      child.on("exit", (code) => {
        if (code && code !== 0) {
          console.error(`\x1b[31m[api]\x1b[0m Backend process exited with code ${code}\n`);
        }
      });

      startedHere = true;

      const ready = await waitForApiAndMongo(180_000);
      if (!ready) {
        failDev(
          "API did not report mongoReady:true within 3 minutes. Check backend/.env (MONGODB_URI), run `npm run docker:db`, or Atlas network access."
        );
      }

      console.log(
        `\x1b[32m[vite]\x1b[0m API + MongoDB ready — sign-in will work against this database.\n`
      );

      server.httpServer?.once("close", stopChild);
      process.once("SIGINT", stopChild);
      process.once("SIGTERM", stopChild);

      return () => {
        stopChild();
      };
    },
  };
}
