# TASK — Upgrade `<head>` SEO (Meta Tags + JSON-LD) on All Main Pages

**Read `agent/AGENT.md` first.** Scope: the `<head>` section only, on 6 files —
`index.html`, `quotes.html`, `poster.html`, `about.html`, `contact.html`, `terms.html`.
No body content, no CSS, no JS logic changes anywhere.

---

## 1. What I found by auditing the real, live `<head>` sections of all 6 pages

**A real bug — `index.html`'s canonical URL is wrong:**

```html
<link rel="canonical" href="https://quotebook.me/index.html">
```

This should be the bare domain root, not `/index.html`. Checked against a real, large
competitor (BrainyQuote) for comparison: their homepage canonical is
`https://www.brainyquote.com/` — never `/index.html` or `/home.html`. Serving both `/`
and `/index.html` as if they were different canonical pages splits ranking signals
between two URLs for what search engines should treat as one page. Also update
`og:url` on `index.html` to match.

**Inconsistent meta coverage across pages:** `quotes.html` and `poster.html` already
have a complete, modern meta set — `meta name="keywords"`, `meta name="robots"`,
`meta name="author"`, `og:site_name`, `og:locale`, `og:image:width/height/alt`,
`twitter:site`. `index.html` (the homepage!), `about.html`, `contact.html`, and
`terms.html` are all missing every one of those. This task brings all 6 pages to the
same standard.

**No JSON-LD structured data exists on any of the 6 main pages.** Confirmed by grepping
all six files for `application/ld+json` — zero matches. (Your auto-generated
`quotes/*/*.html` and `authors/*.html` pages *do* have `CollectionPage` +
`BreadcrumbList` JSON-LD already — it's specifically the hand-authored main pages that
have none.) This is a real, concrete gap: structured data is what unlocks rich results
(sitelinks search box, breadcrumbs in search results, software/tool rich cards) and gives
AI crawlers/assistants a clean, unambiguous machine-readable summary of what each page is.

## 2. Fix the canonical bug — `index.html`

**Find:**

```html
<link rel="canonical" href="https://quotebook.me/index.html">
```

```html
<meta property="og:url" content="https://quotebook.me/index.html">
```

**Replace both with:**

```html
<link rel="canonical" href="https://quotebook.me/">
```

```html
<meta property="og:url" content="https://quotebook.me/">
```

## 3. Add the missing meta tags to `index.html`, `about.html`, `contact.html`, `terms.html`

Insert these into each of the four pages (adjust `content` per page — examples below use
`index.html`'s actual title/description; write natural equivalents for the other three
rather than copying index.html's verbatim):

```html
<meta name="keywords" content="famous quotes, inspirational quotes, quote generator, quote poster maker, motivational quotes, quote of the day">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="author" content="Quotebook">
```

And add these to the existing Open Graph / Twitter blocks on all four (match the
pattern already used on `quotes.html`/`poster.html`):

```html
<meta property="og:site_name" content="Quotebook">
<meta property="og:locale" content="en_US">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Quotebook — [write a real, page-specific alt description here]">
<meta name="twitter:site" content="@quotebookme">
<meta name="twitter:image:alt" content="Quotebook — [same alt text as og:image:alt above]">
```

For `about.html`, `contact.html`, and `terms.html`, write page-appropriate keywords
(don't reuse the homepage's list verbatim — e.g. `contact.html` should include something
like "contact quotebook, quotebook support" rather than "quote poster maker").

## 4. Add JSON-LD — `index.html`

Add this immediately before `</head>`. This uses `WebSite` + `Organization` — the two
schema types Google explicitly documents as appropriate for a homepage. **Do not add a
`SearchAction`/sitelinks-searchbox block** — that schema type requires a real URL pattern
that returns results for a query parameter, and `quotes.html`'s search is a client-side,
in-page filter with no such URL pattern today. Adding `SearchAction` without a matching
real endpoint would be inaccurate structured data, not merely incomplete — Google's own
guidelines call this out as something that should only be marked up if it actually works
that way.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Quotebook",
  "url": "https://quotebook.me/",
  "description": "Discover 1 Million+ curated quotes, listen with speech synthesis, and create high-resolution visual quote posters with Pixabay photography.",
  "publisher": {
    "@type": "Organization",
    "name": "Quotebook",
    "url": "https://quotebook.me/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://quotebook.me/data/img/logo.svg"
    }
  }
}
</script>
```

Note: no `sameAs` (social profile links) is included above because no social media links
currently exist anywhere in the site's footer/header (checked — there are none to link
to yet). If/when real Quotebook social accounts exist, add a `sameAs` array of their real
URLs to the `Organization` object — don't fabricate placeholder social links now.

## 5. Add JSON-LD — `quotes.html`

This page is the quote browser/library — use `CollectionPage`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Inspirational & Famous Quotes Library",
  "description": "Browse 1,000,000+ curated quotes by author, topic, or mood.",
  "url": "https://quotebook.me/quotes.html",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Quotebook",
    "url": "https://quotebook.me/"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" },
    { "@type": "ListItem", "position": 2, "name": "Explore Quotes", "item": "https://quotebook.me/quotes.html" }
  ]
}
</script>
```

## 6. Add JSON-LD — `poster.html`

This is a free browser-based tool — `WebApplication` is the correct, well-supported
schema type for this (Google's software-app rich result guidelines apply to this type):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Quotebook Poster Studio",
  "url": "https://quotebook.me/poster.html",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Any (Web Browser)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Free online quote poster maker — turn any quote into a high-resolution, downloadable photo poster with Pixabay background photography."
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" },
    { "@type": "ListItem", "position": 2, "name": "Poster Studio", "item": "https://quotebook.me/poster.html" }
  ]
}
</script>
```

Only include the `offers` block above because Poster Studio is genuinely free with no
login/paywall (confirmed earlier in this project) — if that ever changes, this schema
must be updated to match, since inaccurate price/offer markup is treated as a policy
violation by Google, not just a stale field.

## 7. Add JSON-LD — `about.html`, `contact.html`, `terms.html`

Simple, accurate, low-risk schema for these three utility pages — just `WebPage` +
`BreadcrumbList` each, no invented ratings/reviews/FAQ content that doesn't already exist
on the page:

`about.html`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Quotebook",
  "url": "https://quotebook.me/about.html",
  "isPartOf": { "@type": "WebSite", "name": "Quotebook", "url": "https://quotebook.me/" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" },
    { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://quotebook.me/about.html" }
  ]
}
</script>
```

`contact.html`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Quotebook",
  "url": "https://quotebook.me/contact.html",
  "isPartOf": { "@type": "WebSite", "name": "Quotebook", "url": "https://quotebook.me/" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" },
    { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://quotebook.me/contact.html" }
  ]
}
</script>
```

`terms.html`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Terms & Conditions",
  "url": "https://quotebook.me/terms.html",
  "isPartOf": { "@type": "WebSite", "name": "Quotebook", "url": "https://quotebook.me/" }
}
</script>
```

(No `BreadcrumbList` strictly required on `terms.html` — a single `WebPage` entry is
sufficient for a legal/utility page like this; add one if you want full consistency
across all pages, it won't hurt.)

## 8. What NOT to do

- Do NOT add `FAQPage`, `Review`, `AggregateRating`, or any schema type representing
  content that isn't actually, visibly present on the page — Google explicitly penalizes
  structured data that doesn't match visible page content.
- Do NOT add a `SearchAction` to the `WebSite` schema (see §4) — there's no real
  query-string search endpoint for it to point to yet.
- Do NOT invent `sameAs` social profile URLs — none currently exist on the site.
- Do NOT touch any body content, CSS, or JS on these 6 pages — this task is `<head>`
  only.
- Do NOT change anything on the auto-generated `quotes/*/*.html` or `authors/*.html`
  pages — those already have their own JSON-LD from the existing template and are out of
  scope here.

## 9. Verification steps

1. For each of the 6 files, validate the new JSON-LD blocks with Google's Rich Results
   Test (https://search.google.com/test/rich-results) or the Schema Markup Validator
   (https://validator.schema.org/) — paste the page URL or raw HTML and confirm no
   errors.
2. Confirm `index.html`'s canonical now resolves to `https://quotebook.me/` and its
   `og:url` matches.
3. Confirm `about.html`, `contact.html`, and `terms.html` now have the same meta-tag
   completeness as `quotes.html`/`poster.html` (keywords, robots, author, og:site_name,
   og:locale, image dimensions/alt, twitter:site).
4. View page source (not DevTools-rendered DOM) on all 6 pages and confirm the
   `<script type="application/ld+json">` blocks are present and contain valid JSON (no
   trailing commas, matching braces).
5. Confirm no visible page content, layout, or functionality changed on any of the 6
   pages — this is a `<head>`-only change.