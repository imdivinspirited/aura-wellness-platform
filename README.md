# 🕉️ Art of Living Website — Aura Wellness Platform

> **Version:** 1.0 | **Priority:** Production-Ready | **Level:** Enterprise  
> A luxury-grade, future-proof web platform for the Art of Living (Bangalore Ashram), with integrated Depth Dig AI chatbot and full CMS capabilities.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Setup & Development](#2-setup--development)
3. [Architecture & Tech Stack](#3-architecture--tech-stack)
4. [Feature Documentation](#4-feature-documentation)
5. [Folder Structure](#5-folder-structure)
6. [Implementation Phases](#6-implementation-phases)
7. [Deployment & Checklist](#7-deployment--checklist)
8. [Contributor Guide](#8-contributor-guide)
9. [License & Contact](#9-license--contact)

---

## 1. Project Overview

We have **two integrated projects**:

| Project | Description | Repo / Location |
|--------|-------------|------------------|
| **Art of Living Website** | Main website (this codebase) | Current repo |
| **Depth Dig AI Chatbot** | Standalone chatbot, embedded in site | GitHub: `imdivinspirited/depth-dig-ai` (integrated as submodule or iframe) |

The website provides:

- **Public:** Programs, events, services, explore, connect, Seva & Careers, global search, and an in-app chatbot.
- **Authenticated users:** Profile, cart, notifications, preferences.
- **Root users:** WordPress-like CMS (visual page editor, blogs, media, SEO, Seva applications admin).

### Current Feature Status

| Feature | Status | Notes |
|--------|--------|--------|
| Chatbot in Message icon | ✅ | Right-side drawer, sessionStorage, lazy-loaded; Depth Dig AI can be embedded when submodule/URL is set |
| Seva & Careers nav + page | ✅ | Hero + placeholder; full form + Google Sheets in Phase 3 |
| Explore page + bottom bar icons | ✅ | Icons on nav items; Explore renders correctly |
| Course cards position | ✅ | Hero height constrained; cards closer to hero on listing and program pages |
| Bottom menu bar (5 items) | ✅ | Home, Explore, Programs, Seva, Profile (mobile); desktop keeps context SubNav |
| Footer | 🔄 | Logo path fixed; full redesign (dark, gold, 4-col, newsletter) in progress |
| Dynamic search (Fuse.js) | 📋 | Planned; centralized `searchIndex` + Fuse.js |
| Root User CMS | 📋 | Planned; `/root-admin`, visual editor, blogs, media, SEO |
| Performance, SEO, Security | 📋 | Targets and checklist in §4 and §7 |

---

## 2. Setup & Development

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or Atlas) for backend
- (Optional) **Python 3.8+** for scripts: `content_indexer.py`, `seo_analyzer.py`, `image_optimizer.py`, chatbot RAG

### Install Dependencies

```bash
cd aura-wellness-platform-main
npm install

# If using backend
cd backend && npm install && cd ..
```

### Chat server (Global Search)

For **Global Search** in the chatbot (AI answers, web-style queries), run the optional Node chat server:

```bash
cd server
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env for AI responses
npm run dev
```

Then in the project root `.env` set:

```bash
VITE_CHAT_API_BASE_URL=http://localhost:5000/api/v1
```

Restart the frontend. If the chat server is not running or `OPENAI_API_KEY` is missing, Global Search shows a short message instead of an error.

### Environment Variables

**Backend** (`backend/.env`):

```bash
MONGODB_URI=mongodb://localhost:27017/aura-wellness
JWT_SECRET=replace_with_secure_secret
JWT_REFRESH_SECRET=replace_with_secure_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Frontend** (`.env` in project root — create from `.env.example`):

```bash
# Optional: Google Apps Script Web App URL for Seva/Careers form
VITE_SEVA_FORM_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Optional: AOLIC chatbot (real AI in Message icon drawer)
# Get these from your Supabase project; deploy the chat Edge Function from depth-dig-ai.
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Optional: Embed full chatbot app in drawer via iframe (alternative to above)
# VITE_CHATBOT_APP_URL=https://your-deployed-depth-dig-ai.vercel.app

# Optional: EmailJS / Twilio for confirmations (when implemented)
# VITE_EMAILJS_PUBLIC_KEY=...
# VITE_TWILIO_* = never expose secrets in client; use backend proxy
```

**Root User CMS** (when implemented — `.env`, never committed):

- `ROOT_USER_1_ID`, `ROOT_USER_1_PASSWORD`, `ROOT_USER_1_CODE` … up to `ROOT_USER_100`
- `ROOT_MASTER_KEY`
- Passwords must be bcrypt-hashed; use a script to generate, never hardcode.

### Chatbot Integration (Depth Dig AI)

Add the chatbot repo as a **git submodule**:

```bash
git submodule add https://github.com/imdivinspirited/depth-dig-ai chatbot
```

Then either:

- **Option A:** Build and deploy `depth-dig-ai` and embed via **iframe** in `ChatbotDrawer` (URL in env).
- **Option B:** Copy or link the chatbot UI into `src/components/chatbot/` and wire its API; keep RAG/backend in `chatbot/` (e.g. `chatbot/rag_pipeline.py`, `chatbot/data/websites.txt`).

Chatbot behaviour in this repo:

- Opens from **Message icon** in header (right-side drawer; mobile-friendly).
- **Lazy-loaded** when the icon is clicked.
- **sessionStorage** key `aol_chat_session` for conversation history; cleared on reload.
- **Badge:** unread count (0 by default; increment when bot replies while chat is closed).
- **Triggers** on Connect and Explore pages via `ChatTrigger` component.

### Google Sheets — Seva / Careers Applications

When the full Seva form is implemented:

1. Create a Google Sheet with columns:  
   `Timestamp`, `Name`, `Email`, `Phone`, `WhatsApp`, `Type`, `Position`, `Age`, `Gender`, `City`, `State`, `Country`, `Education`, `Skills`, `Available From`, `Duration`, `Why Join`, `Resume Link`, `Photo Link`, `Status`.
2. In Google Drive: **Extensions → Apps Script**. Paste a `doPost` handler that parses `e.postData.contents` (JSON), appends a row to the sheet, and returns `ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON)`.
3. Deploy as **Web app**: Execute as **Me**, Who has access **Anyone**. Copy the **Web app URL** into `VITE_SEVA_FORM_WEB_APP_URL`.

### Run Locally

**Backend:**

```bash
cd backend && npm run dev
```

**Frontend:**

```bash
npm run dev
```

Open the Vite URL (e.g. `http://localhost:5173`).

---

## 3. Architecture & Tech Stack

### Recommended Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Lucide React |
| **State** | Zustand (auth, user, cart, navigation, sidebar, chatbot) |
| **Routing** | React Router v6 |
| **Data** | TanStack React Query, REST API |
| **Backend** | Node.js, Express (or Next.js API routes) |
| **Database** | MongoDB Atlas (or Supabase) |
| **Auth** | JWT + refresh tokens, bcrypt for root users |
| **Search** | Fuse.js (client); optional Elasticsearch (server) |
| **Email** | EmailJS (client) or Nodemailer (server) |
| **WhatsApp** | Twilio or WhatsApp Business API (via backend only) |
| **Storage** | Cloudinary or `/public/uploads/`; Google Drive for resumes via API |
| **CMS content** | JSON in `/content/pages/` + MongoDB sync |
| **Deploy** | Vercel/Netlify (frontend), Railway/Render (backend) |
| **CI/CD** | GitHub Actions |
| **CDN** | Cloudflare (optional) |

### Storage Strategy

| Use case | Store | Notes |
|----------|--------|--------|
| Chat history (session) | `sessionStorage` | Cleared on tab close |
| User preferences, theme, language | `localStorage` | Persists |
| Search index, component cache | In-memory `Map` / Fuse | Runtime only |
| Auth token | Cookie (httpOnly, secure, sameSite=strict) or memory | Never store secrets in client |

---

## 4. Feature Documentation

### 4.1 Chatbot Integration

- **Where:** Header **Message icon** (💬); also **Connect** and **Explore** via “Chat with us” / `ChatTrigger`.
- **UI:** Right-side **Sheet** (drawer); mobile: full-width. **Lazy-loaded** when opened.
- **State:** `useChatbotStore` (Zustand): `isOpen`, `unreadCount`, `setOpen`, `incrementUnread`, `clearUnread`.
- **Persistence:** `sessionStorage` key `aol_chat_session`; reload = fresh session.
- **Badge:** Shows `unreadCount`; spec: increment when bot replies and chat is closed (e.g. when Depth Dig push is wired).
- **Components:** `src/components/chatbot/ChatbotDrawer.tsx`, `ChatTrigger.tsx`; `src/stores/chatbotStore.ts`.

### 4.2 Seva & Careers

- **Nav:** “Seva & Careers” in main nav and bottom menu (path `/seva-careers`).
- **Page:** `src/pages/seva-careers/SevaCareersPage.tsx` — hero, subtitle, placeholder cards (Seva, Jobs, Internships). Full implementation includes:
  - **Filter tabs:** All | Seva 🙏 | Jobs 💼 | Internships 🎓
  - **Listing cards:** Title, type, department, duration, location, “Apply Now”
  - **Application form:** Name, email, phone, WhatsApp, type, position, age, gender, city, state, country, education, skills, available from, duration, “Why join”, resume upload, photo upload
  - **Submit:** POST to Google Apps Script Web App URL → append row to Google Sheet
  - **Root admin:** View applications, set interview date/time, send email/WhatsApp, status flow: Pending → Shortlisted → Interview Scheduled → Selected/Rejected

### 4.3 Explore Page & Bottom Menu Bar

- **Explore:** Icons added for all Explore (and Connect) sub-nav items in `src/config/navigation.ts` so the **SubNav** bar shows icons (Compass, Heart, FileText, Video, MessageCircle, etc.).
- **Bottom menu bar (mobile):** `BottomMenuBar.tsx` — fixed 5 items: **Home**, **Explore**, **Programs**, **Seva**, **Profile**. Height 64px, `z-index: 1000`, safe-area padding. Active state: primary color + underline indicator.
- **Desktop:** Context **SubNav** (programs/events/explore/connect sub-tabs) remains; BottomMenuBar is hidden on `lg`.

### 4.4 Course Cards Position

- **Programs listing:** Hero `min-h-[40vh]`; filters section `py-4`/`py-6`; programs grid `py-6`/`py-10`; `scroll-mt-20` for anchor linking.
- **Individual program pages (e.g. Happiness):** Hero `min-h-[40vh] max-h-[90vh]` on mobile, `md:min-h-[70vh]` on desktop so cards/content appear sooner.

### 4.5 Dynamic Search Bar (Planned)

- **Single source of truth:** `src/data/searchIndex.js` (or generated JSON) — id, title, description, category, tags, url, image.
- **Build script:** `scripts/generateSearchIndex.js` to scan content and update the index; Root CMS can append on publish.
- **Runtime:** Fuse.js (e.g. `keys: ['title','description','tags','category']`, `threshold: 0.3`), 300ms debounce; show title, category, snippet, thumbnail.

### 4.6 Footer Redesign (Planned)

- **Layout:** 4 columns (desktop) / 2 (tablet) / 1 (mobile): Brand | Quick Links | Programs | Connect.
- **Style:** Dark background (`#1a1a2e` or `#2d0a0a`), gold accents, subtle pattern (e.g. lotus/mandala SVG), hover gold transition, newsletter with glassmorphism input.
- **Content:** Logo, tagline “Breathe. Smile. Live.”, social row; Quick Links (About, Events, Seva/Careers, Blog); Programs (SKY, Yoga, Meditation, Children); Connect (Email, Phone, Address); Newsletter; copyright, Privacy, Terms, Sitemap.

### 4.7 Chatbot Mode Restructure (Planned — Depth Dig)

- **Modes:** **Platform Only** | **Global Search** (remove Mixed).
- **Platform Only order:** (1) `/chatbot/data/` files, (2) site content indexed at build, (3) URLs in `chatbot/data/websites.txt`, (4) fallback global search.
- **websites.txt:** One URL per line; `#` comments. RAG can scrape and index for retrieval.
- **UI:** Toggle “Platform” / “Global”; source badge per response (📁 Platform / 🌐 Web).

### 4.8 Root User CMS (Planned)

- **Route:** `/root-admin`. Login: username, password, root code (extra layer).
- **Auth:** Up to 100 root users from `.env` (`ROOT_USER_*_ID`, `*_PASSWORD`, `*_CODE`); bcrypt hashes; `ROOT_MASTER_KEY`.
- **Dashboard:** Overview, Pages, Blogs, Media, SEO, Seva (applications table), Settings.
- **Features:** Visual page editor (inline edit, image picker, section reorder, publish/draft), blog (TipTap/Quill, featured image, SEO fields), media library (upload, compress, folders), SEO (meta, sitemap, robots, schema), Seva admin (applications, interview scheduler, email/WhatsApp, status, export).

### 4.9 Performance, SEO & Security (Targets)

- **Lighthouse:** Performance 90+, Accessibility 95+, Best Practices 95+, SEO 98+.
- **Frontend:** Code splitting (React.lazy + Suspense), image optimization (WebP, lazy load, `srcset`), font `display: swap`, memoization, virtual lists for long lists.
- **SEO:** Unique `<title>` and meta per page, Open Graph, Twitter Card, JSON-LD (Organization, Course, Event, BlogPosting, BreadcrumbList), sitemap, robots.txt, canonical URLs, hreflang if multilingual.
- **Security:** Helmet, CORS whitelist, input sanitization (DOMPurify/validator), file upload validation, JWT + refresh, rate limiting (e.g. 100/min general, 10/min auth), HTTPS only, CSP, no secrets in client bundle.

---

## 5. Folder Structure

```text
/
├── public/
│   ├── images/           # programs, events, services, explore, connect, logos
│   └── uploads/          # Media library (when CMS is used)
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer, Sidebar, MainLayout, SubNav, BottomMenuBar, RouteSync
│   │   ├── chatbot/      # ChatbotDrawer, ChatTrigger
│   │   ├── root/         # RootOverlay, RootEditable (existing)
│   │   ├── cart/         # CartIcon, CartDrawer
│   │   ├── search/       # SearchModal
│   │   ├── notifications/
│   │   └── ui/           # shadcn + SafeImage, SmartLink
│   ├── pages/
│   │   ├── programs/     # Listing + beginning, advance, children-teens, more, retreats
│   │   ├── seva-careers/# SevaCareersPage
│   │   ├── explore/      # ExplorePage, about, mission, articles, videos, testimonials
│   │   ├── connect/      # ConnectPage, contact, support, faqs
│   │   ├── events/
│   │   ├── services/
│   │   └── root-admin/   # (Planned) CMS dashboard
│   ├── config/           # navigation.ts
│   ├── data/             # (Planned) searchIndex.js
│   ├── lib/               # api, search, media, routes, i18n
│   ├── stores/            # authStore, userStore, chatbotStore, navigationStore, etc.
│   └── styles/
├── chatbot/               # depth-dig-ai submodule or local copy
│   └── data/
│       ├── websites.txt  # URLs for Platform RAG
│       └── [PDF, TXT, JSON, MD]
├── content/               # (Planned) CMS
│   ├── pages/
│   └── blogs/
├── scripts/               # (Planned) generateSearchIndex.js, content_indexer.py, image_optimizer.py
├── templates/             # (Planned) email templates
├── backend/               # Express API (existing)
├── .env                   # Secrets (gitignored)
└── .env.example           # Template (committed)
```

---

## 6. Implementation Phases

| Phase | Focus | Items |
|-------|--------|--------|
| **1** | Bug fixes | Explore errors, bottom bar icons, course cards position ✅ |
| **2** | Core features | Chatbot in message icon ✅, dynamic search (Fuse.js), footer + bottom nav redesign |
| **3** | New features | Seva/Careers full page, form, Google Sheets, email confirmation |
| **4** | Chatbot enhancement | Platform/Global only, RAG (data/ + websites.txt), fallback to global |
| **5** | Root CMS | Login (env-based), dashboard, visual editor, blogs, media, SEO, Seva admin |
| **6** | Launch | Performance, SEO, security, testing (unit + E2E + load), deployment |

---

## 7. Deployment & Checklist

Before production:

- [ ] All env vars set in hosting (no secrets in client bundle).
- [ ] Build passes: `npm run build` (no errors/warnings).
- [ ] Lighthouse 90+ on key pages.
- [ ] Mobile responsive (e.g. BrowserStack).
- [ ] Forms tested (Seva submit → Google Sheet when implemented).
- [ ] Chatbot and search tested.
- [ ] Root login and CMS tested (when implemented).
- [ ] 404 and error boundaries in place.
- [ ] Analytics (e.g. GA4) if required.

---

## 8. Contributor Guide

### Add a new nav item

1. Edit `src/config/navigation.ts` (and add `labelKey` in `src/lib/i18n.ts` if needed).
2. Add route in `src/App.tsx`.
3. For bottom bar: `BottomMenuBar` uses a fixed list; add there if it should appear on mobile.

### Add a new card/page

1. Choose category (programs, services, events, explore, connect).
2. Add content in the relevant `data` or page file.
3. Add image under `public/images/<category>/` and use `SafeImage` with `cardHeroImagePath` where applicable.

### Theme & logos

- Theme: `useUserStore.appearance` (theme preset, light/dark, font size, reduce motion, high contrast) applied in `MainLayout`.
- **Footer/Sidebar logos:** Use paths under `public` (e.g. `/images/logos/aolic_logo.png`, `aolic_logo_white.png`). Do not use `/src/assets/` in `src` for production image URLs.

### Code style

- TypeScript interfaces for all public props and data.
- Prefer config-driven content and reusable UI from `components/ui` and layout components.
- Never break existing features; test after changes.

### Important notes

1. **No secrets in client** — keep `.env` out of the repo; use `.env.example` with placeholders.
2. **Root users** — credentials from env, hashed with bcrypt; no hardcoded passwords.
3. **Chatbot** — integrate Depth Dig via submodule + iframe or in-tree component; RAG and `websites.txt` in `chatbot/`.
4. **Mobile first** — 44px min touch targets, safe area for bottom nav, 16px min font on inputs.
5. **Accessibility** — ARIA labels and keyboard navigation for interactive elements.

---

## 9. License & Contact

- **License:** MIT (or as specified by Art of Living Foundation).
- **Contact:** Official Art of Living / Ashram contact (e.g. `info@artofliving.org`, website).

---

*This README reflects the Art of Living Website master development prompt (v1.0) and the current Aura Wellness Platform codebase.*
