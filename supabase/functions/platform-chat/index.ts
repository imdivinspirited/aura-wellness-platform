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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const rawText = typeof message === "string" ? message.trim() : "";

    if (!rawText) {
      return new Response(
        JSON.stringify({ answer: "Please ask a question about Art of Living.", source: "platform" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = sanitizeInput(rawText);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      return jsonResponse({
        answer: "Namaste 🙏 Our AI assistant is being configured. Please try again shortly.",
        source: "platform",
      });
    }

    // Step 1: Search the content database (RAG retrieval)
    let contextChunks: ContentResult[] = [];

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Determine if query is about upcoming events/programs
      const isDateQuery = /\b(upcoming|next|when|schedule|date|this month|this week|today|tomorrow)\b/i.test(text);
      const contentTypes = detectContentTypes(text);

      const { data, error } = await supabase.rpc("search_aol_content", {
        search_query: text,
        content_types: contentTypes.length > 0 ? contentTypes : null,
        only_upcoming: isDateQuery,
        result_limit: 8,
      });

      if (error) {
        console.error("[platform-chat] search error:", error);
      } else if (data && data.length > 0) {
        contextChunks = data as ContentResult[];
      }

      // If FTS returned nothing, do a broader search without date filter
      if (contextChunks.length === 0 && isDateQuery) {
        const { data: fallbackData } = await supabase.rpc("search_aol_content", {
          search_query: text,
          content_types: null,
          only_upcoming: false,
          result_limit: 8,
        });
        if (fallbackData && fallbackData.length > 0) {
          contextChunks = fallbackData as ContentResult[];
        }
      }
    }

    // Step 2: Build context from search results
    const contextText = contextChunks.length > 0
      ? contextChunks.map(formatChunk).join("\n\n---\n\n")
      : "";

    // Step 3: Generate response via LLM with context
    const systemPrompt = buildSystemPrompt(contextChunks.length > 0);

    const userPrompt = contextChunks.length > 0
      ? `RETRIEVED CONTENT (from official website database):\n\n${contextText}\n\n---\n\nUSER QUESTION: ${text}`
      : `USER QUESTION: ${text}\n\nNOTE: No matching content was found in the database for this query.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1200,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({
          answer: "Namaste 🙏 I'm receiving many requests right now. Please try again in a moment.",
          source: "platform",
        });
      }
      if (response.status === 402) {
        return jsonResponse({
          answer: "Namaste 🙏 Our AI service is temporarily paused. Please visit https://www.artofliving.org directly.",
          source: "platform",
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return jsonResponse({
        answer: "Namaste 🙏 I'm having a brief moment of silence. Please try again.",
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
      answer: "Namaste 🙏 Something unexpected happened. Please try again in a moment.",
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
  if (c.description) parts.push(`Description: ${c.description}`);
  if (c.venue) parts.push(`Venue: ${c.venue}`);
  if (c.city) parts.push(`City: ${c.city}`);
  if (c.start_date) parts.push(`Start Date: ${c.start_date}`);
  if (c.end_date) parts.push(`End Date: ${c.end_date}`);
  if (c.donation) parts.push(`Donation/Fee: ${c.donation}`);
  if (c.eligibility) parts.push(`Eligibility: ${c.eligibility}`);
  if (c.registration_link) parts.push(`Registration: ${c.registration_link}`);
  if (c.source_url) parts.push(`Source: ${c.source_url}`);
  return parts.join("\n");
}

function detectContentTypes(query: string): string[] {
  const q = query.toLowerCase();
  const types: string[] = [];
  if (/\b(program|course|workshop|class|training|learn)\b/.test(q)) types.push("program");
  if (/\b(event|festival|celebration|satsang|shivaratri|navratri)\b/.test(q)) types.push("event");
  if (/\b(seva|volunteer|job|career|intern|work|apply)\b/.test(q)) types.push("seva");
  if (/\b(ashram|stay|accommodation|visit|food|facility|campus)\b/.test(q)) types.push("information");
  return types;
}

function buildSystemPrompt(hasContext: boolean): string {
  const base = `You are the official AOL Assistant for the Art of Living website (artofliving.org).

STRICT RULES:
1. Answer ONLY using the retrieved content provided. NEVER use general knowledge, NEVER guess, NEVER hallucinate.
2. Always start responses with "Namaste 🙏"
3. For programs/events, ALWAYS include: Program Name, Date (if available), Venue, Donation/Fee, Eligibility, and Direct Registration Link.
4. If multiple programs match, list ALL of them sorted by date (upcoming first).
5. Use Markdown: **bold** for names/prices, bullet points for details, direct clickable links.
6. Keep responses concise (2-4 paragraphs max) but complete.
7. If the retrieved content doesn't answer the question, say: "Namaste 🙏 This information is not currently available on our platform. Please visit [artofliving.org](https://www.artofliving.org) for the latest updates or contact us at info@artofliving.org / +91-80-67262626."
8. For Seva/Career/Job inquiries, direct to: https://innerlight-system.lovable.app/seva-careers
9. NEVER invent programs, prices, dates, or schedules not in the provided content.
10. Maintain a warm, spiritual, welcoming tone throughout.`;

  if (!hasContext) {
    return base + `\n\nIMPORTANT: No matching content was found in the database. You must inform the user warmly that this specific information is not currently available and suggest visiting the website or contacting the team directly.`;
  }

  return base;
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
