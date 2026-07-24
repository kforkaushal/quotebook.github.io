# PRD — Quotebook v2: Human, Professional & Search-Ready Redesign

**Document owner:** Kaushal Patil
**Product:** Quotebook (39,000+ curated quotes + Poster Studio)
**Status:** Draft v1.0
**Last updated:** 24 July 2026

---

## 1. Why this PRD exists

The current build (`index.html`, `quotes.html`, `style.css`, `app.js`, `poster.js`) is functionally solid — quote browsing, Pixabay-backed poster generation, Zen Mode, bookmarks, TTS — but the **visual language reads as AI-generated** rather than designed by a human. This PRD names exactly what causes that impression, and defines the redesign scope so the next build pass fixes the *cause*, not just the surface.

This is a **planning document**, not the implementation. Once approved, each section below becomes a checklist for the actual CSS/HTML/JS rewrite.

---

## 2. Audit: why it currently looks "AI-made"

Based on the actual code, these are the specific tells:

| Tell | Where it shows up | Why it reads as generic |
|---|---|---|
| Floating blurred gradient orbs (`glow-orb orb-1/2/3`) on every page | `.ambient-bg-container` in `style.css`, present on both `index.html` and `quotes.html` | This exact ambient-mesh-blob background is the single most common "AI landing page" signature — it appears on thousands of Claude/GPT-generated sites |
| Glassmorphism everywhere (`rgba(255,255,255,0.82)` overlays, blurred cards, soft shadows) | Hero, poster overlay, cards | Glass-on-gradient is a default LLM aesthetic, not a considered design choice tied to this product's content (quotes/text) |
| Generic icon-in-circle feature cards (6-up grid, Font Awesome icon + h3 + p) | `.features-grid` in `index.html` | This exact pattern (icon, title, one-sentence description, 6 cards, 3-column grid) is the most templated SaaS-landing-page layout there is |
| Pulsing dot + badge pill ("39,531+ Curated Quotes...") | `.hero-badge-pill` | Classic AI-generated SaaS hero cliché |
| Stock Unsplash photography used as literal filler ("mountains", "cosmos") without curation logic tied to quote meaning | Poster preview cards | Reads as placeholder, not a curated visual system |
| Marquee ticker of category names with icons | `.marquee-ticker-container` | Very common auto-generated "trust bar" pattern, rarely load-bearing for a quotes product |
| Overuse of `Outfit`/`Playfair`/`Cormorant`/`Caveat` all at once with no clear hierarchy rule | Font imports in `<head>` | Four display fonts loaded "just in case" is a tell that type wasn't art-directed — a human designer commits to 1 display + 1 text face |
| Orange-as-default accent (`#f97316`-family) with no distinctive brand color story | CSS variables at top of `style.css` | Orange is the single most common LLM-picked "energetic" accent; it needs a reason to exist here (there isn't one tied to "quotes/wisdom") |
| Symmetrical, center-everything layouts (centered hero, centered section titles, evenly spaced 3-col/6-col grids throughout) | Nearly every section | Real editorial sites break symmetry deliberately; wall-to-wall centered grids are the default output of generation, not curation |

**The fix is not "add more animation and gradients."** It's: reduce decorative noise, commit to a specific typographic and color point of view, and let *content* (the quotes themselves) carry the visual weight instead of chrome around it.

---

## 3. Goals

1. **Design credibility** — a visitor's first reaction should be "a person with taste built this," not "this is a template."
2. **Motion with purpose** — every animation earns its place (feedback, orientation, delight at a moment that matters) — none of it is ambient decoration running 24/7 in the background.
3. **Fully responsive** — every interactive surface (grid, Poster Studio, Zen Mode, drawers, modals) works cleanly from a 360px phone to a 4K monitor, with real touch-target sizing, not just a squeezed desktop layout.
4. **SEO infrastructure that actually ranks** — indexable, crawlable, structured-data-rich, fast-loading, and internally linked so Google can understand and surface individual quotes/authors/categories — not just the two current HTML pages.
5. Keep the app **framework-free (vanilla HTML/CSS/JS)** — the fix is craft, not a rewrite in React.

### Non-goals (out of scope for this pass)
- Rebuilding the quote dataset or Pixabay integration logic.
- Adding user accounts / server-side backend.
- Migrating to a JS framework or SSG (may be revisited later purely for the SEO win of per-quote static pages — flagged in §7.5 as a future option).

---

## 4. Design direction ("human & professional")

### 4.1 Typographic system
- **Commit to two typefaces, not four:**
  - One **serif display face** for quotes themselves (the actual content) — keep *Cormorant Garamond* or *Playfair Display*, pick one, not both.
  - One **grounded sans** for UI chrome (nav, buttons, labels, metadata) — keep *Outfit*.
  - Drop *Caveat* (handwritten) as a default option — handwriting fonts on quote posters read as "greeting-card app," not "editorial." Keep it available only as one optional poster style, not a homepage font.
- Establish a real **type scale** (e.g., 1.25 ratio) documented once in CSS custom properties, rather than ad hoc `font-size` values scattered through `style.css`.
- Give quotes generous line-height (1.5–1.6) and a measured max-width (60–70ch) — this alone reads more "editorial magazine" than "app."

### 4.2 Color & surface
- Replace the ambient glow-orb mesh background globally. Options to evaluate:
  - A quiet paper/off-white or ink-dark surface with **subtle grain/texture** instead of blurred color blobs.
  - Reserve gradients/color for one deliberate moment (e.g., the hero backdrop image itself, or the poster overlays) — not as permanent wallpaper behind all content.
- Reduce reliance on orange as *the* brand color. Either:
  - Pair it with a deeper, more literary neutral (ink navy, warm charcoal, or deep forest) as the dominant tone, with orange used sparingly as a single accent (links, active states, one CTA) — or
  - Replace orange entirely with a more distinctive combination (e.g., deep burgundy + warm cream) that ties back to "printed book" associations rather than generic "startup energy."
- Cut glassmorphism to one purposeful use (e.g., the Poster Studio preview panel) instead of applying frosted-glass to hero cards, modals, and overlays uniformly.

### 4.3 Layout & composition
- Break at least the homepage hero and features section out of pure center-symmetry: asymmetric grid (e.g., quote content left-weighted, supporting visual right-weighted at a 60/40 or 65/35 split) reads more art-directed.
- Replace the generic 6-icon feature grid with a **mixed-format section**: 2 larger "hero features" (with a supporting visual/screenshot) + a tighter row of smaller items for the rest — avoids the uniform SaaS-template rhythm.
- Turn the marquee ticker into something with actual utility — e.g., make it a **live-updating "quotes added this week" or category quote-count ticker** sourced from real data, or remove it. Decorative-only marquees are a top "templated" signal.
- Vary section rhythm: alternate section background tone (not just white-on-white repeating), vary vertical spacing intentionally rather than uniform padding on every `<section>`.

### 4.4 Imagery
- Replace generic Unsplash keyword photos ("mountains," "cosmos") with either:
  - A curated, consistent photographic tone (e.g., always desaturated/warm-toned, always shot-on-film aesthetic) so imagery feels like one photographer's eye, not a stock grab, or
  - Illustration/texture treatments unique to Quotebook (paper texture, ink-stain motifs, subtle line art) instead of photography at all on marketing sections — reserving real photography for the Poster Studio where it's functionally necessary (Pixabay backdrops).

---

## 5. Animation & interaction plan

**Principle:** motion communicates state, direction, or delight at a specific trigger — it does not run permanently in the background.

| Interaction | Current | Redesign |
|---|---|---|
| Ambient background | 3 blurred orbs animating forever | Remove, or replace with a very slow, near-imperceptible single subtle texture drift — not attention-competing |
| Section entry | Some `fade-in-up` on hero only | Consistent **scroll-triggered reveal** (IntersectionObserver) across all major sections — quote cards stagger in, feature blocks slide up ~12px with easing, not linear |
| Quote card hover | Static | Subtle lift + shadow deepen + author underline draw-in on hover (desktop); tap-scale feedback on mobile |
| Hero quote rotation ("Next Featured Quote") | Instant swap | Crossfade + slight vertical shift transition between quotes, respecting `prefers-reduced-motion` |
| Zen Mode transitions | Background crossfade exists | Add quote text fade+slide between slides, autoplay progress indicator (thin bar) so users see timing, not just a play/pause icon |
| Poster Studio controls | Instant re-render | Canvas re-render already instant (fine) — add a subtle "flash" or checkmark micro-confirmation on successful PNG export/download |
| Buttons/CTAs | Flat hover states | Add purposeful micro-interactions: primary CTA gets a subtle fill-sweep or icon-shift on hover, not just color change |
| Category pill navigation | Instant filter | Add an animated underline/pill "slide" indicator that moves to the active pill instead of instant class swap |
| Page-level | None | Add a lightweight page-transition (fade, ~150–200ms) between `index.html` ↔ `quotes.html` navigations for perceived polish |
| Toasts | Present | Keep, but slide+fade in/out with correct easing curve instead of default browser-feeling pop |

**Accessibility requirement:** every animation above must have a `prefers-reduced-motion: reduce` fallback that disables or shortens motion — this is both a UX and an SEO/Core Web Vitals consideration (motion-heavy sites without this flag hurt trust signals).

**Performance requirement:** animations must be GPU-accelerated (`transform`/`opacity` only, no animating `width`/`top`/`box-shadow` directly) to protect Core Web Vitals (CLS/INP), which directly affects SEO ranking (§7).

---

## 6. Mobile & responsive requirements

Current CSS already has breakpoints at 1024px and 768px — this section defines what "done" looks like, not just "resize and see."

1. **Touch targets** — every button/icon-button (header actions, category pills, poster controls, zen controls) must be ≥44×44px tappable area on mobile, even if the visual icon is smaller.
2. **Header** — collapse search + nav into a clean mobile pattern (already has `mobile-menu-toggle`; ensure the search bar doesn't fight for space with the burger menu on small screens — consider a dedicated mobile search icon that expands to full-width overlay instead of a persistent input in the header).
3. **Poster Studio on mobile** — this is the highest-risk surface: canvas + controls panel side-by-side won't work under ~600px. Requirement: stack canvas preview above a scrollable controls panel, with the canvas sized to viewport width and controls in a bottom-sheet-style panel rather than squeezed side column.
4. **Zen Mode on mobile** — controls must not overlap quote text at small viewport heights (test at 360×640 and with mobile browser chrome/URL bar visible).
5. **Quotes grid** — must reflow to single column below ~480px with no horizontal scroll or overflow, and image/text card padding must scale down (not just font-size).
6. **Bookmarks drawer** — should become a full-height slide-up sheet on mobile rather than a fixed-width side drawer.
7. **Test matrix:** 360px (small Android), 390px (iPhone standard), 768px (tablet portrait), 1024px (tablet landscape/small laptop), 1440px+ (desktop). No horizontal scrollbars at any of these.
8. **Performance on mobile networks** — lazy-load Pixabay images and below-the-fold content; defer non-critical JS; target Largest Contentful Paint under 2.5s on 4G.

---

## 7. SEO requirements

This is currently a 2-page static site with no metadata infrastructure beyond a title/description tag. To "hold strong SEO" the following is required:

### 7.1 Technical foundations
- `robots.txt` allowing full crawl, pointing to sitemap.
- `sitemap.xml` — must be generated/updated to include every indexable URL (see §7.5 for what that expands to).
- Canonical tags (`<link rel="canonical">`) on every page to avoid duplicate-content issues from query-string category/author filters (`quotes.html?category=...`).
- Proper heading hierarchy: one `<h1>` per page (currently `quotes.html` has no visible `<h1>` — the logo/title isn't a substitute), `<h2>` for section titles, `<h3>` for cards — currently mostly correct on the homepage, needs auditing on `quotes.html`.
- `alt` text on every image, written descriptively (not just "photo") — required for both accessibility and image search traffic.

### 7.2 Metadata & social
- Unique `<title>` and `<meta name="description">` per page/state (currently only static, identical regardless of filter/category applied).
- Open Graph (`og:title`, `og:description`, `og:image`, `og:type`) and Twitter Card tags on every page — currently missing entirely — needed for link previews when shared (WhatsApp/Twitter/LinkedIn), which also indirectly supports SEO via social signals and CTR.
- A default social share image (branded, not a random Unsplash photo) for pages without a specific quote image.

### 7.3 Structured data (Schema.org / JSON-LD)
- `WebSite` schema with `SearchAction` on the homepage (enables Google sitelinks search box).
- `Quotation` / `CreativeWork` schema for individual quotes where feasible — even if quotes remain client-side rendered, consider server-rendering or statically generating a lightweight JSON-LD block for the featured "Quote of the Day" so it's crawlable without JS execution.
- `BreadcrumbList` schema once category/author pages exist (§7.5).
- `Organization`/brand schema in the footer/global scope for brand knowledge panel eligibility.

### 7.4 Content & crawlability of the core problem
**The core SEO limitation right now:** `quotes.html` renders **all 39,000+ quotes client-side from JSON** (`data/featured_quotes.json`, `data/quotes_8000_plus.json`) with filtering done in JavaScript after page load. This means:
- Individual quotes and categories have **no unique, crawlable URL** — Google sees one `quotes.html` page, not 39,000 indexable quote pages, which is the single biggest missed SEO opportunity for a quotes product (compare to how BrainyQuote/AZQuotes rank — almost entirely on long-tail per-quote and per-author pages).
- Content requires JS execution to appear in the DOM at all, which is a real (if partially mitigated by modern Googlebot) crawl risk, especially for freshness/re-crawl frequency.

### 7.5 Recommended content architecture (biggest lever, flagged for scoping/prioritization)
To fix §7.4 without abandoning the vanilla-JS approach:
- Generate **static per-category pages** (e.g., `/quotes/wisdom-knowledge.html`, `/quotes/love-relationships.html`) at build time from the existing JSON — each with a real `<h1>`, unique meta description, and its own crawlable quote list (can still be JS-enhanced for filtering/sorting on top of a server-rendered base list).
- Generate **static per-author pages** (e.g., `/authors/mark-twain.html`) — high long-tail search volume ("mark twain quotes about reading") and a natural internal-linking hub.
- Optionally, generate **static per-quote pages** for the most popular/shareable quotes (even a template with quote + author + category + related quotes + poster CTA) — this is what actually competes for "quote of the day" / "[topic] quotes" search terms.
- All of the above can be a **build-time script** (Node.js, run once or on data update) that outputs static HTML from the same JSON already in `data/` — no framework migration needed, keeps the site 100% static and hostable anywhere.
- Add breadcrumb + "related categories/authors" internal links across these generated pages to distribute link equity and aid crawl depth.

### 7.6 Performance as an SEO factor
- Core Web Vitals (LCP, INP, CLS) are direct ranking factors — the animation guidance in §5 (GPU-accelerated transforms only, reduced-motion support) and the mobile guidance in §6 (lazy loading, deferred JS) both feed this directly.
- Preload the hero background image / critical font weights; `font-display: swap` on all Google Fonts (verify currently set).
- Audit and remove unused CSS given the file is already 68K+ lines-equivalent — a leaner stylesheet after the design simplification in §4 should also net a performance/SEO win.

---

## 8. Success metrics

| Metric | Baseline | Target after v2 |
|---|---|---|
| Indexed pages (Google Search Console) | ~2 | 500+ (via category/author static pages) |
| Mobile Core Web Vitals (LCP/INP/CLS) | Not yet measured — baseline first | All "Good" in Search Console |
| Organic long-tail impressions ("[author] quotes", "[topic] quotes") | ~0 (no dedicated pages) | Measurable growth within 4–8 weeks of indexing |
| Qualitative design review | "Looks AI-generated" (user's own words) | Reviewer cannot identify it as AI-templated without being told |
| Mobile usability errors (Search Console) | Unknown — audit first | 0 |

---

## 9. Phased roadmap

**Phase 1 — Design system reset**
De-AI-ify color/type/background per §4; define CSS custom properties as the single source of truth; remove ambient orb background and glassmorphism overuse.

**Phase 2 — Motion pass**
Implement scroll-reveal, hover micro-interactions, hero/zen transitions per §5, with `prefers-reduced-motion` support baked in from the start (not retrofitted).

**Phase 3 — Responsive hardening**
Rebuild Poster Studio and Zen Mode mobile layouts per §6; full device test matrix pass.

**Phase 4 — SEO infrastructure**
robots.txt, sitemap.xml, meta/OG/JSON-LD per §7.1–7.3; audit heading structure.

**Phase 5 — Content architecture (highest long-term impact, plan separately)**
Build-time static generation of category and author pages per §7.5; this is the largest single lever for organic growth and should be scoped as its own follow-up build once Phases 1–4 are shipped.

---

## 10. Open questions for Kaushal

1. Final color direction: refine current orange-forward palette, or move to a more literary/editorial palette (ink + cream + single accent)?
2. Should Poster Studio's Caveat/handwritten font stay as an optional style, or be dropped entirely?
3. Priority on Phase 5 (static per-quote/author pages) — is this in scope now, or a separate follow-up project once the core redesign ships?
4. Any existing brand references (logo, colors used elsewhere in your MSBTE Notes & Info / PickAI / BasicsHub work) that Quotebook should stay visually consistent with, or is this an intentionally separate brand?