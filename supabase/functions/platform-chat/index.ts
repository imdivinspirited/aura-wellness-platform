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
  "kaise": "how",
  "kab": "when",
  "kahan": "where",
  "kitna": "how much",
  "room": "accommodation",
  "kamra": "room",
  "khana": "food",
  "rehna": "stay",
  "milega": "available",
  "ashram me": "in ashram",
  "seva karna": "volunteer",
  "course": "program",
  "karyakram": "program",
  "dhyan": "meditation",
  "yoga": "yoga",
  "kriya": "sudarshan kriya",
  "fees": "donation",
  "paisa": "cost",
  "registration": "register",
  "naam likhana": "register",
  "kab hai": "when is",
  "kahan hai": "where is",
  "batao": "tell me about",
  "jaankari": "information",
  "suvidha": "facility",
  "booking": "book",
  "darshan": "visit",
  "guruji": "Sri Sri Ravi Shankar",
  "gurudev": "Sri Sri Ravi Shankar",
};

function normalizeHinglish(query: string): string {
  let normalized = query.toLowerCase();
  // Sort by length descending to match longer phrases first
  const sortedKeys = Object.keys(HINGLISH_MAP).sort((a, b) => b.length - a.length);
  for (const hindi of sortedKeys) {
    const regex = new RegExp(`\\b${hindi}\\b`, "gi");
    normalized = normalized.replace(regex, HINGLISH_MAP[hindi]);
  }
  return normalized;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history, is_first_message } = await req.json();
    const rawText = typeof message === "string" ? message.trim() : "";

    if (!rawText) {
      return new Response(
        JSON.stringify({ answer: "Please ask a question about Art of Living.", source: "platform" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    // Step 1: Search the content database (RAG retrieval)
    let contextChunks: ContentResult[] = [];

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Use normalized text for better matching
      const searchText = normalizedText !== text.toLowerCase() ? `${normalizedText} ${text}` : text;

      const isDateQuery = /\b(upcoming|next|when|schedule|date|this month|this week|today|tomorrow|kab)\b/i.test(text);
      const contentTypes = detectContentTypes(searchText);

      const { data, error } = await supabase.rpc("search_aol_content", {
        search_query: searchText,
        content_types: contentTypes.length > 0 ? contentTypes : null,
        only_upcoming: isDateQuery,
        result_limit: 8,
      });

      if (error) {
        console.error("[platform-chat] search error:", error);
      } else if (data && data.length > 0) {
        contextChunks = data as ContentResult[];
      }

      // Broader search fallback
      if (contextChunks.length === 0 && isDateQuery) {
        const { data: fallbackData } = await supabase.rpc("search_aol_content", {
          search_query: searchText,
          content_types: null,
          only_upcoming: false,
          result_limit: 8,
        });
        if (fallbackData && fallbackData.length > 0) {
          contextChunks = fallbackData as ContentResult[];
        }
      }

      // If normalized query differs, try original text too
      if (contextChunks.length === 0 && normalizedText !== text.toLowerCase()) {
        const { data: origData } = await supabase.rpc("search_aol_content", {
          search_query: text,
          content_types: null,
          only_upcoming: false,
          result_limit: 8,
        });
        if (origData && origData.length > 0) {
          contextChunks = origData as ContentResult[];
        }
      }
    }

    // Step 2: Build context from search results
    const contextText = contextChunks.length > 0
      ? contextChunks.map(formatChunk).join("\n\n---\n\n")
      : "";

    // Step 3: Build source attribution
    const sources = contextChunks
      .filter(c => c.source_url || c.title)
      .map(c => c.source_url ? `[${c.title}](${c.source_url})` : c.title)
      .filter((v, i, a) => a.indexOf(v) === i); // deduplicate

    // Step 4: Build conversation messages
    const systemPrompt = buildSystemPrompt(contextChunks.length > 0, is_first_message === true);

    // Build message history for context
    const llmMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (last 6 turns max for context window)
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
        max_tokens: 1200,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({
          answer: "Jay Gurudev 🙏 I'm receiving many requests right now. Please try again in a moment.",
          source: "platform",
        });
      }
      if (response.status === 402) {
        return jsonResponse({
          answer: "Jay Gurudev 🙏 Our AI service is temporarily paused. Please visit https://www.artofliving.org directly.",
          source: "platform",
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return jsonResponse({
        answer: "Jay Gurudev 🙏 I'm having a brief moment of silence. Please try again.",
        source: "platform",
      });
    }

    // Stream the response back to client
    return new Response(response.body, {
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
  rank: number;
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
    ? `For this FIRST message of the conversation, start your response with:
"Jay Gurudev 🙏\nWelcome to the Art of Living. I'm here to help you with programs, visiting the Ashram, Seva opportunities, and other information related to the Art of Living.\n\n"
Then provide your answer.`
    : `Do NOT include any greeting. Start directly with the answer. No "Jay Gurudev", no "Namaste", no greeting at all for follow-up messages.`;

  const base = `You are the official AOL Assistant for the Art of Living website (artofliving.org).

${greetingInstruction}

STRICT RULES:
1. Answer ONLY using the retrieved content provided. NEVER use general knowledge, NEVER guess, NEVER hallucinate.
2. For programs/events, ALWAYS include: Program Name, Date (if available), Venue, Donation/Fee, Eligibility, and Direct Registration Link.
3. If multiple programs match, list ALL of them sorted by date (upcoming first).
4. Use Markdown: **bold** for names/prices, bullet points for details, direct clickable links.
5. Keep responses concise (2-4 paragraphs max) but complete.
6. If source URLs are provided in the retrieved content, include source attribution at the end of your response in this format:
📍 Source: [Page Name](URL)
7. For Seva/Career/Job inquiries, direct to: https://innerlight-system.lovable.app/seva-careers
8. NEVER invent programs, prices, dates, or schedules not in the provided content.
9. Maintain a warm, spiritual, calm, and welcoming tone throughout.
10. If the user asks about topics COMPLETELY UNRELATED to Art of Living (mathematics, coding, general knowledge, etc.), respond with:
"I'm here to assist with information related to the Art of Living, our programs, the Ashram, Seva opportunities, and related services. For other topics, you may wish to consult a general knowledge resource."
11. Understand Hinglish (Hindi-English mix) queries naturally.
12. Use conversation context from previous messages to understand follow-up questions.`;

  if (!hasContext) {
    return base + `\n\nIMPORTANT: No matching content was found in the database. You must inform the user warmly that this specific information is not currently available on the platform and suggest visiting the website at [artofliving.org](https://www.artofliving.org) or contacting the team at info@artofliving.org / +91-80-67262626. Do NOT redirect repeatedly to the homepage.`;
  }

  return base;
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
