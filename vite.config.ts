import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  
  // Build envDefine with fallbacks for missing VITE_ vars
  const envDefine: Record<string, string> = {};
  for (const [key, fallback] of Object.entries(SUPABASE_DEFAULTS)) {
    if (!env[key]) {
      envDefine[`import.meta.env.${key}`] = JSON.stringify(fallback);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define: envDefine,
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
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
