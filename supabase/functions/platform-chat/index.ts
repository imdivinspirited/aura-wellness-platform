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
- Price: ₹2,500 – ₹4,000 (varies by city/format); scholarships available
- Schedule: Offered multiple times monthly at centers worldwide and online
- Certified teachers lead every session

### Sri Sri Yoga
- Holistic yoga combining asanas, pranayama, and meditation
- Suitable for all levels — beginners to advanced
- Both online and in-person formats available
- Duration: Ongoing weekly classes or intensive workshops (3-5 days)
- Price: ₹1,500 – ₹3,000 per workshop; free community classes available
- Register: https://www.artofliving.org/in-en/yoga

### Sahaj Samadhi Meditation
- Effortless mantra-based meditation technique
- Duration: 3 sessions over a weekend
- Benefits: deep rest, clarity, reduced stress, better emotional balance
- Price: ₹3,000 – ₹5,000
- No prerequisites
- Register: https://www.artofliving.org/in-en/meditation/sahaj-samadhi-meditation

### Silence Retreat (Advanced Meditation Program)
- 2-4 day residential retreat in silence
- Deep meditation, yoga, and self-reflection
- Prerequisites: Completion of Happiness Program
- Location: Bangalore Ashram and select retreat centers
- Price: ₹5,000 – ₹15,000 (includes accommodation & meals)
- Register: https://www.artofliving.org/in-en/silence-retreat

### Corporate Programs (APEX)
- APEX (Achieving Personal Excellence) for professionals
- Customized wellness programs for organizations
- Focus: stress management, team building, leadership, productivity
- Duration: 1-3 days, customizable
- Contact: corporate@artofliving.org
- Register: https://www.artofliving.org/in-en/corporate-programs

### Advanced Programs
- **AMP (Advanced Meditation Program)**: Deeper meditation practice, 3-4 days residential. ₹6,000 – ₹12,000.
- **DSN (Dynamism for Self and Nation)**: Leadership and service program, 4 days. Focus on community service and personal growth.
- **Blessings Program**: Spiritual growth program with advanced practices. 2 days.
- **Sri Sri Yoga Deep Dive Level 2**: Advanced yoga practices, 5-7 days intensive. For certified Sri Sri Yoga practitioners.
- **Samyam**: Extended silent retreat, 7-8 days. Deep meditative experience. ₹15,000 – ₹25,000. Held at Bangalore Ashram.

### Youth & Children Programs
- **Medha Yoga Level 1**: For children ages 8-13. Improves focus, memory, and confidence. 5 days. ₹2,000 – ₹3,500.
- **Medha Yoga Level 2**: Advanced program for children who completed Level 1.
- **Utkarsha Yoga**: For teens ages 13-17. Builds leadership, emotional intelligence. 5 days.
- **YES! (Youth Empowerment Skills)**: For ages 18-30. Communication, leadership, stress management. 4 days.
- **YLTP (Youth Leadership Training Program)**: Extended youth leadership program.
- **Intuition Process**: Unique program to enhance intuition in children. 2 days.

### Wellness & Specialized Programs
- **Wellness Program**: Comprehensive health and wellness retreat. Yoga, Ayurveda, meditation combined. 5-7 days.
- **Panchkarma**: Traditional Ayurvedic detox treatment. 7-21 days. Supervised by Ayurvedic doctors.
- **Vedic Wisdom**: Ancient Vedic knowledge and practices. Weekend workshops.
- **Hatha Yoga**: Traditional Hatha yoga intensive. 5 days.
- **Spine Care Yoga**: Specialized yoga for back health. 3-5 days.

### Retreats
- **Corporate Retreats**: Team building + wellness for companies. Customizable 1-5 days.
- **Self-Designed Getaways**: Design your own retreat at the ashram. Flexible duration.
- **Host Your Program**: Organize your own event at the ashram facilities.

## Teacher Profiles

### Gurudev Sri Sri Ravi Shankar
- Founder, Art of Living Foundation (1981)
- Founder, IAHV (International Association for Human Values)
- Creator of Sudarshan Kriya breathing technique
- Humanitarian, spiritual leader, and peace envoy
- Mediated in conflict resolution: Colombia FARC peace process, Iraq, Syria
- Recipient of Padma Vibhushan (India's 2nd highest civilian honor)
- Multiple honorary doctorates worldwide
- Follow: https://www.artofliving.org/in-en/gurudev

### Senior Teachers
- Programs are led by certified, experienced Art of Living teachers
- Each teacher completes rigorous training under Gurudev
- Teachers are present in every major city in India and 150+ countries
- Find a teacher near you: https://www.artofliving.org/in-en/center-locator

## Major Events & Festival Calendar

### Maha Shivaratri (Annual — Feb/March)
- Grand celebration at Bangalore Ashram
- Live music, cultural performances, meditation
- All-night celebration with special pujas
- Free to attend (accommodation separate)
- Register: https://www.artofliving.org/in-en/shivaratri

### Navratri (Annual — Sept/Oct)
- 9-night festival celebration
- Traditional music, dance, Yagyas
- Held at Bangalore Ashram with live webcast
- Register: https://www.artofliving.org/in-en/navratri

### World Culture Festival
- Massive global cultural celebration
- Past events: 2011 Berlin (70K), 2016 Delhi (3.5M), 2023 Washington DC
- Music, dance, spiritual talks from diverse traditions

### Regular Events
- **Weekly Satsangs**: Every Saturday/Sunday at local centers
- **Live Webcasts**: Regular online satsangs with Gurudev
- **International Women's Conference**: Annual gathering
- **World Meditation Day**: Global meditation events
- **Gurudev's Birthday (May 13)**: Worldwide celebrations
- **Monthly Kriya Sessions**: For Happiness Program graduates

## The Ashram (Art of Living International Center, Bangalore)

### Location & Access
- 21st km, Kanakapura Road, Udayapura, Bangalore - 560082
- ~45 minutes from Bangalore Airport (KIA)
- ~30 minutes from Bangalore City Railway Station
- GPS: 12.7587° N, 77.5374° E
- Visit: https://www.artofliving.org/in-en/ashram

### Campus Features
- 65 acres of lush, peaceful greenery
- Vishalakshi Mantap: Iconic meditation hall shaped like a lotus
- Sumeru Mantap: Multi-purpose hall for programs
- Radha Kunj & Krishna Kunj: Beautiful garden areas
- Organic gardens and sustainable farming
- Outdoor amphitheater for cultural events
- Sri Sri Ayurveda hospital and wellness center

### Accommodation
- **Dormitories**: Shared, budget-friendly. ₹300 – ₹800/night
- **Shared Rooms**: Semi-private. ₹800 – ₹1,500/night
- **Private Cottages**: Premium stay. ₹2,000 – ₹5,000/night
- Book online: https://www.artofliving.org/in-en/ashram/accommodation
- Amenities: Clean linens, hot water, Wi-Fi in common areas

### Dining
- Pure vegetarian, sattvic meals prepared with love
- Breakfast, lunch, dinner served in main dining hall
- Organic ingredients from ashram gardens
- Special dietary needs accommodated on request
- Meal timings: Breakfast 7:30-9:00, Lunch 12:30-2:00, Dinner 7:30-9:00

### Services & Facilities
- **Sri Sri Tattva Shop**: Ayurvedic products, books, souvenirs, organic food
- **Ayurveda Center**: Consultations, treatments, Panchkarma
- **Medical**: Basic medical facilities on campus
- **Transport**: Shuttle service from airport/station (pre-book required)
- **Laundry**: Available for long-stay visitors
- **ATM**: Available on campus
- **Accessibility**: Wheelchair-accessible main paths
- **Information Desk**: Guided tours, program info, visitor support

## Social Initiatives
- River rejuvenation projects (multiple rivers across India restored)
- Free education for 70,000+ underprivileged children
- Skill development programs in 40,000+ villages
- Disaster relief in 40+ countries
- Conflict resolution and peace-building worldwide
- Prison SMART program in 600+ prisons
- Women empowerment in rural India
- Farmer welfare and sustainable agriculture
- Environment: 80 million+ trees planted

## Contact & Support
- General: info@artofliving.org | +91-80-67262626
- Programs: programs@artofliving.org
- Corporate: corporate@artofliving.org
- Ashram stay: ashram@artofliving.org
- Volunteer: volunteer@artofliving.org
- Media: media@artofliving.org
- Website: https://www.artofliving.org
- App: Art of Living app on iOS and Android

## Seva & Career Opportunities
- Volunteer (Seva) positions available at the ashram
- Full-time job openings in admin, IT, programs, communications
- Internships in marketing, HR, design (3-6 months)
- Apply: https://innerlight-system.lovable.app/seva-careers
- Types: Kitchen Seva, Garden Seva, Media Seva, Admin roles, IT Support

## FAQs
- **Is Art of Living a religious organization?** No, secular and welcoming to all backgrounds.
- **Do I need to be flexible/fit for yoga?** No, all levels welcome.
- **Can I visit the ashram without a program?** Yes, day visits welcome.
- **Are programs available online?** Yes, including Happiness Program.
- **What is Sudarshan Kriya?** A rhythmic breathing technique that harmonizes body, mind, emotions.
- **How to register?** Visit https://www.artofliving.org or contact nearest center.
- **Are scholarships available?** Yes, for many programs.
- **Is the food at ashram free?** Meals are included with accommodation or program fees.
- **Can I bring family?** Yes, family-friendly environment. Children's programs available.
- **What to bring to ashram?** Comfortable clothes, personal items, warm layer for mornings.
`;

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
3. Format responses beautifully with Markdown: use **bold**, bullet points, and headers.
4. Keep answers concise but complete (2-4 paragraphs max).
5. If you don't have enough information, say so warmly and suggest contacting Art of Living directly.
6. Always maintain a warm, spiritual, welcoming tone. Start with relevant context, not generic greetings.
7. For program inquiries, always include: what it is, key benefits, duration, price range, and registration link.
8. For event inquiries, include: date/timing if known, location, and how to participate.
9. For ashram visit questions, include: location, accommodation options, dining, and booking link.
10. If user asks about applying for Seva/Jobs, direct them to: https://innerlight-system.lovable.app/seva-careers

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
        max_tokens: 1200,
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
  if (q.includes("program") || q.includes("course") || q.includes("happiness")) {
    return [
      "What is the Happiness Program and how much does it cost?",
      "How do I register for Sri Sri Yoga?",
      "Tell me about the Silence Retreat",
    ];
  }
  if (q.includes("event") || q.includes("festival") || q.includes("shivratri") || q.includes("navratri")) {
    return [
      "When is the next Maha Shivaratri celebration?",
      "Tell me about Navratri at the ashram",
      "What weekly events are available?",
    ];
  }
  if (q.includes("ashram") || q.includes("visit") || q.includes("stay") || q.includes("accommod")) {
    return [
      "What accommodation options are available?",
      "What are the meal timings?",
      "How do I reach the ashram from Bangalore airport?",
    ];
  }
  if (q.includes("meditat") || q.includes("kriya") || q.includes("breath")) {
    return [
      "What is Sahaj Samadhi Meditation?",
      "What is Sudarshan Kriya?",
      "How does the Silence Retreat work?",
    ];
  }
  if (q.includes("child") || q.includes("youth") || q.includes("teen") || q.includes("medha")) {
    return [
      "What programs are available for children?",
      "Tell me about Utkarsha Yoga for teens",
      "What is the Intuition Process?",
    ];
  }
  if (q.includes("seva") || q.includes("volunteer") || q.includes("job") || q.includes("career") || q.includes("intern")) {
    return [
      "How can I volunteer at the ashram?",
      "What job openings are available?",
      "How do I apply for an internship?",
    ];
  }
  if (q.includes("price") || q.includes("cost") || q.includes("fee")) {
    return [
      "How much does the Happiness Program cost?",
      "What are the accommodation prices?",
      "Are scholarships available?",
    ];
  }
  return [
    "What programs does Art of Living offer?",
    "Tell me about visiting the ashram",
    "How can I volunteer or apply for Seva?",
  ];
}
