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

/** Sanitize a string value to prevent formula injection in Google Sheets */
function sanitizeForSheets(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim().slice(0, 500);
  // Prefix with single quote if starts with formula-trigger characters
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/** Validate email format */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

/** Validate URL is http/https only */
function isValidUrl(url: string): boolean {
  if (!url) return true; // optional field
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Create JWT for Google Service Account auth
async function createGoogleJWT(clientEmail: string, privateKeyPem: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${signingInput}.${sigB64}`;
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwt = await createGoogleJWT(clientEmail, privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Strict origin validation
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      full_name, phone, email, position, city, state,
      resume_url, photo_url, created_at,
    } = body;

    // Server-side input validation
    if (!full_name || typeof full_name !== "string" || full_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!position || typeof position !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid position" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (resume_url && !isValidUrl(resume_url)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid resume URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (photo_url && !isValidUrl(photo_url)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid photo URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL");
    const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
    const sheetId = Deno.env.get("GOOGLE_SHEET_ID");

    if (!clientEmail || !privateKey || !sheetId) {
      console.error("Missing Google Sheets credentials");
      return new Response(
        JSON.stringify({ success: false, error: "Google Sheets not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getAccessToken(clientEmail, privateKey);

    // Check for duplicates by email + position
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:C`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (readRes.ok) {
      const readData = await readRes.json();
      const rows = readData.values || [];
      const isDuplicate = rows.some(
        (row: string[]) => row[2] === email && row[3] === position
      );
      if (isDuplicate) {
        return new Response(
          JSON.stringify({ success: true, message: "Already synced" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sanitize all values before sending to Google Sheets
    const values = [[
      sanitizeForSheets(full_name),
      sanitizeForSheets(phone),
      sanitizeForSheets(email),
      sanitizeForSheets(position),
      sanitizeForSheets(city),
      sanitizeForSheets(state),
      sanitizeForSheets(resume_url),
      sanitizeForSheets(photo_url),
      sanitizeForSheets(created_at || new Date().toISOString()),
      "Pending",
    ]];

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:J:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!appendRes.ok) {
      const errText = await appendRes.text();
      console.error("Google Sheets append error:", errText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to sync to Google Sheets" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sync-to-sheets error:", e);
    return new Response(
      JSON.stringify({ success: false, error: "Sync failed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});