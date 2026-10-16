# SEO_AUDIT_AND_FIX_SPEC.md — quotebook.me

**Audience:** AI coding agent (Antigravity) working in the Quotebook web repo.
**Source data:** Screaming Frog crawl of `https://quotebook.me/`, 2026-10-16 (`crawl_overview.csv`, `issues_overview_report.csv`).
**Goal:** more non-brand Google impressions, clicks and indexed pages. Success is measured in Search Console, not in this crawl.

---

## 0. Ground rules for the agent

1. **Discover first, edit second.** Find how pages are produced (static generator script, templates, or hand-written HTML) before changing anything. Make every fix in the template or generator, never page by page.
2. **Do not change quote text, author names or quote IDs.** This spec only touches `<head>`, headings, links, structured data, images, server config and sitemaps.
3. **Never change a live URL without a 301 from the old one.**
4. **One phase per session.** After each phase, run `seo_lint.py` (Section 9) and paste the summary into `SEO_PROGRESS.md`.
5. If a task is ambiguous, write the question in `SEO_PROGRESS.md` and continue with the next task. Do not guess.
6. **Hosting is unknown.** Redirect and header syntax below is given for Netlify (`_redirects`, `_headers`). Adapt it to the real host after checking.

---

## 1. Crawl snapshot (facts from the CSVs)

| Metric | Value | Reading |
|---|---|---|
| URLs encountered / crawled | 500 / 490 | **The crawl stopped at exactly 500 URLs, which is the free-version cap. The real site is larger (QOTD pages, authors, categories). Treat all counts as a sample.** |
| Internal indexable / non-indexable | 291 / 203 | 41% of internal URLs are not indexable |
| Non-indexable breakdown | 184 noindex, 10 robots-blocked, 6 canonicalised, 3 4xx | See P0 |
| Response codes | 97.4% 2xx, 0 redirects, 0 5xx | Healthy |
| HTTPS | 100%, no mixed content | Good |
| Response time | all pages ≤ 1 s | Good |
| Titles | 0 missing, 0 duplicate, **47 over 60 chars, 42 over pixel limit, 9 under 30** | Fix |
| Meta descriptions | 0 missing, **185 over 155 chars (41%)** | Fix |
| H1 | **30 duplicates**, 4 over 70 chars | Fix |
| H2 | **249 pages missing H2 (55%)** | Fix |
| Content | **28 pages under 200 words**, 6 hard to read | Fix |
| Images | 25 total, **21 over 100 kB (84%)**, 3 missing width/height | Fix |
| Canonicals | 100% present, 444 self-referencing, 6 point elsewhere | Review |
| Click depth | 437 of 450 pages at depth 2 | Flat and good |
| Security headers | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy missing on 97% | Low SEO impact |
| Structured data, PageSpeed, Mobile, Accessibility | Sections present but **empty in the export** | Not assessed. Run them (Phase 6). |

**Most telling internal-link numbers** (inlinks across 450 HTML pages):

| URL | Inlinks |
|---|---|
| `/quotes.html` | 450 |
| `/index.html` | **441** |
| `/poster.html` | 229 |
| `/quote-of-the-day/index.html` | 217 |
| `/index` | **156** |
| `/` | **11** |

The homepage is linked in three forms (`/`, `/index.html`, `/index`), and the canonical one gets the fewest links. `/blog/` is not in the top 20, so the blog is not linked from the global nav or footer.

---

## 2. Prioritised findings and tasks

### P0 — fix first (indexing and duplication)

**P0-1. Triple homepage URL.**
- *Evidence:* `/index.html` has 441 inlinks and `/index` has 156. `/` has 11.
- *Task:*
  - Change every internal link to the clean form: `/`, `/authors/`, `/quotes/`, `/blog/`, `/quote-of-the-day/`, `/gallery/`.
  - Add 301s: `/index.html` → `/`, `/index` → `/`, and `/<dir>/index.html` → `/<dir>/`.
  - Keep `<link rel="canonical">` as the clean form.
- *Accept:* a crawl shows 0 internal links ending in `index.html` or `/index`. `curl -I https://quotebook.me/index.html` returns 301 to `/`.

**P0-2. 184 noindex URLs (38% of 481 pages that return 2xx).**
- *Evidence:* The overview does not say which URLs. Only 45 pages carry an explicit `index` directive.
- *Task:*
  1. Run `grep -rn "noindex" <repo> --include=*.html --include=*.js --include=*.py --include=*.toml --include=_headers` and find where it is emitted.
  2. Produce a table of noindex URLs grouped by page type in `SEO_PROGRESS.md`.
  3. Apply this policy:

| Page type | Policy |
|---|---|
| Homepage, `/quotes.html`, `/quotes/`, categories, subcategories, `/authors/` and main author pages, `/blog/*`, `/poster.html`, `/gallery/`, about, contact, terms, privacy | **index** |
| Quote-of-the-Day archive hub | **index** |
| Daily QOTD pages | index **only** if the quote is notable and the page has 150+ words of original context (Section 4.7). Otherwise `noindex, follow`. |
| Internal search results, filtered/sorted views, bookmarks, Zen Mode state, any `?param=` URL | **noindex, follow** |
| Duplicate author pages split by book title (Kintz, Richards, Maraboli) | 301 to the main author page (Section 4.4) |

- *Accept:* no page in the "index" rows is noindexed. Noindex remains only on rows that say so.

**P0-3. 10 URLs blocked by robots.txt and 3 internal 4xx.**
- *Task:*
  - Open `robots.txt`. List which of the 10 blocked URLs are real content. Unblock content, CSS and JS. Keep blocking only search or filter paths.
  - Find the 3 broken URLs and the pages linking to them. Fix the links, or 301 if the URL used to exist.
  - Required `robots.txt` baseline:
```
User-agent: *
Allow: /
Disallow: /search
Disallow: /*?
Sitemap: https://quotebook.me/sitemap.xml
```
  - Adjust the `Disallow` lines to the real paths found.
- *Accept:* 0 blocked content URLs, 0 internal 4xx.

### P1 — on-page templates (biggest ranking and CTR lift)

**P1-1. Titles.** 47 over 60 chars and 9 under 30. Use the formulas in Section 4. Hard limits: **30–60 characters**, keyword first, brand last (`| Quotebook`), brand dropped if it pushes past 60.
**P1-2. Meta descriptions.** 185 over 155. Hard limit: **110–155 characters**, one benefit plus one action, no quotes or duplicated text.
**P1-3. H1.** 30 duplicates. One unique H1 per page, ≤ 70 characters, matching the title intent but not identical to it.
**P1-4. H2.** 249 pages have none. Every template needs at least 2 H2s (Section 4 gives outlines).
**P1-5. Thin pages (28 under 200 words).** Add a 60–120 word intro plus 3–5 FAQ lines per category, author and blog hub page. Do **not** pad. If a page cannot reach about 200 useful words, set `noindex, follow` or merge it into a parent.
**P1-6. Images.**
- 21 of 25 images are over 100 kB. Targets: logo/icons ≤ 10 kB, gallery thumbnails ≤ 60 kB, hero/LCP image ≤ 150 kB.
- Convert to WebP (AVIF optional) and generate `srcset` at 400/800/1200 px.
- Add `width` and `height` to every `<img>` (fixes the 3 CLS risks).
- `loading="lazy"` on everything below the fold. The LCP image gets `fetchpriority="high"` and no lazy-loading.
- Rename poster files to descriptive slugs, for example `albert-einstein-quote-poster.webp`.

### P2 — structure and signals

**P2-1. Blog not linked sitewide.** Add **Blog** to the main nav and footer on every template (the homepage currently lacks it). Add a "Latest from the blog" block (3 posts) to the homepage and to every category page.
**P2-2. Canonicalised pages (6).** Export them. Confirm each canonical target is the right page and is itself indexable and 200. Remove internal links to the non-canonical versions.
**P2-3. Homepage and category anchor mismatches.** On the homepage, "Motivation" and "Art & Creativity" both link to `inspirational-general.html`, and "Wisdom" links into a `stoic-philosophy` folder. Give each card its own matching destination, or rename the card to match the page it opens.
**P2-4. Structured data.** Nothing was reported. Add the JSON-LD in Section 5.
**P2-5. Security headers.** Low ranking impact but easy. Netlify `_headers`:
```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
```
Test Content-Security-Policy in report-only mode first. The site loads Pixabay images and possibly fonts and analytics, and a strict CSP can break them.

### P3 — housekeeping
- Meta keywords are missing on 249 pages. **Ignore.** Google does not use them.
- 3 URLs over 115 characters (mostly long author slugs). Shorten when consolidating authors (Section 4.4).
- Readability: 6 pages are "difficult". Shorten sentences in intros only.
- Add `lang="en"` and `<meta name="viewport">` to every template (check).

---

## 3. Keyword and intent map

Validate volumes in Search Console and Google Trends before committing. These are intent clusters, not measured numbers.

| Cluster | Example targets | Page type | Competition |
|---|---|---|---|
| Captions and status (India-heavy) | instagram captions for selfie, whatsapp status for life, attitude status | Blog posts | Medium. Best near-term wins. |
| Festival and seasonal | dussehra wishes quotes, diwali captions, new year captions 2027 | Blog posts, published 2–3 weeks early | Medium, spikes |
| Author quotes | abdul kalam quotes, rumi quotes, marcus aurelius quotes | Author pages | High for global names, medium for niche or Indian authors |
| Topic quotes | long distance love quotes, quotes about patience | Category and subcategory pages | Medium |
| Tool | free quote poster maker, quote image generator | Poster Studio | Medium. Unique product advantage. |
| Daily | quote of the day | QOTD hub | High. Do not expect fast wins. |

Brand note: "Quotebook" is shared by several unrelated products, so ranking for the brand word alone will not drive traffic. Every page must target a non-brand phrase.

---

## 4. On-page specification by page type

Rules for every template: unique title, meta description, H1; exactly one H1; clean canonical; breadcrumb; at least 2 H2; at least 3 contextual internal links; Open Graph and Twitter tags filled from the same fields. Counts such as `{N}` must come from the data and never be hard-coded.

### 4.1 Homepage `/`
- **Title (50):** `Quotebook: Famous Quotes & Free Quote Poster Maker`
- **Meta (143):** `Browse famous quotes by author and topic, listen to them read aloud, and turn any quote into a free HD poster with the Quotebook Poster Studio.`
- **H1:** `Famous Quotes by Topic and Author, Made Into Posters`
- **H2 outline:** Today's quotes · Popular categories · Make a quote poster · Zen Mode · Latest from the blog · FAQ
- **Add:** 150–250 words of crawlable intro text and a 4-question FAQ (What is Quotebook? Is it free? Can I download posters? Where do quotes come from?).
- **Claim check:** "1 Million+ quotes" must match what is browsable. The authors directory lists 103 authors and category counts are in the thousands. Use `{N}+` from the dataset or soften to "Thousands of curated quotes" until the number can be shown on the site.
- **Schema:** `WebSite`, `Organization`.

### 4.2 Quotes library `/quotes.html` (consider moving to `/quotes/` with a 301)
- **Title (50):** `Explore Quotes by Topic, Author & Mood | Quotebook`
- **Meta:** `Search and browse quotes by author, topic and mood. Copy, listen to or turn any quote into a poster. Free, no sign-up.`
- **H1:** `Explore Quotes`
- **H2s:** Browse by topic · Browse by author · Popular quotes

### 4.3 Category and subcategory pages
- **Category title (60):** `{Topic} Quotes: {N}+ {Adjective} Sayings | Quotebook` → `Love Quotes: 2,100+ Romantic & Heartfelt Sayings | Quotebook`
- **Subcategory title:** `{Subtopic} {Topic} Quotes: {N} Sayings | Quotebook` → `Long Distance Love Quotes: 48 Sayings | Quotebook`
- **Meta (137):** `Browse {N}+ {topic} quotes, from {example1} to {example2}. Copy, listen, or make a poster in one click.`
- **H1:** `{Topic} Quotes`
- **H2s:** Most popular {topic} quotes · {Topic} quotes by theme (links to subcategories) · Authors on {topic} · FAQ
- **Minimum:** 150 words of intro and FAQ text. The quote list is paginated, and later pages get `noindex, follow`, or a self-canonical if they carry unique quotes.
- **Schema:** `CollectionPage`, `BreadcrumbList`, `ItemList` (first 10 quotes).

### 4.4 Author pages and directory
- **Directory title (53):** `Famous Quote Authors A–Z: 100+ Thinkers | Quotebook`
- **Author title (47):** `{Author} Quotes: {N} Best Sayings | Quotebook` → `Abdul Kalam Quotes: 90 Best Sayings | Quotebook`
- **Author meta (128):** `Read {N} of {Author}'s best quotes on {theme1}, {theme2} and {theme3}. Copy, listen, or turn any quote into a shareable poster.`
- **H1:** `{Author} Quotes`
- **H2s:** Top 10 {Author} quotes · {Author} quotes on {theme} (2–3 theme blocks) · About {Author} (60–100 words) · FAQ
- **Consolidation:** merge pages split by book title (Jarod Kintz ×9, Stephen Richards ×5, Steve Maraboli ×3, Jennifer Elisabeth, John Green, Aberjhani and others). Keep one page per person, slug `/authors/jarod-kintz.html`. Show the book as a filter or label on each quote. 301 all old slugs.
- **Slug rule:** author name only, lowercase, hyphens, ≤ 40 chars.
- **Add missing high-demand authors** already featured on the homepage: Socrates, Marcus Aurelius, Nelson Mandela, Eleanor Roosevelt, Viktor Frankl, Anne Frank, Leonardo da Vinci. Consider Swami Vivekananda, Chanakya and Dalai Lama for the India audience, if the dataset has them.
- **Schema:** `ProfilePage` or `CollectionPage` with `mainEntity: Person`, plus `BreadcrumbList`.

### 4.5 Quote of the Day archive `/quote-of-the-day/`
- **Title (55):** `Quote of the Day: Daily Inspiration Archive | Quotebook`
- **H1:** `Quote of the Day Archive`
- **H2s:** Today's quote · This week · Browse by month
- **Bug to check:** the archive's "Today's Featured Quote" showed **August 02, 2026** when fetched on Oct 16, 2026. Fix the date logic or the rebuild schedule. Compare against the user's timezone, or make the page static per date with a nightly rebuild.
- Link only to daily pages that are indexable.

### 4.6 Poster Studio `/poster.html` (the strongest product page)
- **Title (51):** `Free Quote Poster Maker: Create Quote Images Online`
- **Meta (141):** `Turn any quote into an HD poster in seconds. Pick a photo, font, tint and size (1:1, 4:5, 16:9), then download a PNG free. No sign-up needed.`
- **H1:** `Free Quote Poster Maker`
- **H2s:** How to make a quote poster (3 steps) · Poster sizes for Instagram, WhatsApp and LinkedIn · Features · FAQ
- **Minimum:** 400 words of static text, outside the JS app, so it is in the initial HTML.
- **Product suggestion:** add a 9:16 size for Stories and WhatsApp status.
- **Schema:** `SoftwareApplication` (WebApplication, free) and `HowTo`.

### 4.7 Quote of the Day daily pages `/quote-of-the-day/YYYY-MM-DD.html`
- **Title (≤ 57):** `Quote of the Day, Oct 16, 2026: {Author} | Quotebook`
- **Meta:** `Today's quote from {Author}: "{first 60 chars of quote}…" Read the full quote, its meaning, and make a poster.`
- **H1:** `Quote of the Day: {Author}`
- **H2s:** The quote · What it means (2–3 sentences) · More from {Author} · Quotes on {category}
- **Index rule:** index only when the author is recognised and the page has 150+ words. Otherwise `noindex, follow`.
- **Content filter before publishing a date.** The archive currently includes crude, violent or self-harm-adjacent lines and several wrong category labels (for example a bribery quote under "Faith & Spirituality" and the Plath line under "Death & Mortality"). Add a blocklist or manual-review flag and a minimum-quality check (full text ≤ 300 chars, English, known author).

### 4.8 Gallery `/gallery/` and poster pages
- **Gallery title (50):** `Quote Poster Gallery: Free Typography Quote Images`
- Create one page per poster: `/gallery/albert-einstein-quote-poster.html`. Use H1 `{Author} Quote Poster`, the image, the quote text, a "Make your own" CTA, and links to the author and category pages.
- Alt text pattern: `{Author} quote poster: "{short quote}"`.

### 4.9 Blog
- **Index title (59):** `Instagram Captions & WhatsApp Status Ideas | Quotebook Blog`
- **Post title (≤ 60, brand optional):** `{N}+ {Topic} for {Platform} ({Year})` → `150+ Attitude Status & Captions for WhatsApp (2026)` (51)
- **Post meta (≈ 138):** `Looking for {intent}? Copy {N}+ short, {adj} captions, then turn any into a poster.`
- **Post structure:** H1 · 60–80 word intro with the keyword in the first sentence · 4–6 H2 groups by sub-intent, each with 10–25 items · "Make this a poster" link on each group · FAQ · 3–5 internal links (category, author, Poster Studio) · "Updated: {date}" line.
- **Schema:** `BlogPosting` (author, datePublished, dateModified, image) and `BreadcrumbList`.
- **Calendar:** publish seasonal posts 2–3 weeks early. Dussehra (about Oct 20) is days away. Diwali is about Nov 8, so publish by Oct 25. Verify exact dates.

### 4.10 About, Contact, Terms, Privacy
- **About (51):** `About Quotebook: Free Quote Library & Poster Studio`
- **Contact (52):** `Contact Quotebook | Feedback, Corrections & Business`
- Add a **Privacy Policy** page if missing (analytics, ads and the Pixabay API all call for one). Add an "Editorial standards and sources" section to About: where quotes come from, how misattributions are corrected.

### 4.11 Zen Mode
- **Title (54):** `Zen Mode: Calm Full-Screen Quote Slideshow | Quotebook`
- Needs a crawlable landing page with 150+ words and a link into the app. The slideshow itself is not indexable content.

---

## 5. Structured data templates (JSON-LD)

Render these from template variables. Validate each with Google's Rich Results Test and the Schema Markup Validator. Quotation markup has no dedicated Google rich result, so use it for clarity only.

**Sitewide (`<head>` of homepage):**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "WebSite", "@id": "https://quotebook.me/#website", "url": "https://quotebook.me/", "name": "Quotebook"},
    {"@type": "Organization", "@id": "https://quotebook.me/#org", "name": "Quotebook", "url": "https://quotebook.me/",
     "logo": "https://quotebook.me/data/img/logo.svg", "sameAs": ["https://twitter.com/quotebookme"]}
  ]
}
```
Add a `potentialAction` `SearchAction` to `WebSite` **only if** the site has a working URL-based search, for example `/quotes.html?q={search_term_string}`.

**Breadcrumb (all inner pages):**
```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Home","item":"https://quotebook.me/"},
 {"@type":"ListItem","position":2,"name":"Authors","item":"https://quotebook.me/authors/"},
 {"@type":"ListItem","position":3,"name":"Abdul Kalam"}]}
```

**Blog post:**
```json
{"@context":"https://schema.org","@type":"BlogPosting","headline":"{title ≤110 chars}",
 "image":"{og image url}","datePublished":"{ISO}","dateModified":"{ISO}",
 "author":{"@type":"Organization","name":"Quotebook"},
 "publisher":{"@id":"https://quotebook.me/#org"},"mainEntityOfPage":"{canonical}"}
```

**Poster Studio:**
```json
{"@context":"https://schema.org","@type":"WebApplication","name":"Quotebook Poster Studio",
 "applicationCategory":"DesignApplication","operatingSystem":"Any (web browser)",
 "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"url":"https://quotebook.me/poster.html"}
```

**FAQ:** `FAQPage` markup no longer produces FAQ rich results for most sites. Keep the visible FAQ text for users and long-tail queries. Treat the schema as optional.

---

## 6. Technical SEO

1. **Sitemaps.** Generate `sitemap.xml` as a sitemap index with child files: `sitemap-pages.xml`, `sitemap-categories.xml`, `sitemap-authors.xml`, `sitemap-blog.xml`, `sitemap-qotd.xml`, `sitemap-gallery.xml` (each under 50,000 URLs). Include only canonical, 200, indexable URLs. Set `<lastmod>` only to a real content-change date. Submit in Search Console. Reference it in `robots.txt`.
2. **JS rendering check.** Run `curl -s https://quotebook.me/quotes/love/love-general.html | grep -c "<blockquote"`. If quotes are injected only by JS, Google must render them. Prefer quotes in the initial HTML, at least the first 20 per page.
3. **Pagination.** Use crawlable `<a href>` links. Do not rely on infinite scroll alone. Do not use `rel=prev/next` (Google ignores it).
4. **404 page.** Add a custom 404 that links to categories, authors and the blog. Make sure it returns HTTP 404.
5. **Trailing slash and case.** Pick one convention per section and 301 the other.
6. **hreflang.** Not needed while the site is English only. If Hindi or Hinglish pages are added, use `hi` or `hi-Latn` with reciprocal tags.
7. **Core Web Vitals plan.**
   - Fix image sizing (P1-6), lazy-load below the fold, and `font-display: swap`.
   - Defer non-critical JS.
   - Preload the LCP image.
   - Make sure the home carousel is not duplicated in the DOM. The home page currently renders each quote strip twice for the loop animation, so duplicate the nodes with JS and mark them `aria-hidden="true"`.
   - Targets (mobile, field data when available): LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.
8. **Third-party image terms.** Pixabay hotlinking and attribution rules apply. Check the current terms and keep attribution visible on poster pages and downloads if required.

---

## 7. Internal linking rules

- Home → top 6 categories, top 8 authors, blog, Poster Studio, QOTD hub.
- Category → subcategories, top authors for the topic, 2 relevant blog posts, Poster Studio.
- Author → their top categories, related authors, Poster Studio, QOTD hub.
- Blog post → 1 category, 1–2 authors, Poster Studio, 2 related posts.
- Every quote card keeps the Copy / Listen / Poster actions, and the author name is a link to the author page.
- Anchor text must describe the destination ("Love quotes", not "click here"). Fix the one internal link with no anchor text.

---

## 8. Implementation roadmap

| Phase | Work | Done when |
|---|---|---|
| 1 (day 1) | P0-1 URL canonicalisation and redirects, P0-3 robots and 4xx, add Blog to nav and footer | Redirect tests pass, 0 internal 4xx |
| 2 (day 2) | P0-2 noindex audit and policy | Policy table applied, `SEO_PROGRESS.md` lists noindex by type |
| 3 (days 3–4) | Title, meta, H1 and H2 templates for every page type (Section 4), `seo_lint.py` added | Lint shows 0 title>60, 0 desc>155, 0 duplicate H1, 0 h2 missing on indexable pages |
| 4 (days 5–6) | Images: compress, WebP, `srcset`, width and height, renaming | 0 images over 150 kB, 0 missing dimensions |
| 5 (days 7–8) | Structured data, author consolidation with 301s, new author pages | Rich Results Test passes, old slugs redirect |
| 6 (day 9) | Sitemap index, security headers, 404 page, QOTD date bug and content filter | Sitemaps submitted, headers present in `curl -I` |
| 7 (day 10) | Re-crawl with Screaming Frog (licensed, to pass the 500-URL cap), run PageSpeed and Mobile reports, fill the empty sections | New crawl compared with Section 1 |

**Verification commands**
```
curl -I https://quotebook.me/index.html          # expect 301 -> /
curl -I https://quotebook.me/does-not-exist       # expect 404
curl -s https://quotebook.me/robots.txt
curl -s https://quotebook.me/sitemap.xml | head
python seo_lint.py ./dist --csv seo_report.csv    # path = built site folder
```

---

## 9. `seo_lint.py` (add to the repo root; stdlib only)

Run on the built HTML folder. It flags the same issues as the crawl.

```python
#!/usr/bin/env python3
"""Static SEO linter for the built site. Usage: python seo_lint.py <site_root> [--csv out.csv]
Stdlib only. Mirrors the checks flagged in the Screaming Frog crawl."""
import sys, re, csv, collections
from pathlib import Path
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.title=""; s.in_title=False; s.meta={}; s.h1=[]; s.h2=0
        s.cur=None; s.canon=""; s.imgs_total=0; s.imgs_nosize=0; s.imgs_noalt=0
        s.words=0; s.skip=0; s.jsonld=0; s.in_ld=False
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=="title": s.in_title=True
        elif t=="meta" and a.get("name"): s.meta[a["name"].lower()]=a.get("content","")
        elif t=="link" and a.get("rel")=="canonical": s.canon=a.get("href","")
        elif t in("h1","h2"):
            s.cur=t
            if t=="h2": s.h2+=1
            else: s.h1.append("")
        elif t=="img":
            s.imgs_total+=1
            if not (a.get("width") and a.get("height")): s.imgs_nosize+=1
            if not a.get("alt"): s.imgs_noalt+=1
        elif t in("script","style","noscript"):
            s.skip+=1; s.in_ld = (t=="script" and a.get("type")=="application/ld+json")
            if s.in_ld: s.jsonld+=1
    def handle_endtag(s,t):
        if t=="title": s.in_title=False
        elif t in("h1","h2"): s.cur=None
        elif t in("script","style","noscript"): s.skip=max(0,s.skip-1); s.in_ld=False
    def handle_data(s,d):
        if s.in_title: s.title+=d
        if s.cur=="h1" and s.h1: s.h1[-1]+=d
        if not s.skip: s.words+=len(d.split())

def main(root, out=None):
    rows=[]; titles=collections.Counter(); h1s=collections.Counter()
    for f in sorted(Path(root).rglob("*.html")):
        p=P(); p.feed(f.read_text(encoding="utf-8",errors="ignore"))
        t=p.title.strip(); d=p.meta.get("description",""); h1=(p.h1[0].strip() if p.h1 else "")
        titles[t]+=1; h1s[h1]+=1
        rows.append(dict(file=str(f.relative_to(root)),title=t,title_len=len(t),desc_len=len(d),
            h1_count=len(p.h1),h1=h1,h1_len=len(h1),h2_count=p.h2,words=p.words,canonical=p.canon,
            noindex="noindex" in p.meta.get("robots","").lower(),jsonld=p.jsonld,
            img_nosize=p.imgs_nosize,img_noalt=p.imgs_noalt))
    for r in rows:
        iss=[]
        if not r["title"]: iss.append("title missing")
        if r["title_len"]>60: iss.append("title>60")
        if 0<r["title_len"]<30: iss.append("title<30")
        if titles[r["title"]]>1: iss.append("title duplicate")
        if r["desc_len"]==0: iss.append("meta desc missing")
        if r["desc_len"]>155: iss.append("meta desc>155")
        if 0<r["desc_len"]<70: iss.append("meta desc<70")
        if r["h1_count"]!=1: iss.append(f"h1 count={r['h1_count']}")
        if r["h1_len"]>70: iss.append("h1>70")
        if h1s[r["h1"]]>1 and r["h1"]: iss.append("h1 duplicate")
        if r["h2_count"]==0: iss.append("h2 missing")
        if r["words"]<200: iss.append("words<200")
        if not r["canonical"]: iss.append("canonical missing")
        if r["img_nosize"]: iss.append("img w/h missing")
        if r["img_noalt"]: iss.append("img alt missing")
        if not r["jsonld"]: iss.append("no json-ld")
        r["issues"]="; ".join(iss)
    c=collections.Counter(i for r in rows for i in r["issues"].split("; ") if i)
    print(f"{len(rows)} pages scanned"); [print(f"{n:5d}  {k}") for k,n in c.most_common()]
    print(f"{sum(r['noindex'] for r in rows):5d}  noindex pages")
    if out:
        with open(out,"w",newline="",encoding="utf-8") as fh:
            w=csv.DictWriter(fh,fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
if __name__=="__main__":
    a=sys.argv; main(a[1], a[a.index("--csv")+1] if "--csv" in a else None)
```

---

## 10. KPIs (check weekly in Search Console)

| KPI | Baseline | Target at 90 days |
|---|---|---|
| Indexed pages (Pages report) | record on day 1 | grows monthly, with "Crawled, not indexed" shrinking |
| Impressions, non-brand queries | record on day 1 | +100% |
| Clicks from blog pages | record on day 1 | top 3 posts each over 100 clicks/month |
| Average CTR on pages with fixed titles | record on day 1 | +1 point |
| Core Web Vitals (mobile) | run on day 1 | all URL groups "Good" |
| Crawl issues (re-crawl) | Section 1 numbers | title>60 → 0, desc>155 → 0, noindex only where intended |

**Caveats.** Rankings depend on competition, domain authority and content quality. Technical fixes remove blockers but do not guarantee traffic. The strongest lever remains publishing useful, well-linked pages for non-brand searches (blog posts, author hubs, Poster Studio).

---

## 11. Appendix: raw issue counts from `issues_overview_report.csv`

| Issue | Priority | URLs | % |
|---|---|---|---|
| Directives: Noindex | High | 184 | 38.25 |
| Canonicals: Canonicalised | High | 6 | 1.33 |
| Response Codes: Internal Client Error (4xx) | High | 3 | 0.60 |
| Response Codes: Internal Blocked by Robots.txt | High | 10 | 2.00 |
| Page Titles: Over 60 Characters | Medium | 47 | 10.44 |
| Page Titles: Over 561 Pixels | Medium | 42 | 9.33 |
| Page Titles: Below 30 Characters | Medium | 9 | 2.00 |
| Content: Low Content Pages | Medium | 28 | 6.22 |
| Images: Over 100 kB | Medium | 21 | 84.00 |
| Meta Description: Over 155 Characters / 985 px | Low | 185 | 41.11 |
| H2: Missing | Low | 249 | 55.33 |
| H1: Duplicate | Low | 30 | 6.67 |
| H1: Over 70 Characters | Low | 4 | 0.89 |
| H2: Duplicate / Multiple / Non-Sequential | Low | 3 / 5 / 1 | 0.67 / 1.11 / 0.22 |
| URL: Over 115 Characters | Low | 3 | 0.61 |
| Images: Missing Size Attributes | Low | 3 | 12.00 |
| Content: Readability Difficult / Very Difficult | Low | 5 / 1 | 1.11 / 0.22 |
| Links: Internal Outlinks With No Anchor Text | Low | 1 | 0.22 |
| Security headers missing (5 types) | Low | 481 each | 97.37 |

*Limits of this report:* the CSVs are overview exports, so they contain **counts but not URL lists**. Section 2 therefore tells the agent to regenerate URL-level lists from the repo and from `seo_lint.py`. The crawl was capped at 500 URLs, and the structured-data, PageSpeed, mobile and accessibility sections were empty. No Search Console or analytics data was provided.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-16T01:11:37+05:30.

The user's current state is as follows:
Active Document: c:\Users\bitbu\Downloads\crawl_overview.csv (LANGUAGE_UNSPECIFIED)
Cursor is on line: 1
Other open documents:
- c:\Users\bitbu\Downloads\crawl_overview.csv (LANGUAGE_UNSPECIFIED)
- d:\FlutterProjects\quotebook\pubspec.yaml (LANGUAGE_YAML)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Claude Sonnet 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>