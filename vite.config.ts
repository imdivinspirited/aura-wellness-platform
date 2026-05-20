import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { startBackendInDev } from "./vite-start-backend-plugin";

// Fallback Supabase credentials (publishable/anon keys - safe to include)
const SUPABASE_DEFAULTS = {
  VITE_SUPABASE_URL: "https://wiodohcrgwvgncbvgokw.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpb2RvaGNyZ3d2Z25jYnZnb2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjIwOTQsImV4cCI6MjA4Nzk5ODA5NH0.grdA6-EB7vUpWgemYoD5ekWscgiZFadHis56cr63y4I",
  VITE_SUPABASE_PROJECT_ID: "wiodohcrgwvgncbvgokw",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file if it exists
  const env = loadEnv(mode, process.cwd(), '');
  const devProxyLog = env.VITE_DEV_PROXY_LOG === '1';
  const devTaggerEnabled = env.VITE_TAGGER === '1';
  
  // Build envDefine with fallbacks for missing VITE_ vars
  const envDefine: Record<string, string> = {};
  for (const [key, fallback] of Object.entries(SUPABASE_DEFAULTS)) {
    if (!env[key]) {
      envDefine[`import.meta.env.${key}`] = JSON.stringify(fallback);
    }
  }

  /** When the API is down or resets the connection, http-proxy often left the browser with an empty body — return JSON 502 instead. */
  const configureDevProxy = (proxy: import("http-proxy").Server) => {
    proxy.on("error", (err: Error, _req, res) => {
      console.error("[vite proxy]", err.message);
      const r = res as {
        headersSent?: boolean;
        writeHead?: (code: number, headers: Record<string, string>) => void;
        end?: (chunk?: string) => void;
      };
      if (r && typeof r.writeHead === "function" && !r.headersSent) {
        try {
          r.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
          r.end(
            JSON.stringify({
              success: false,
              error: {
                code: "BAD_GATEWAY",
                message:
                  "Could not reach the API on port 4000. From the repo root run `npm run dev` and open http://127.0.0.1:4000/healthz — you need mongoReady: true.",
              },
            })
          );
        } catch {
          /* ignore */
        }
      }
    });
    if (mode !== "production") {
      proxy.on("proxyReq", (_proxyReq, req) => {
        if (devProxyLog) console.log("[vite proxy]", req.method, req.url);
      });
    }
  };

  const apiProxy = {
    "/api": {
      target: "http://127.0.0.1:4000",
      changeOrigin: true,
      secure: false,
      /** Argon2 + DB can exceed default proxy timeouts; avoid empty 5xx responses. */
      timeout: 120_000,
      proxyTimeout: 120_000,
      configure: configureDevProxy,
    },
    // Serve backend uploaded assets (avatars, admin media) via same origin in dev.
    "/uploads": {
      target: "http://127.0.0.1:4000",
      changeOrigin: true,
      secure: false,
      timeout: 120_000,
      proxyTimeout: 120_000,
      configure: configureDevProxy,
    },
  };

  return {
    server: {
      host: "::",
      port: 8080,
      /** Same-origin `/api/*` → Express (`backend`, default :4000). Avoids CORS and “Load failed” in dev. */
      proxy: apiProxy,
      hmr: {
        overlay: false,
      },
      /**
       * Reduce dev CPU churn by ignoring frequently-changing non-source folders.
       * (Helps on large repos where filesystem events can flood watchers.)
       */
      watch: {
        ignored: [
          "**/dist/**",
          "**/.git/**",
          "**/.pnpm-store/**",
        ],
      },
    },
    /** `vite preview` needs the same proxy as dev, or `/api/v1` requests hit the static server and fail. */
    preview: {
      port: 8080,
      proxy: apiProxy,
    },
    define: envDefine,
    plugins: [
      mode === "development" && startBackendInDev(),
      react(),
      mode === "development" && devTaggerEnabled && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: mode !== "production",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-accordion'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'utils-vendor': ['framer-motion', 'date-fns'],
          },
        },
      },
    },
    optimizeDeps: {
      // Force pre-bundling of heavy deps to avoid 503 restart loops
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'framer-motion',
        'zustand',
        '@tanstack/react-query',
        'fuse.js',
      ],
    },
  };
});
