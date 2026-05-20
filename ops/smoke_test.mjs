/**
 * End-to-end smoke test (no extra deps).
 *
 * Prereqs:
 * - backend running at API_BASE (default http://localhost:3000/api/v1)
 * - MongoDB reachable by backend
 * - (optional) OPENAI_API_KEY set on backend to test chatbot
 */

const API_BASE = (process.env.API_BASE || "http://localhost:3000/api/v1").replace(/\/$/, "");

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

async function jfetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { res, json, text };
}

function randEmail() {
  return `test_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function main() {
  console.log(`API_BASE = ${API_BASE}`);

  // Health
  {
    const r = await fetch(API_BASE.replace(/\/api\/v1$/, "") + "/health");
    assert(r.ok, "health endpoint failed");
    console.log("✅ health");
  }

  // Anonymous
  const anon = await jfetch("/auth/anonymous", { method: "POST", body: JSON.stringify({}) });
  assert(anon.res.ok && anon.json?.success && anon.json?.data?.anonymousId, "anonymous creation failed");
  const anonymousId = anon.json.data.anonymousId;
  console.log("✅ anonymous");

  // Register
  const email = randEmail();
  const password = "TestPassw0rd!";
  const reg = await jfetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name: "Test User", phone: `9${Math.floor(Math.random() * 1e9)}` }),
  });
  assert(reg.res.status === 201 && reg.json?.success, "register failed");
  const accessToken = reg.json.data.tokens.accessToken;
  const refreshToken = reg.json.data.tokens.refreshToken;
  assert(accessToken && refreshToken, "register tokens missing");
  console.log("✅ register");

  // Login
  const login = await jfetch("/auth/login", { method: "POST", body: JSON.stringify({ identifier: email, password }) });
  assert(login.res.ok && login.json?.success, "login failed");
  const loginAccess = login.json.data.tokens.accessToken;
  const loginRefresh = login.json.data.tokens.refreshToken;
  assert(loginAccess && loginRefresh, "login tokens missing");
  console.log("✅ login");

  // Me
  const me = await jfetch("/auth/me", { headers: { Authorization: `Bearer ${loginAccess}` } });
  assert(me.res.ok && me.json?.success && me.json?.data?.user?.email === email, "me failed");
  console.log("✅ me");

  // Refresh
  const ref = await jfetch("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: loginRefresh }) });
  assert(ref.res.ok && ref.json?.success && ref.json?.data?.accessToken, "refresh failed");
  assert(ref.json?.data?.refreshToken, "refresh rotation missing refreshToken");
  console.log("✅ refresh");

  // Forgot password (should always return success to prevent enumeration)
  {
    const fp = await jfetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    assert(fp.res.ok && fp.json?.success, "forgot-password failed");
    console.log("✅ forgot-password");
  }

  // Mood
  const mood = await jfetch("/mood", {
    method: "POST",
    headers: { Authorization: `Bearer ${loginAccess}` },
    body: JSON.stringify({ mood: "good", note: "smoke test" }),
  });
  assert(mood.res.status === 201 && mood.json?.success, "mood post failed");
  console.log("✅ mood");

  // International overview
  const intl = await jfetch("/international/overview");
  assert(intl.res.ok && intl.json?.success, "international overview failed");
  console.log("✅ international");

  // Marketplace products
  const products = await jfetch("/marketplace/products");
  assert(products.res.ok && products.json?.success, "marketplace products failed");
  console.log("✅ marketplace list");

  // Chatbot (non-streaming) - optional; expects OPENAI configured and index exists
  const chat = await jfetch("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({ session_id: `smoke_${Date.now()}`, mode: "platform", message: "What is International Visitors?" }),
  });
  if (chat.res.ok && typeof chat.json?.reply === "string") {
    console.log("✅ chatbot");
  } else {
    console.log("⚠️ chatbot skipped/unavailable (configure OPENAI_API_KEY + index).");
  }

  console.log("\nALL DONE ✅");
}

main().catch((e) => {
  console.error("\nSMOKE TEST FAILED ❌");
  console.error(e);
  process.exit(1);
});

