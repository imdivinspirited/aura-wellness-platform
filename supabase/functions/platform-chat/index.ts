import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input sanitization — prevent prompt injection
function sanitizeInput(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\b(ignore|forget|disregard|override|bypass)\s+(all\s+)?(previous|above|prior|system)\s+(instructions?|prompts?|rules?)/gi, "")
    .replace(/\b(you are now|act as|pretend to be|new instructions?)\b/gi, "")
    .slice(0, 2000)
    .trim();
}

// Hinglish / Hindi normalization map
const HINGLISH_MAP: Record<string, string> = {
  "kaise": "how", "kab": "when", "kahan": "where", "kitna": "how much",
  "room": "accommodation", "kamra": "room", "khana": "food", "rehna": "stay",
  "milega": "available", "ashram me": "in ashram", "seva karna": "volunteer",
  "course": "program", "karyakram": "program", "dhyan": "meditation",
  "yoga": "yoga", "kriya": "sudarshan kriya", "fees": "donation",
  "paisa": "cost", "registration": "register", "naam likhana": "register",
  "kab hai": "when is", "kahan hai": "where is", "batao": "tell me about",
  "jaankari": "information", "suvidha": "facility", "booking": "book",
  "darshan": "visit", "guruji": "Sri Sri Ravi Shankar", "gurudev": "Sri Sri Ravi Shankar",
  "kya hai": "what is", "kaise kare": "how to do", "kaise jaaye": "how to go",
};

function normalizeHinglish(query: string): string {
  let normalized = query.toLowerCase();
  const sortedKeys = Object.keys(HINGLISH_MAP).sort((a, b) => b.length - a.length);
  for (const hindi of sortedKeys) {
    const regex = new RegExp(`\\b${hindi}\\b`, "gi");
    normalized = normalized.replace(regex, HINGLISH_MAP[hindi]);
  }
  return normalized;
}

// Strip conversational filler words that hurt keyword search
function stripConversational(text: string): string {
  return text
    .replace(/\b(tell me about|what is|what are|how do i|how can i|i want to know about|please|can you|could you|i'd like to know|explain|describe)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || text.trim();
}


async function getQueryEmbedding(text: string): Promise<number[] | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 2000),
        dimensions: 768,
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const embedding = data?.data?.[0]?.embedding;
    return Array.isArray(embedding) && embedding.length === 768 ? embedding : null;
  } catch {
    return null;
  }
}

/** Prefix SSE stream so the client can show citations (sources) immediately. */
function streamWithMetaPrefix(
  meta: { sources: Array<{ title: string; url: string | null }> },
  llmBody: ReadableStream<Uint8Array> | null,
): ReadableStream<Uint8Array> {
  const prefix = new TextEncoder().encode(
    `data: ${JSON.stringify({ meta })}\n\n`,
  );
  if (!llmBody) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(prefix);
        controller.close();
      },
    });
  }
  return new ReadableStream({
    async start(controller) {
      controller.enqueue(prefix);
      const reader = llmBody.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) controller.enqueue(value);
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

function scoreChunk(c: ContentResult): number {
  if (typeof c.combined_score === "number" && Number.isFinite(c.combined_score)) {
    return c.combined_score;
  }
  if (typeof c.rank === "number" && Number.isFinite(c.rank)) return c.rank;
  return 0;
}

async function gatherContextChunks(
  supabase: ReturnType<typeof createClient>,
  cleanedSearch: string,
  rawUserText: string,
  queryEmbedding: number[] | null,
  contentTypes: string[],
  isDateQuery: boolean,
): Promise<ContentResult[]> {
  const byId = new Map<string, ContentResult>();

  const addRows = (rows: ContentResult[] | null | undefined) => {
    if (!rows?.length) return;
    for (const r of rows) {
      const id = String(r.id);
      if (!byId.has(id)) byId.set(id, { ...r, id });
    }
  };

  const embJson = queryEmbedding ? JSON.stringify(queryEmbedding) : null;

  const rpcHybrid = async (
    queryText: string,
    types: string[] | null,
    onlyUpcoming: boolean,
    matchLimit: number,
    kw: number,
    vw: number,
  ) => {
    if (!embJson) return;
    const { data, error } = await supabase.rpc("hybrid_search_aol_content", {
      query_text: queryText,
      query_embedding: embJson,
      content_types: types && types.length ? types : null,
      only_upcoming: onlyUpcoming,
      match_limit: matchLimit,
      keyword_weight: kw,
      vector_weight: vw,
    });
    if (error) console.error("[platform-chat] hybrid_search_aol_content", error);
    addRows(data as ContentResult[]);
  };

  if (embJson) {
    await rpcHybrid(
      cleanedSearch,
      contentTypes.length ? contentTypes : null,
      isDateQuery,
      14,
      0.35,
      0.65,
    );

    if (byId.size < 5) {
      const shortQ = cleanedSearch.split(/\s+/).filter((w) => w.length > 2).slice(0, 8).join(" ");
      if (shortQ.length > 2 && shortQ !== cleanedSearch) {
        await rpcHybrid(shortQ, null, false, 12, 0.45, 0.55);
      }
    }

    if (byId.size < 4) {
      const longWords = rawUserText.split(/\s+/).filter((w) => w.length > 4).slice(0, 5).join(" ");
      if (longWords.length > 3 && longWords !== cleanedSearch) {
        await rpcHybrid(longWords, null, false, 10, 0.5, 0.5);
      }
    }

    if (byId.size === 0 && isDateQuery) {
      await rpcHybrid(cleanedSearch, null, false, 14, 0.35, 0.65);
    }
  }

  if (byId.size === 0) {
    const { data } = await supabase.rpc("search_aol_content", {
      search_query: cleanedSearch,
      content_types: contentTypes.length ? contentTypes : null,
      only_upcoming: isDateQuery,
      result_limit: 14,
    });
    addRows(data as ContentResult[]);
  }

  if (byId.size === 0) {
    const { data: fb } = await supabase.rpc("search_aol_content", {
      search_query: cleanedSearch,
      content_types: null,
      only_upcoming: false,
      result_limit: 14,
    });
    addRows(fb as ContentResult[]);
  }

  if (byId.size === 0 && cleanedSearch.length > 80) {
    const shorter = cleanedSearch.slice(0, 80);
    const { data: fb2 } = await supabase.rpc("search_aol_content", {
      search_query: shorter,
      content_types: null,
      only_upcoming: false,
      result_limit: 10,
    });
    addRows(fb2 as ContentResult[]);
  }

  const merged = Array.from(byId.values());
  merged.sort((a, b) => scoreChunk(b) - scoreChunk(a));
  return merged.slice(0, 16);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history, is_first_message } = await req.json();
    const rawText = typeof message === "string" ? message.trim() : "";

    if (!rawText) {
      return jsonResponse({
        answer: "Please ask a question about Art of Living.",
        source: "platform",
      });
    }

    const text = sanitizeInput(rawText);
    const normalizedText = normalizeHinglish(text);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      return jsonResponse({
        answer: "Jay Gurudev 🙏 Our AI assistant is being configured. Please try again shortly.",
        source: "platform",
      });
    }

    // Step 1: Multi-pass hybrid retrieval (keyword + vector + fallbacks)
    let contextChunks: ContentResult[] = [];

    const searchText = normalizedText !== text.toLowerCase() ? `${normalizedText} ${text}` : text;
    const cleanedSearch = stripConversational(searchText) || text;
    const isDateQuery = /\b(upcoming|next|when|schedule|date|this month|this week|today|tomorrow|kab)\b/i.test(text);
    const contentTypes = detectContentTypes(searchText);

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const queryEmbedding = await getQueryEmbedding(cleanedSearch || text);
      contextChunks = await gatherContextChunks(
        supabase,
        cleanedSearch || text,
        text,
        queryEmbedding,
        contentTypes,
        isDateQuery,
      );
    }

    // Step 2: Build context
    const contextText = contextChunks.length > 0
      ? contextChunks.map(formatChunk).join("\n\n---\n\n")
      : "";

    const sources = contextChunks
      .filter(c => c.source_url || c.title)
      .map(c => c.source_url ? `[${c.title}](${c.source_url})` : c.title)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Step 3: Build LLM messages
    const systemPrompt = buildSystemPrompt(contextChunks.length > 0, is_first_message === true);
    const llmMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(conversation_history)) {
      const recentHistory = conversation_history.slice(-6);
      for (const h of recentHistory) {
        if (h.role && h.content) {
          llmMessages.push({ role: h.role, content: h.content });
        }
      }
    }

    const userPrompt = contextChunks.length > 0
      ? `RETRIEVED CONTENT (from official website database):\n\n${contextText}\n\n---\n\nSOURCES: ${sources.join(", ")}\n\nUSER QUESTION: ${text}`
      : `USER QUESTION: ${text}\n\nNOTE: No matching content was found in the database for this query.`;

    llmMessages.push({ role: "user", content: userPrompt });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: llmMessages,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ answer: "Jay Gurudev 🙏 I'm receiving many requests right now. Please try again in a moment.", source: "platform" });
      }
      if (response.status === 402) {
        return jsonResponse({ answer: "Jay Gurudev 🙏 Our AI service is temporarily paused. Please visit https://www.artofliving.org directly.", source: "platform" });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return jsonResponse({ answer: "Jay Gurudev 🙏 I'm having a brief moment of silence. Please try again.", source: "platform" });
    }

    const metaSources = contextChunks.map((c) => ({
      title: c.title,
      url: c.source_url,
    }));

    return new Response(streamWithMetaPrefix({ sources: metaSources }, response.body), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (e) {
    console.error("platform-chat error:", e);
    return jsonResponse({
      answer: "I'm sorry, something went wrong while retrieving that information. Please try again.",
      source: "platform",
    });
  }
});

interface ContentResult {
  id: string;
  content_type: string;
  title: string;
  description: string;
  summary: string;
  venue: string | null;
  city: string | null;
  start_date: string | null;
  end_date: string | null;
  donation: string | null;
  eligibility: string | null;
  registration_link: string | null;
  category: string | null;
  tags: string[];
  source_url: string | null;
  metadata: Record<string, unknown>;
  rank?: number;
  combined_score?: number;
}

function formatChunk(c: ContentResult): string {
  const parts = [`**${c.title}**`];
  if (c.category) parts.push(`Category: ${c.category}`);
  if (c.content_type) parts.push(`Type: ${c.content_type}`);
  if (c.description) parts.push(`Description: ${c.description}`);
  if (c.venue) parts.push(`Venue: ${c.venue}`);
  if (c.city) parts.push(`City: ${c.city}`);
  if (c.start_date) parts.push(`Start Date: ${c.start_date}`);
  if (c.end_date) parts.push(`End Date: ${c.end_date}`);
  if (c.donation) parts.push(`Donation/Fee: ${c.donation}`);
  if (c.eligibility) parts.push(`Eligibility: ${c.eligibility}`);
  if (c.registration_link) parts.push(`Registration: ${c.registration_link}`);
  if (c.source_url) parts.push(`Source URL: ${c.source_url}`);
  return parts.join("\n");
}

function detectContentTypes(query: string): string[] {
  const q = query.toLowerCase();
  const types: string[] = [];
  if (/\b(program|course|workshop|class|training|learn|happiness|silence|retreat)\b/.test(q)) types.push("program");
  if (/\b(event|festival|celebration|satsang|shivaratri|navratri)\b/.test(q)) types.push("event");
  if (/\b(seva|volunteer|job|career|intern|work|apply)\b/.test(q)) types.push("seva");
  if (/\b(ashram|stay|accommodation|visit|food|facility|campus|room|booking|book)\b/.test(q)) types.push("information");
  if (/\b(meditation|meditat|kriya|breath|yoga|sahaj|sudarshan)\b/.test(q)) types.push("program");
  return [...new Set(types)];
}

function buildSystemPrompt(hasContext: boolean, isFirstMessage: boolean): string {
  const greetingInstruction = isFirstMessage
    ? `For this FIRST message only, start with:
"Jay Gurudev 🙏
Welcome to the Art of Living. I'm **AOL Assistant**, your guide to this website — programs, events, services, the Ashram, Seva, and more.\n\n"
Then answer.`
    : `Do NOT use a greeting. Answer directly (no "Jay Gurudev" / "Namaste" on follow-ups).`;

  const base = `You are **AOL Assistant**, the official website guide for **The AOLIC Bangalore** (Art of Living · Bangalore Ashram) and Art of Living content indexed for this app. You are NOT a generic chatbot.

${greetingInstruction}

## Data source (critical)
- You MUST base answers on **RETRIEVED CONTENT** and **SOURCES** in the user message. Treat that text as the live, current website index.
- If nothing relevant was retrieved, say clearly you could not find it **on this site right now** — do NOT invent programs, prices, dates, teachers, or links.
- Never present **past** events as **upcoming** unless the retrieved data says so.
- Prefer **upcoming / ongoing** over past when both appear.

## Site areas you route mentally (for relevance)
1. **Programs** — courses, retreats, SKY, meditation, youth, online/offline.
2. **Services** — wellness, ayurveda, counselling, bookings.
3. **International** — global / country pages.
4. **Events** — satsangs, festivals, registrations.
5. **Live** — streams / schedules when in data.
6. **Explore** — articles, videos, resources.
7. **Connect** — contact, centres, help.
8. **Seva & Careers** — volunteer, jobs (link only if present in retrieved content or known app route).

## Response formats (use Markdown; adapt to what data contains)
**Events:** title, short description, date/time if present, location or Online, fee/donation, registration status if stated, **Register:** [link](url).
**Programs:** name, what it offers, duration, next dates if any, fee, mode (online/offline), **Enroll:** [link](url).
**Services / Explore / Connect / Seva:** clear summary + **direct link** when available.

## Language
- Match the user’s language (English, Hindi, or Hinglish) when possible. Do not mix languages unless the user does.

## Tone & safety
- Warm, calm, respectful. Light emoji is OK (🙏 sparingly). No medical, legal, or financial advice.
- No competitor sites. No personal data about users.
- Off-topic: politely say you only help with Art of Living / this website, then offer one related suggestion.

## Links & suggestions
- Use **[label](url)** for every important link from retrieved content.
- End with **at most 2** short follow-up ideas or questions, relevant to the user.
- If retrieved content includes **Sources:** line(s), reflect them in a short **Sources** section at the end.`;

  if (!hasContext) {
    return (
      base +
      `\n\n## No retrieval match
The database returned **no chunks** for this query. Say warmly that you could not find this on the site index right now. Suggest: rephrase, try Programs/Events/Connect, or visit the official Art of Living site / Contact page. Offer 1–2 **generic** Art of Living links only if you are certain (e.g. artofliving.org) — do not invent specific event/program URLs.`
    );
  }

  return base;
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
