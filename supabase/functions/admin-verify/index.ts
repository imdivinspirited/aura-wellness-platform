import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  "https://innerlight-system.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(origin: string | null) {
  const resolvedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": resolvedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

// In-memory rate limiting (per-isolate)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes

function isRateLimited(ip: string): boolean {
  const record = rateLimitMap.get(ip);
  if (!record) return false;
  if (Date.now() > record.resetAt) {
    rateLimitMap.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.resetAt = now + LOCKOUT_MS;
    }
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Origin validation
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ adminId: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin password hash stored as a secret — compare securely
    const adminPasswordHash = Deno.env.get("ADMIN_PASSWORD_HASH");
    if (!adminPasswordHash) {
      console.error("ADMIN_PASSWORD_HASH secret not configured");
      return new Response(
        JSON.stringify({ adminId: null, error: "Admin authentication not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use bcrypt for secure password comparison
    const { compare } = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
    const isValid = await compare(password, adminPasswordHash);

    if (isValid) {
      rateLimitMap.delete(ip);
      return new Response(
        JSON.stringify({ adminId: "admin_verified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    recordFailedAttempt(ip);
    return new Response(
      JSON.stringify({ adminId: null }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("admin-verify error:", e);
    return new Response(
      JSON.stringify({ adminId: null, error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
