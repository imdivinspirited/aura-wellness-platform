import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WP_BASE = "https://www.artofliving.org/wp-json/wp/v2";
const SITE_BASE = "https://www.artofliving.org";

// Content type mappings for WordPress endpoints
const WP_ENDPOINTS = [
  { endpoint: "posts", contentType: "program", category: "Programs" },
  { endpoint: "pages", contentType: "page", category: "Information" },
];

// Structured knowledge base for Art of Living (fallback when WP API is limited)
const STATIC_CONTENT = [
  {
    slug: "happiness-program",
    content_type: "program",
    title: "The Happiness Program (SKY Breath Meditation)",
    description: "Learn SKY (Sudarshan Kriya Yoga) — a powerful rhythmic breathing technique that reduces stress, anxiety, depression; improves sleep, immunity, focus. 3-day program available online or in-person.",
    summary: "3-day breathing and meditation program for stress relief and well-being. Learn Sudarshan Kriya Yoga.",
    donation: "₹2,500 – ₹4,000 (varies by city/format); scholarships available",
    eligibility: "Everyone aged 18+, no prior experience needed",
    registration_link: "https://www.artofliving.org/in-en/happiness-program",
    category: "Core Programs",
    tags: ["breathing", "meditation", "stress relief", "SKY", "sudarshan kriya", "beginner"],
    source_url: "https://www.artofliving.org/in-en/happiness-program",
  },
  {
    slug: "sri-sri-yoga",
    content_type: "program",
    title: "Sri Sri Yoga",
    description: "Holistic yoga combining asanas, pranayama, and meditation. Suitable for all levels — beginners to advanced. Both online and in-person formats available. Ongoing weekly classes or intensive workshops (3-5 days).",
    summary: "Holistic yoga program for all levels with asanas, pranayama, and meditation.",
    donation: "₹1,500 – ₹3,000 per workshop; free community classes available",
    eligibility: "All levels — beginners to advanced",
    registration_link: "https://www.artofliving.org/in-en/yoga",
    category: "Core Programs",
    tags: ["yoga", "asanas", "pranayama", "fitness", "wellness", "beginner"],
    source_url: "https://www.artofliving.org/in-en/yoga",
  },
  {
    slug: "sahaj-samadhi-meditation",
    content_type: "program",
    title: "Sahaj Samadhi Meditation",
    description: "Effortless mantra-based meditation technique. 3 sessions over a weekend. Benefits: deep rest, clarity, reduced stress, better emotional balance. No prerequisites.",
    summary: "Weekend mantra-based meditation program for deep rest and clarity.",
    donation: "₹3,000 – ₹5,000",
    eligibility: "No prerequisites",
    registration_link: "https://www.artofliving.org/in-en/meditation/sahaj-samadhi-meditation",
    category: "Core Programs",
    tags: ["meditation", "mantra", "relaxation", "stress relief"],
    source_url: "https://www.artofliving.org/in-en/meditation/sahaj-samadhi-meditation",
  },
  {
    slug: "silence-retreat",
    content_type: "program",
    title: "Silence Retreat (Advanced Meditation Program)",
    description: "2-4 day residential retreat in silence. Deep meditation, yoga, and self-reflection. Location: Bangalore Ashram and select retreat centers.",
    summary: "Silent residential retreat for deep meditation and self-reflection.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    donation: "₹5,000 – ₹15,000 (includes accommodation & meals)",
    eligibility: "Completion of Happiness Program required",
    registration_link: "https://www.artofliving.org/in-en/silence-retreat",
    category: "Advanced Programs",
    tags: ["silence", "retreat", "advanced", "meditation", "residential"],
    source_url: "https://www.artofliving.org/in-en/silence-retreat",
  },
  {
    slug: "corporate-apex",
    content_type: "program",
    title: "Corporate Programs (APEX)",
    description: "APEX (Achieving Personal Excellence) for professionals. Customized wellness programs for organizations. Focus: stress management, team building, leadership, productivity. Duration: 1-3 days, customizable.",
    summary: "Corporate wellness and leadership programs for organizations.",
    donation: "Contact corporate@artofliving.org for pricing",
    eligibility: "Corporate teams and professionals",
    registration_link: "https://www.artofliving.org/in-en/corporate-programs",
    category: "Corporate Programs",
    tags: ["corporate", "APEX", "leadership", "team building", "stress management"],
    source_url: "https://www.artofliving.org/in-en/corporate-programs",
  },
  {
    slug: "advanced-meditation-program",
    content_type: "program",
    title: "AMP (Advanced Meditation Program)",
    description: "Deeper meditation practice, 3-4 days residential. For those who have completed the Happiness Program.",
    summary: "3-4 day residential program for deeper meditation practice.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    donation: "₹6,000 – ₹12,000",
    eligibility: "Happiness Program graduates",
    registration_link: "https://www.artofliving.org/in-en/advanced-meditation-program",
    category: "Advanced Programs",
    tags: ["advanced", "meditation", "residential", "AMP"],
    source_url: "https://www.artofliving.org/in-en/advanced-meditation-program",
  },
  {
    slug: "samyam-retreat",
    content_type: "program",
    title: "Samyam — Extended Silent Retreat",
    description: "Extended silent retreat, 7-8 days. Deep meditative experience held at Bangalore Ashram.",
    summary: "7-8 day extended silent retreat for deep meditative experience.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    donation: "₹15,000 – ₹25,000",
    eligibility: "Advanced program graduates",
    registration_link: "https://www.artofliving.org/in-en/samyam",
    category: "Advanced Programs",
    tags: ["samyam", "silence", "retreat", "advanced", "residential"],
    source_url: "https://www.artofliving.org/in-en/samyam",
  },
  {
    slug: "medha-yoga",
    content_type: "program",
    title: "Medha Yoga Level 1 — Children's Program",
    description: "For children ages 8-13. Improves focus, memory, and confidence. 5-day program.",
    summary: "5-day yoga and meditation program for children aged 8-13.",
    donation: "₹2,000 – ₹3,500",
    eligibility: "Children ages 8-13",
    registration_link: "https://www.artofliving.org/in-en/medha-yoga",
    category: "Youth & Children",
    tags: ["children", "kids", "yoga", "focus", "memory", "medha"],
    source_url: "https://www.artofliving.org/in-en/medha-yoga",
  },
  {
    slug: "utkarsha-yoga",
    content_type: "program",
    title: "Utkarsha Yoga — Teen Program",
    description: "For teens ages 13-17. Builds leadership, emotional intelligence. 5-day program.",
    summary: "5-day leadership and yoga program for teenagers.",
    eligibility: "Teens ages 13-17",
    registration_link: "https://www.artofliving.org/in-en/utkarsha-yoga",
    category: "Youth & Children",
    tags: ["teens", "youth", "leadership", "yoga", "utkarsha"],
    source_url: "https://www.artofliving.org/in-en/utkarsha-yoga",
  },
  {
    slug: "yes-youth-program",
    content_type: "program",
    title: "YES! (Youth Empowerment Skills)",
    description: "For ages 18-30. Communication, leadership, stress management. 4-day program.",
    summary: "4-day youth empowerment program covering leadership and communication.",
    eligibility: "Ages 18-30",
    registration_link: "https://www.artofliving.org/in-en/yes-program",
    category: "Youth & Children",
    tags: ["youth", "leadership", "empowerment", "YES", "young adults"],
    source_url: "https://www.artofliving.org/in-en/yes-program",
  },
  {
    slug: "maha-shivaratri",
    content_type: "event",
    title: "Maha Shivaratri — Grand Celebration",
    description: "Annual grand celebration at Bangalore Ashram (February/March). Live music, cultural performances, meditation. All-night celebration with special pujas. Free to attend (accommodation separate).",
    summary: "Annual grand all-night celebration at Bangalore Ashram with music, meditation, and cultural performances.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    donation: "Free to attend (accommodation separate)",
    eligibility: "Open to all",
    registration_link: "https://www.artofliving.org/in-en/shivaratri",
    category: "Major Events",
    tags: ["shivaratri", "festival", "celebration", "music", "meditation"],
    source_url: "https://www.artofliving.org/in-en/shivaratri",
  },
  {
    slug: "navratri-celebration",
    content_type: "event",
    title: "Navratri — 9 Nights Festival",
    description: "Annual 9-night festival celebration (September/October). Traditional music, dance, Yagyas. Held at Bangalore Ashram with live webcast.",
    summary: "Annual 9-night festival with traditional music, dance, and spiritual practices.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    eligibility: "Open to all",
    registration_link: "https://www.artofliving.org/in-en/navratri",
    category: "Major Events",
    tags: ["navratri", "festival", "dance", "music", "celebration"],
    source_url: "https://www.artofliving.org/in-en/navratri",
  },
  {
    slug: "weekly-satsang",
    content_type: "event",
    title: "Weekly Satsangs",
    description: "Regular community gatherings every Saturday/Sunday at local Art of Living centers. Singing, meditation, and knowledge sharing.",
    summary: "Weekly community gatherings with singing, meditation, and knowledge at local centers.",
    eligibility: "Open to all",
    category: "Regular Events",
    tags: ["satsang", "weekly", "community", "singing", "meditation"],
    source_url: "https://www.artofliving.org/in-en/center-locator",
  },
  {
    slug: "ashram-accommodation",
    content_type: "information",
    title: "Ashram Accommodation & Stay",
    description: "Art of Living International Center, 21st km, Kanakapura Road, Udayapura, Bangalore - 560082. Accommodation: Dormitories ₹300–₹800/night, Shared Rooms ₹800–₹1,500/night, Private Cottages ₹2,000–₹5,000/night. Pure vegetarian sattvic meals. Breakfast 7:30-9:00, Lunch 12:30-2:00, Dinner 7:30-9:00.",
    summary: "Ashram stay options including dormitories, shared rooms, and private cottages with vegetarian meals.",
    venue: "Art of Living International Center, 21st km, Kanakapura Road, Udayapura, Bangalore - 560082",
    city: "Bangalore",
    donation: "Dormitories ₹300–₹800/night | Shared Rooms ₹800–₹1,500/night | Private Cottages ₹2,000–₹5,000/night",
    eligibility: "Open to all visitors",
    registration_link: "https://www.artofliving.org/in-en/ashram/accommodation",
    category: "Ashram",
    tags: ["ashram", "accommodation", "stay", "dormitory", "cottage", "food", "meals", "visit"],
    source_url: "https://www.artofliving.org/in-en/ashram",
  },
  {
    slug: "ashram-facilities",
    content_type: "information",
    title: "Ashram Facilities & Services",
    description: "65 acres of lush greenery. Vishalakshi Mantap (iconic lotus-shaped meditation hall), Sumeru Mantap, organic gardens, Sri Sri Ayurveda hospital, outdoor amphitheater, Sri Sri Tattva Shop, medical facilities, shuttle from airport/station, laundry, ATM, wheelchair-accessible paths.",
    summary: "Ashram campus features including meditation halls, Ayurveda center, shops, and visitor services.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    category: "Ashram",
    tags: ["ashram", "facilities", "Vishalakshi Mantap", "ayurveda", "campus", "services"],
    source_url: "https://www.artofliving.org/in-en/ashram",
  },
  {
    slug: "seva-volunteer",
    content_type: "seva",
    title: "Seva & Volunteer Opportunities",
    description: "Volunteer positions available at the ashram. Kitchen Seva, Garden Seva, Media Seva, Admin roles, IT Support. Full-time job openings and internships (3-6 months) in marketing, HR, design.",
    summary: "Volunteer and career opportunities at Art of Living including seva, jobs, and internships.",
    eligibility: "Open to all",
    registration_link: "https://innerlight-system.lovable.app/seva-careers",
    category: "Seva & Careers",
    tags: ["seva", "volunteer", "jobs", "careers", "internship", "work"],
    source_url: "https://innerlight-system.lovable.app/seva-careers",
  },
  {
    slug: "social-initiatives",
    content_type: "information",
    title: "Social Initiatives & Impact",
    description: "River rejuvenation projects, free education for 70,000+ underprivileged children, skill development in 40,000+ villages, disaster relief in 40+ countries, Prison SMART program in 600+ prisons, women empowerment, 80 million+ trees planted.",
    summary: "Art of Living's humanitarian work spanning education, environment, disaster relief, and community development.",
    category: "Social Impact",
    tags: ["social", "humanitarian", "education", "environment", "disaster relief", "trees"],
    source_url: "https://www.artofliving.org/in-en/social-initiatives",
  },
  {
    slug: "gurudev-sri-sri",
    content_type: "information",
    title: "Gurudev Sri Sri Ravi Shankar — Founder",
    description: "Founder of Art of Living Foundation (1981) and IAHV. Creator of Sudarshan Kriya. Humanitarian, spiritual leader, peace envoy. Mediated Colombia FARC peace process. Recipient of Padma Vibhushan. Present in 180+ countries, touched 500+ million lives.",
    summary: "Spiritual leader, humanitarian, and founder of Art of Living, present in 180+ countries.",
    category: "About",
    tags: ["gurudev", "founder", "sri sri ravi shankar", "spiritual leader", "peace"],
    source_url: "https://www.artofliving.org/in-en/gurudev",
  },
  {
    slug: "panchkarma-ayurveda",
    content_type: "program",
    title: "Panchkarma — Ayurvedic Detox",
    description: "Traditional Ayurvedic detox treatment. 7-21 days. Supervised by Ayurvedic doctors at the ashram.",
    summary: "7-21 day traditional Ayurvedic detox program supervised by doctors.",
    venue: "Art of Living International Center, Bangalore",
    city: "Bangalore",
    eligibility: "Open to all (medical consultation required)",
    registration_link: "https://www.artofliving.org/in-en/ayurveda",
    category: "Wellness",
    tags: ["panchkarma", "ayurveda", "detox", "wellness", "health"],
    source_url: "https://www.artofliving.org/in-en/ayurveda",
  },
  {
    slug: "contact-info",
    content_type: "information",
    title: "Contact Art of Living",
    description: "General: info@artofliving.org | +91-80-67262626. Programs: programs@artofliving.org. Corporate: corporate@artofliving.org. Ashram stay: ashram@artofliving.org. Volunteer: volunteer@artofliving.org. Media: media@artofliving.org. Art of Living app on iOS and Android.",
    summary: "All contact details including email, phone, and department-specific contacts.",
    category: "Contact",
    tags: ["contact", "phone", "email", "support", "help"],
    source_url: "https://www.artofliving.org/in-en/contact",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Database not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => ({}));
    const mode = (body as { mode?: string }).mode || "full";

    let stats = { upserted: 0, deactivated: 0, wp_fetched: 0, errors: [] as string[] };

    // Step 1: Try fetching from WordPress REST API
    if (mode === "full" || mode === "wp") {
      for (const ep of WP_ENDPOINTS) {
        try {
          const wpUrl = `${WP_BASE}/${ep.endpoint}?per_page=50&status=publish&orderby=modified&order=desc`;
          const wpRes = await fetch(wpUrl, {
            headers: { "User-Agent": "AOL-ContentBot/1.0" },
            signal: AbortSignal.timeout(15000),
          });

          if (wpRes.ok) {
            const posts = await wpRes.json();
            if (Array.isArray(posts)) {
              for (const post of posts) {
                const slug = `wp-${ep.contentType}-${post.slug || post.id}`;
                const title = stripHtml(post.title?.rendered || "");
                const content = stripHtml(post.content?.rendered || "");
                const excerpt = stripHtml(post.excerpt?.rendered || "");

                if (!title || title.length < 3) continue;

                const { error } = await supabase.from("aol_content").upsert(
                  {
                    slug,
                    content_type: ep.contentType,
                    title,
                    description: content.slice(0, 5000),
                    summary: excerpt.slice(0, 500) || content.slice(0, 300),
                    category: ep.category,
                    tags: extractTags(title + " " + content),
                    source_url: post.link || `${SITE_BASE}/${post.slug}`,
                    raw_content: content.slice(0, 10000),
                    is_active: true,
                    fetched_at: new Date().toISOString(),
                  },
                  { onConflict: "slug" }
                );

                if (error) {
                  stats.errors.push(`WP upsert ${slug}: ${error.message}`);
                } else {
                  stats.wp_fetched++;
                }
              }
            }
          } else {
            stats.errors.push(`WP ${ep.endpoint}: HTTP ${wpRes.status}`);
          }
        } catch (e) {
          stats.errors.push(`WP ${ep.endpoint}: ${e instanceof Error ? e.message : "unknown"}`);
        }
      }
    }

    // Step 2: Upsert structured static content (always reliable)
    if (mode === "full" || mode === "static") {
      for (const item of STATIC_CONTENT) {
        const { error } = await supabase.from("aol_content").upsert(
          {
            ...item,
            raw_content: item.description,
            is_active: true,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );

        if (error) {
          stats.errors.push(`Static upsert ${item.slug}: ${error.message}`);
        } else {
          stats.upserted++;
        }
      }
    }

    // Step 3: Deactivate content with past end dates
    if (mode === "full") {
      const { count } = await supabase
        .from("aol_content")
        .update({ is_active: false })
        .lt("end_date", new Date().toISOString().split("T")[0])
        .eq("is_active", true)
        .not("end_date", "is", null);

      stats.deactivated = count || 0;
    }

    console.log(`[content-ingest] Done: ${JSON.stringify(stats)}`);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[content-ingest] Fatal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Ingestion failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTags(text: string): string[] {
  const keywords = [
    "yoga", "meditation", "breathing", "kriya", "sudarshan", "happiness",
    "retreat", "silence", "corporate", "children", "youth", "teen",
    "ayurveda", "panchkarma", "wellness", "seva", "volunteer",
    "ashram", "accommodation", "food", "event", "festival",
    "shivaratri", "navratri", "satsang", "program", "course",
  ];
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k));
}
