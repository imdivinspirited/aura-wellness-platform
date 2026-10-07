# 2026 Frontend Modernization — Assessment and Plan

## Goal
Modernize the existing Art of Living experience with a calm, premium “Sacred Modern” visual system and lower frontend cost, while preserving every route, content item, interaction, API contract, and existing user flow. Frontend-only: no database, backend, auth, production-content, or integration changes. Homepage redesign is explicitly included by the user.

## Assessment
- The router declares 83 paths. The project contains 211 page-related files, 156 component files, 182 image assets, and approximately 26 MB across `src/assets` and `public/images`.
- Existing UI is React/Vite with shared layout, navigation, shadcn controls, Tailwind tokens, and established Playfair Display/Inter fonts. Current tokens do not match the new brief’s teal-forward Sacred Modern palette.
- The app already has a homepage, international page, programs, events, services, exploration, profile/auth, admin/root, checkout, and CMS experiences; this is a modernization, not a rebuild.
- This first inventory is structural, not a verified catalogue of every page’s controls, dynamic states, and API-connected behaviors. That feature map must be completed before UI changes.
- No baseline performance or resource measurements were captured. Lighthouse, Core Web Vitals, transfer sizes, and route-level screenshots remain to be recorded before implementation.
- Preview verification is currently blocked: localhost:8080 refuses connections, the latest recorded startup log reports a missing `helmet` package in the dev backend import check, and the shared preview redirects most sampled routes to Login. Resolve preview availability through the normal project environment before relying on visual or functional comparisons; do not change backend behavior as part of this plan.

## Phased work
1. **Complete the feature inventory and baseline**
   - Build a route/feature map covering visible sections, navigation, CTAs, forms, search, filters, menus, modals, dynamic/API states, authentication surfaces, and mobile/desktop behavior.
   - Capture representative route screenshots and measure LCP, INP, CLS, FCP, TTFB, JS/CSS and image transfer, request count, and DOM size on desktop and mobile.
   - Restore reliable preview access for public routes; document any gated flows that cannot be tested without credentials.
2. **Set the design foundation**
   - Translate the supplied Sacred Modern colors into semantic tokens; preserve the current type pairing until the font audit demonstrates a safe, lighter replacement or loading strategy.
   - Define accessible contrast, typography and spacing roles, component states, reduced-motion rules, and shared control patterns. Check existing appearance themes so customization is not silently lost.
3. **Modernize the shared shell and reusable patterns**
   - Progressively update header, sidebar/mobile navigation, search presentation, footer, buttons, inputs, cards, dialogs, loading/empty/error states.
   - Keep route paths, navigation data, handlers, permissions, content and APIs intact. Audit each reused control’s callers before changing its appearance or structure.
4. **Refresh pages in measured groups, including the homepage**
   - Start with homepage and the highest-traffic discovery flows, then programs/events/services/explore/international, then profile/auth/commerce/admin/CMS.
   - Preserve each page’s existing sections and content; improve hierarchy and responsive composition without removing functionality. Load large optional features only on demand where safe.
5. **Reduce frontend cost and improve loading**
   - Use measurements to prioritize image sizing/lazy loading, font requests, route-level splitting, duplicate requests/rerenders, non-critical scripts, and low-bandwidth/reduced-data behavior.
   - Avoid new heavy libraries, blanket memoization, or global behavior changes without evidence. Keep primary content usable if optional content is slow or unavailable.
6. **Regression and release evidence**
   - After each group, compare screenshots and performance against baseline; test important routes and interactions across mobile, tablet, and desktop, keyboard and reduced-motion preferences.
   - Run Chrome plus practical Safari/Firefox/Edge checks, accessibility/contrast checks, and the existing project tests. Report measured before/after metrics and explicitly list any unverifiable or blocked paths.

## Safety gates
- No backend/schema/auth/API/production-data changes. If a requirement cannot be met in frontend scope, pause and ask before broadening it.
- Do not remove content, assets, routes, handlers, or existing behavior without a dependency and feature-map review.
- Do not make broad page changes until the complete feature inventory and baseline are available and preview verification works.
- Build thresholds should be agreed from the real baseline; Lighthouse targets are goals, not substitutes for real-world performance or regression evidence.
