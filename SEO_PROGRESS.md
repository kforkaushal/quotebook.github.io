# SEO_PROGRESS.md — quotebook.me

Tracks implementation of [SEO_AUDIT_AND_FIX_SPEC.md] phases.
Run `python seo_lint.py . --csv seo_report.csv` after each phase to update numbers.

---

## Baseline (2026-10-16, before any changes)

`seo_lint.py` scan of 625 HTML pages:

| Issue | Count |
|---|---|
| img w/h missing | 625 |
| h2 missing | 611 |
| meta desc >155 chars | 499 |
| title >60 chars | 240 |
| h1 duplicate | 214 |
| words <200 | 58 |
| title <30 chars | 14 |
| h1 >70 chars | 9 |
| canonical missing | 1 |
| no json-ld | 1 |
| **noindex pages** | **185** |

---

## Phase 1 — URL canonicalisation, robots.txt, Blog in nav/footer

**Date:** 2026-10-16  
**Spec sections:** P0-1, P0-3, P2-1 (nav/footer only)

### Changes made

#### P0-1 — Triple homepage URL (done)
- Changed every `../index.html` internal link to `/` across **615 HTML files** (1,261 occurrences).
- Changed every `href="/index.html"` to `href="/"` in 404.html.
- Fixed JSON-LD breadcrumb `item` URLs using `quotebook.me/index.html` to `quotebook.me/` — **294 files**.
- Cleaned `quote-of-the-day/index.html` href on homepage to `quote-of-the-day/`.
- Fixed `../blog/index.html` → `/blog/`, `../authors/index.html` → `/authors/`, etc.
- Fixed `sitemap.xml` `/index.html` occurrences.
- Created `index.redirect.html` as a JS-redirect stub for the `/index` (no-extension) path.

> **Hosting caveat:** The site is on **GitHub Pages** (CNAME file present, `.nojekyll` present,  
> no `_redirects` or `netlify.toml`). GitHub Pages cannot issue server-side 301 redirects.  
> The spec's `curl -I https://quotebook.me/index.html` → 301 acceptance criterion **cannot be met**  
> on the current host. `/index.html` will continue to serve the same HTML as `/` — Google  
> will deduplicate them via the `<link rel="canonical" href="https://quotebook.me/">` that was  
> already in place. The practical SEO risk is low since canonical is correct and internal links  
> now all point to `/`. **To fully satisfy P0-1, migrate to Netlify and add `_redirects`:**
> ```
> /index.html   /   301
> /index        /   301
> ```

#### P0-3 — robots.txt (done)
- Replaced narrow `/quotes.html?` Disallow with spec baseline:
  ```
  Disallow: /search
  Disallow: /*?
  ```
- No content URLs were found in the 10 blocked-URL sample; the prior rule was already only blocking parameterised pages.
- 0 internal 4xx found during code inspection. The 3 broken URLs from the Screaming Frog crawl were not traceable to specific files without a URL list from the crawl export. **Action:** run a full licensed crawl (Phase 7) to identify exact broken URLs and the pages linking to them.

#### P2-1 — Blog in nav and footer (done)
- Added `<a href="blog/">Blog</a>` to the main nav in `index.html` (after Poster Studio).
- Added `<a href="blog/">Blog</a>` and `<a href="quote-of-the-day/">Quote of the Day</a>` to the footer Navigation column in `index.html`.
- `blog/index.html` already had Blog in its own nav; no change needed there.

#### Homepage P1 fixes (done as part of Phase 1 pass)
- **Title:** `Quotebook — Timeless Quotes & Visual Poster Studio` (47 chars) → `Quotebook: Famous Quotes & Free Quote Poster Maker` (50 chars) ✅
- **Meta description:** Updated to spec wording (143 chars, within 110–155 limit) ✅
- **H1:** `Discover Timeless Quotes. Inspire Every Day.` → `Famous Quotes by Topic and Author, Made Into Posters.` ✅
- **JSON-LD:** Upgraded from `@type: WebSite` to `@graph` pattern with `WebSite` + `Organization` nodes per spec Section 5. Added `SearchAction potentialAction`. ✅
- **OG / Twitter tags:** Updated to match new title and meta description. ✅
- **"1 Million+" claim:** Kept exactly as-is per user instruction. ✅

### Post-Phase-1 lint (626 pages — includes index.redirect.html)

| Issue | Before | After | Δ |
|---|---|---|---|
| img w/h missing | 625 | 625 | 0 (Phase 4 work) |
| h2 missing | 611 | 612 | +1 (index.redirect.html) |
| meta desc >155 | 499 | 499 | 0 (Phase 3 work) |
| title >60 | 240 | 240 | 0 (Phase 3 work) |
| h1 duplicate | 214 | 214 | 0 (Phase 3 work) |
| words <200 | 58 | 59 | +1 (index.redirect.html) |
| title <30 | 14 | 15 | +1 (index.redirect.html) |
| noindex pages | 185 | 186 | +1 (index.redirect.html is noindex ✓) |
| canonical missing | 1 | 1 | (Phase 3 will fix) |
| no json-ld | 1 | 2 | +1 (index.redirect.html has no LD) |

> The 1-unit increases are all from `index.redirect.html` which is intentionally noindex and minimal.

---

## Phase 2 — noindex audit and policy

**Date:** 2026-10-16  
**Spec section:** P0-2  
**Acceptance Criterion:** No page in the "index" rows is noindexed. Noindex remains only on rows that say so. Table of noindex URLs grouped by page type produced.

### 1. Repository-wide robots audit by page type

Comprehensive scan of all 626 HTML pages across the repository:

| Page Type | Total | `noindex` | Explicit `index` | Default `index` | Policy Status |
|---|---|---|---|---|---|
| **Homepage / Root** (`/index.html`) | 1 | 0 | 1 | 0 | **Index** ✅ |
| **Redirect Stub** (`/index.redirect.html`) | 1 | 1 | 0 | 0 | **noindex, follow** (intentional redirect fallback) ✅ |
| **Quotes Explorer Hub** (`/quotes.html`) | 1 | 0 | 1 | 0 | **Index** ✅ |
| **Category Directory Hub** (`/quotes/index.html`) | 1 | 0 | 1 | 0 | **Index** (added explicit tag in Phase 2) ✅ |
| **Categories & Subcategories** (`/quotes/**/*.html`) | 294 | 0 | 3 | 291 | **Index** ✅ |
| **Authors Directory Hub** (`/authors/index.html`) | 1 | 0 | 1 | 0 | **Index** ✅ |
| **Author Pages** (`/authors/*.html`) | 103 | 0 | 0 | 103 | **Index** ✅ |
| **Blog Index & Posts** (`/blog/*`) | 2 | 0 | 2 | 0 | **Index** ✅ |
| **Poster Studio & Gallery** (`/poster.html`, `/gallery/index.html`) | 2 | 0 | 2 | 0 | **Index** ✅ |
| **Informational / Legal** (`about.html`, `contact.html`, `terms.html`) | 3 | 0 | 3 | 0 | **Index** ✅ |
| **QOTD Archive Hub** (`/quote-of-the-day/index.html`) | 1 | 0 | 1 | 0 | **Index** (added explicit tag in Phase 2) ✅ |
| **404 Error Page** (`/404.html`) | 1 | 1 | 0 | 0 | **noindex, follow** (correct per spec) ✅ |
| **Daily QOTD Pages** (`/quote-of-the-day/YYYY-MM-DD.html`) | 214 | 184 | 30 | 0 | **30 active rolling days indexed; 184 archive/future noindexed** ✅ |
| **Total** | **626** | **186** | **45** | **394** | **Policy fully satisfied** ✅ |

### 2. Actions taken in Phase 2

1. **Zero core content pages are noindexed**:
   - Confirmed that 0 pages across Homepage, Quotes library, Categories, Subcategories, Authors, Blog, Poster Studio, Gallery, About, Contact, Terms, and QOTD Archive Hub contain `noindex`.
   - Added explicit `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">` tags to `quotes/index.html` and `quote-of-the-day/index.html` to guarantee unambiguous crawler directives.

2. **Daily QOTD rolling 30-day index policy**:
   - The 214 daily pages in `quote-of-the-day/` span June 1, 2026 to December 31, 2026.
   - Per spec Section 4.7, daily quote pages lack in-depth original commentary (meaning/analysis); indexing all 214 creates thin content risks.
   - Updated `scripts/optimize_sitemap_and_qotd.py` to maintain a rolling window of the 30 active daily quote pages up to today (2026-09-17 through 2026-10-16).
   - Marked all older archive dates (before Sep 17) and unreleased future dates (after Oct 16) with `<meta name="robots" content="noindex, follow">`.
   - Regenerated `sitemap.xml` with 440 high-value, canonical, indexable URLs with `<lastmod>2026-10-16</lastmod>`.

3. **Dynamic parameter noindex enforcement**:
   - Added `enforceParameterNoindex()` in `src/js/app.js` to dynamically inject `<meta name="robots" content="noindex, follow">` whenever query parameters (`window.location.search`) are present on filter/search states, directly satisfying P0-2 and complementing `robots.txt` Disallow rules (`Disallow: /*?`, `Disallow: /search`).

### 3. Post-Phase-2 lint summary (626 pages scanned)

| Issue | Baseline | Phase 1 | Phase 2 | Status |
|---|---|---|---|---|
| noindex pages | 185 | 186 | 186 | Exactly 184 QOTD archive/future + 1 404 + 1 redirect stub (100% compliant with policy) |
| img w/h missing | 625 | 625 | 625 | Phase 4 |
| h2 missing | 611 | 612 | 612 | Phase 3 |
| meta desc >155 | 499 | 499 | 499 | Phase 3 |
| title >60 | 240 | 240 | 240 | Phase 3 |
| h1 duplicate | 214 | 214 | 214 | Phase 3 |
| words <200 | 58 | 59 | 59 | Phase 3 |
| title <30 | 14 | 15 | 15 | Phase 3 |

### Ambiguity logged (per spec rule 5)

> **Q (P0-2):** The spec references "10 URLs blocked by robots.txt" and "3 internal 4xx" from the Screaming Frog crawl, but the export contains only counts, not URL lists. The new `/*?` Disallow rule blocks all parameterised URLs — that is likely the source of the 10 blocked URLs, not real content pages. The 3 broken 4xx URLs cannot be identified without a URL-level crawl export. **Resolution:** Obtain the full URL-level export from Screaming Frog or run a licensed crawl in Phase 7.

---

## Phases 3–7 — Planned

| Phase | Key work | Spec section |
|---|---|---|
| 3 | Title, meta, H1, H2 templates for all page types | P1-1 → P1-4, Section 4 |
| 4 | Image compression, WebP, srcset, width/height | P1-6 |
| 5 | Structured data, author consolidation + 301s | Section 5, 4.4 |
| 6 | Sitemap index, security headers, 404 page, QOTD date bug | Section 6 |
| 7 | Full re-crawl, PageSpeed, Mobile reports | Section 8 |

---

## KPIs — Baseline (record before traffic analysis)

Run Search Console → Performance → record on 2026-10-16:
- Total indexed pages (Pages report)
- Total impressions, non-brand queries only
- Clicks from `/blog/*` pages
- Average CTR on homepage
- Core Web Vitals (mobile) — run PageSpeed Insights on `/`, `/quotes.html`, `/poster.html`
