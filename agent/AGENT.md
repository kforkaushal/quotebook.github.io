# AGENT.md — Quotebook Project Context

This file is the persistent source of truth for any AI coding agent (Antigravity, Claude Code, Cursor, etc.) working on this repository. Read this in full before making changes. This project has already had context-loss problems with weaker agents — this file exists specifically to prevent that.

---

## 1. What this project is

Quotebook is a **static HTML/CSS/vanilla-JS** quotes website — no framework, no build tool, no `package.json`. It has three layers:

1. **App shell** — `index.html` (landing), `quotes.html` (interactive library + Poster Studio modal), `poster.html` (full-page poster editor).
2. **Static SEO pages** — `quotes/*.html` (category and intent pages, e.g. `birthday-quotes-for-friends.html`) and `authors/*.html` (per-author pages). These are **generated output**, not hand-written — see §4.
3. **Data** — `data/quotes_8000_plus.json` (~55MB, the working dataset), `data/quotes_enriched.json` (~255MB, tagged/enriched superset), `data/featured_quotes.json` (~900KB, homepage featured set), `data/categories/*.json` (per-category split files, currently only 14 of 57 categories present — incomplete).

Companion planning docs already in this repo / provided separately: `PRD.md` (design/animation/mobile/base-SEO), `PRD-programmatic-seo.md` (long-tail content network strategy), `PRD-color-system.md` (color palette — **already implemented**, see §6).

---

## 2. Tech stack constraints — do not change without explicit approval

- **No framework migration.** Stay vanilla HTML/CSS/JS. Do not introduce React/Vue/Next.js/a bundler unless the user explicitly asks for it.
- **No `package.json` exists.** The two Node scripts in `scripts/` are run directly with `node scripts/<file>.js` — there is no `npm install` step and no declared dependencies (they only use Node's built-in `fs`/`path`). If you add a dependency, you must also add a `package.json` and tell the user to run `npm install`.
- **`.ps1` twins exist for both scripts** (`generate-static-pages.ps1`, `tag-database-rules.ps1`, `generate-seo-network.ps1`) — these are PowerShell versions for Windows, since Kaushal develops on Windows. **If you change the `.js` version of a script's logic, you must also update the matching `.ps1` file**, or explicitly flag that you didn't and why.

---

## 3. Directory map

```
Quotebook/
├── index.html, quotes.html, poster.html      # App shell (hand-maintained)
├── quotes/*.html                              # GENERATED — category + intent pages
├── authors/*.html                             # GENERATED — top ~100 author pages
├── data/
│   ├── quotes_8000_plus.json                  # Working dataset, fetched client-side by quotes.html (55MB — see Known Issue #1)
│   ├── quotes_enriched.json                   # Tagged superset from tag-database-rules.js (255MB, build-time only, NOT fetched client-side — keep it that way)
│   ├── featured_quotes.json                   # Small homepage subset
│   ├── categories/*.json                      # Per-category split — only 14/57 categories currently split out here; source of truth for categories is still the monolithic quotes_8000_plus.json
│   └── img/                                   # Logo, favicons
├── src/css/style.css                          # Single stylesheet, ~96K — CSS custom properties at top of file are the source of truth for all color (see §6)
├── src/js/app.js                              # Main app logic — quote loading, search/filter, bookmarks, TTS, Pixabay integration, Zen Mode
├── src/js/poster.js                           # PosterStudio class — canvas rendering for poster export
├── scripts/
│   ├── tag-database-rules.js (+.ps1)          # Reads quotes_8000_plus.json → writes quotes_enriched.json with regex-based metadata tagging (see Known Issue #2 — this is the most important one to understand before touching content generation)
│   ├── generate-static-pages.js (+.ps1)       # Reads quotes_8000_plus.json → writes quotes/*.html, authors/*.html, sitemap.xml (see Known Issue #3 — this script is STALE relative to actual output files)
│   └── generate-seo-network.ps1               # Windows-only, no .js equivalent exists — audit before relying on it
├── robots.txt, sitemap.xml
└── scratch/                                   # Empty — appears to be a scratch/WIP folder, safe to use for temp files but don't leave debris here long-term
```

---

## 4. The generation pipeline — read this before touching `quotes/` or `authors/`

**Critical gotcha:** the actual files in `quotes/*.html` (e.g. `birthday-wishes-for-best-friend.html`) do **not** match what `scripts/generate-static-pages.js` currently produces. The live files have a mobile hamburger menu/drawer, favicon links, and intro-paragraph copy that the checked-in script does not generate. This means:

- **Do not blindly re-run `generate-static-pages.js` expecting it to reproduce the current site** — it will overwrite hand-edited/differently-generated pages with an older template and you will lose the mobile nav and intro paragraphs.
- Before modifying the generator, diff its output against a real file in `quotes/` first to understand what actually changed and why, or ask the user which version is authoritative.
- If you fix the generator, regenerate ALL pages in one pass and re-diff a sample against the old version so the whole `quotes/`/`authors/` output stays internally consistent — don't hand-patch one file and regenerate others from an older script version.

---

## 5. Known issues (in priority order — fix top-down)

1. **`quotes.html` fetches the full 55MB `quotes_8000_plus.json` client-side on load** (`src/js/app.js` line ~342). This is the single biggest performance/SEO problem in the codebase — it will produce terrible Core Web Vitals (LCP) especially on mobile, and actively hurts every SEO effort described in the PRDs. Needs pagination/chunking or a lightweight index + on-demand category fetch, not one monolithic file.

2. **The metadata tagging in `tag-database-rules.js` is regex-based over generic literary quote text, not a real occasion/relationship dataset** — it flags a quote as relevant to "Friend"/"Birthday" if the *word* appears anywhere in the quote text, regardless of actual relevance. Real-world result already visible in shipped output: `quotes/birthday-wishes-for-best-friend.html` serves a J.D. Salinger quote about a book, and a Joseph Addison quote about perseverance, tagged category "General" — neither is a birthday wish for a best friend. **This defeats the entire point of the programmatic-SEO plan** (a user searching "birthday wishes for best friend" and landing on unrelated literary quotes will bounce immediately, and Google will eventually classify these as low-quality/irrelevant pages). This needs either a real sourced wishes/captions/shayari dataset per format (per `PRD-programmatic-seo.md` §6.4) or the wish/occasion pages restricted to categories where the underlying quotes are genuinely on-topic.

3. **Duplicate quotes within a single generated page** — `birthday-wishes-for-best-friend.html` repeats the same quote back-to-back multiple times (verified: the Salinger quote and the Addison quote each appear twice in sequence). This is a generation/dedup bug in whatever script produced this batch of pages, separate from issue #2. Needs a dedup-by-quote-id (or normalized text) step before writing each page's quote list.

4. **Misleading page titles vs. actual content count** — `birthday-wishes-for-best-friend.html` is titled "100+ Best Friend Birthday Wishes" but the intro text says "21 birthday wishes" and the real unique count (after de-duplication) is lower still. Titles must reflect the actual, real count at generation time, not a placeholder round number.

5. **Placeholder domain `quotebook.example.com` hardcoded into every canonical URL, OG tag, and the sitemap** in `generate-static-pages.js`. This must become the real production domain before any of this is deployed, or every canonical/OG tag actively misdirects search engines and social scrapers.

6. **Pixabay API key committed in plaintext** in both `src/js/app.js` and `README.md` (`31635482-a6219e4788c28c0983dbc0cd0`). Since this is a static site with no backend, full concealment isn't possible client-side, but it should not also be published in the README/docs, and the key should be rotated if this repo is or becomes public — a scraped/abused key can exhaust the shared Pixabay quota with no warning.

7. **Repo bloat** — `.git` is currently ~911MB despite Git LFS being configured for `*.json`. `data/quotes_enriched.json` alone is 255MB and appears to be a build-time intermediate artifact (used to produce `quotes_enriched.json` from tagging, not fetched by the live site) — worth confirming it needs to be version-controlled at all vs. regenerated locally from `tag-database-rules.js` on demand and gitignored.

8. **Ambient glow-orb background not yet removed** — `.glow-orb`/`.ambient-bg-container` still present in `style.css` and referenced 4× each in `index.html`/`quotes.html`, despite this being flagged in `PRD.md` §4.2 as the primary "looks AI-generated" tell. The color palette from `PRD-color-system.md` has been implemented correctly (verified in `style.css` `:root`), but the background-decoration cleanup from the design PRD has not been done yet.

9. **No `prefers-reduced-motion` support anywhere in `style.css`** — confirmed zero occurrences. Any animation work (per `PRD.md` §5) must ship with this from the start, not retrofitted later.

10. **Five consecutive commits titled "update the menu toggle"** in git history — a sign the mobile menu was patched repeatedly rather than solved once. Worth a single deliberate pass rather than another incremental patch, since this pattern often means the underlying approach (not just the CSS) needs revisiting.

11. **`data/categories/*.json` only has 14 of the 57 real categories split out** — unclear if this is an in-progress migration or abandoned. Confirm intent before building anything new on top of this folder.

---

## 6. Design system status (for agents picking up `PRD.md` / `PRD-color-system.md`)

- ✅ **Color palette is implemented** — `style.css` `:root` already has the full `--orange-*`/`--teal-*`/`--ink-*`/`--paper-*` token system from `PRD-color-system.md`. Do not reintroduce the old `--accent-amber`/`--accent-peach`/`--accent-indigo` variables.
- ❌ **Glow-orb ambient background removal** — not done (Known Issue #8).
- ❌ **Typography reduction to two committed faces** — `Caveat` (handwritten) is still loaded as a default font option; per `PRD.md` §4.1 it should be poster-only, not a homepage default.
- ❌ **Scroll-reveal / motion system** — only one `IntersectionObserver` usage found in `app.js`; the full motion plan in `PRD.md` §5 (hover micro-interactions, hero crossfade, Zen Mode transitions, `prefers-reduced-motion` support) is not yet built.
- ⚠️ **Mobile responsive** — 15 media queries exist and the Poster Studio has specific mobile rules (`poster-studio-body`, `.full-page-editor` breakpoints), so this is partially done — needs a real device-matrix test pass per `PRD.md` §6, not an assumption that it's finished.

---

## 7. Coding conventions for this repo

- All colors must reference the existing CSS custom properties in `:root` — never hardcode a new hex color directly in a rule or inline `style=""` attribute (the generated `quotes/*.html` pages currently do use some inline styles — don't propagate that pattern further; move it into `style.css` when touching those files).
- Any new generated page (category, author, or new intent page) must include: unique title with real count, unique meta description, canonical URL (real domain, not `.example.com`), OG + Twitter tags, JSON-LD (upgrade from generic `WebPage` to `Quotation`/`CreativeWork` + `BreadcrumbList` per `PRD-programmatic-seo.md` §5.2/§7.3), and a unique, real (non-templated-feeling) intro paragraph.
- Before generating any new occasion/relationship/tone combination page, verify real matching quotes actually exist and are actually on-topic (see Known Issue #2) — do not let the page go live on a "General" fallback category standing in for the requested topic.
- When editing `app.js`, be aware it's ~68K/1700+ lines handling app state for **both** `index.html` and `quotes.html` in one file — check which page-specific code path you're in before editing (search for the relevant `id` selectors used in that page's HTML) to avoid touching logic for the wrong page.

---

## 8. Before you start any task, confirm with the user

- Which is authoritative when `quotes/*.html` output and `generate-static-pages.js` disagree (§4)?
- Whether `data/quotes_enriched.json` (255MB) should stay in version control or be gitignored and regenerated on demand (§5 issue #7).
- The real production domain to replace `quotebook.example.com` everywhere (§5 issue #5).
- Priority order among the Known Issues list (§5) — this file lists them in a suggested order, but the user may weight differently.
