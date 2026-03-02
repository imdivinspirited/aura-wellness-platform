import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Comprehensive Art of Living knowledge base for platform-only answers
const AOL_KNOWLEDGE = `
# Art of Living Foundation — Complete Knowledge Base

## Organization
- Founded by Gurudev Sri Sri Ravi Shankar in 1981
- Headquarters: Art of Living International Center, 21st km, Kanakapura Road, Udayapura, Bangalore - 560082, Karnataka, India
- Contact: +91-80-67262626 | info@artofliving.org
- Website: https://www.artofliving.org
- Present in 180+ countries, touched 500+ million lives
- One of the largest volunteer-based humanitarian organizations

## Core Programs

### The Happiness Program (SKY Breath Meditation)
- Duration: 3 days (online or in-person)
- Learn SKY (Sudarshan Kriya Yoga) — a powerful rhythmic breathing technique
- Benefits: reduces stress, anxiety, depression; improves sleep, immunity, focus
- Suitable for everyone aged 18+, no prior experience needed
- Register: https://www.artofliving.org/in-en/happiness-program
- Price varies by location; scholarships available

### Sri Sri Yoga
- Holistic yoga combining asanas, pranayama, and meditation
- Suitable for all levels — beginners to advanced
- Both online and in-person formats available
- Register: https://www.artofliving.org/in-en/yoga

### Sahaj Samadhi Meditation
- Effortless mantra-based meditation technique
- Duration: typically 3 sessions
- Benefits: deep rest, clarity, reduced stress
- Register: https://www.artofliving.org/in-en/meditation/sahaj-samadhi-meditation

### Silence Retreat (Advanced Meditation Program)
- 2-4 day residential retreat in silence
- Deep meditation, yoga, and self-reflection
- Prerequisites: Completion of Happiness Program
- Register: https://www.artofliving.org/in-en/silence-retreat

### Corporate Programs
- APEX (Achieving Personal Excellence) for professionals
- Customized wellness programs for organizations
- Focus: stress management, team building, leadership
- Contact: corporate@artofliving.org

### Advanced Programs
- **AMP (Advanced Meditation Program)**: Deeper meditation practice, residential
- **DSN (Dynamism for Self and Nation)**: Leadership and service program
- **Blessings Program**: Spiritual growth program
- **Sri Sri Yoga Deep Dive Level 2**: Advanced yoga practices
- **Samyam**: Extended silent retreat (7+ days)

### Youth & Children Programs
- **Medha Yoga**: For children (ages 8-13), improves focus and confidence
- **YES! (Youth Empowerment Skills)**: For teens (ages 14-17)
- **YLTP (Youth Leadership Training Program)**: Leadership skills for youth

## Major Events
- **Maha Shivaratri**: Annual celebration at Bangalore Ashram with music, meditation, cultural performances
- **Navratri**: 9-night festival celebration with traditional music and dance
- **World Culture Festival**: Massive global events (2011 Berlin, 2016 Delhi — 3.5 million attendees, 2023 Washington DC)
- **International Women's Conference**: Annual gathering empowering women worldwide
- **World Meditation Day**: Global meditation events
- **Gurudev's Birthday (May 13)**: Celebrations worldwide
- **Live Webcasts**: Regular online satsangs and meditations with Gurudev

## The Ashram (Art of Living International Center, Bangalore)
- Located on Kanakapura Road, about 21 km from Bangalore city
- Spread over 65 acres of lush greenery
- Features: Vishalakshi Mantap (meditation hall), Sumeru Mantap, organic gardens
- Accommodation: Various options from dormitories to cottages
- Food: Vegetarian, organic meals served in the dining hall
- Facilities: Ayurveda center, Sri Sri Tattva shop, library, outdoor amphitheater
- Visit: https://www.artofliving.org/in-en/ashram

## Services at the Ashram
- **Stay**: Dormitory, shared rooms, and private cottages available; book online
- **Food**: Pure vegetarian, sattvic meals; special diet options on request
- **Medical**: Basic medical facilities and Ayurveda consultation
- **Transport**: Shuttle service from Bangalore airport/railway station
- **Retail**: Sri Sri Tattva products, books, souvenirs
- **Accessibility**: Wheelchair-accessible paths and facilities
- **Visitor Support**: Information desk, guided tours

## Social Initiatives
- River rejuvenation projects across India
- Free education for underprivileged children
- Skill development and livelihood programs
- Disaster relief and rehabilitation
- Conflict resolution and peace-building
- Prison SMART (Stress Management And Rehabilitative Training)
- Women empowerment programs
- Farmer welfare initiatives

## Gurudev Sri Sri Ravi Shankar
- Humanitarian, spiritual leader, and peace envoy
- Founded Art of Living in 1981
- Founded IAHV (International Association for Human Values)
- Recipient of multiple national and international awards
- Teaches Sudarshan Kriya (SKY) breathing technique
- Known for conflict resolution work worldwide
- Follow: https://www.artofliving.org/in-en/gurudev

## FAQs
- **Is Art of Living a religious organization?** No, it is a secular organization welcoming people of all backgrounds.
- **Do I need to be flexible/fit for yoga?** No, programs are designed for all fitness levels.
- **Can I visit the ashram without attending a program?** Yes, day visits are welcome.
- **Are programs available online?** Yes, many programs including Happiness Program are available online.
- **What is Sudarshan Kriya?** A powerful rhythmic breathing technique that harmonizes body, mind, and emotions.
- **How do I register for a program?** Visit https://www.artofliving.org or contact the nearest Art of Living center.
- **Are scholarships available?** Yes, financial assistance is available for many programs.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const text = typeof message === "string" ? message.trim() : "";

    if (!text) {
      return new Response(
        JSON.stringify({ answer: "Please ask a question about Art of Living.", source: "platform" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          answer: "Namaste 🙏 Our AI assistant is being set up. Please try again shortly.",
          source: "platform",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are the official AOL Assistant for the Art of Living website (artofliving.org). Your role:

1. Answer ONLY using the knowledge base provided below. Never invent programs, prices, schedules, or facts not in the knowledge base.
2. Always provide direct, clickable links to relevant pages (use full URLs like https://www.artofliving.org/...).
3. Format responses beautifully with Markdown: use bold, bullet points, and headers.
4. Keep answers concise but complete (2-4 paragraphs max).
5. If you don't have enough information, say so warmly and suggest contacting Art of Living directly.
6. Always maintain a warm, spiritual, welcoming tone. Start with relevant context, not generic greetings.
7. For program inquiries, always include: what it is, key benefits, duration, and registration link.
8. For event inquiries, include: date/timing if known, location, and how to participate.

KNOWLEDGE BASE:
${AOL_KNOWLEDGE}`;

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
          { role: "user", content: text },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            answer: "Namaste 🙏 I'm receiving many requests right now. Please try again in a moment.",
            source: "platform",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            answer: "Namaste 🙏 Our AI service is temporarily paused. Please try again later or visit https://www.artofliving.org directly.",
            source: "platform",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({
          answer: "Namaste 🙏 I'm having a brief moment of silence. Please try your question again.",
          source: "platform",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "";

    if (!answer) {
      return new Response(
        JSON.stringify({
          answer: "Namaste 🙏 I couldn't generate a response. Please rephrase your question or visit https://www.artofliving.org for more information.",
          source: "platform",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        answer,
        source: "website",
        suggested_questions: generateSuggestions(text),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("platform-chat error:", e);
    return new Response(
      JSON.stringify({
        answer: "Namaste 🙏 Something unexpected happened. Please try again in a moment.",
        source: "platform",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes("program") || q.includes("course")) {
    return [
      "What is the Happiness Program?",
      "How do I register for Sri Sri Yoga?",
      "Tell me about the Silence Retreat",
    ];
  }
  if (q.includes("event") || q.includes("festival")) {
    return [
      "When is the next Maha Shivaratri celebration?",
      "Tell me about the World Culture Festival",
      "Are there any upcoming events near me?",
    ];
  }
  if (q.includes("ashram") || q.includes("visit") || q.includes("stay")) {
    return [
      "How do I book accommodation at the ashram?",
      "What facilities are available?",
      "How do I reach the ashram from Bangalore airport?",
    ];
  }
  if (q.includes("meditat")) {
    return [
      "What is Sahaj Samadhi Meditation?",
      "What is Sudarshan Kriya?",
      "How does the Silence Retreat work?",
    ];
  }
  return [
    "What programs does Art of Living offer?",
    "Tell me about visiting the ashram",
    "What upcoming events are there?",
  ];
}
