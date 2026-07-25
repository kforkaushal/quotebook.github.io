# ISSUES.md — Quotebook Bug & SEO Fix Guide

**Purpose:** This file tells an AI coding agent (Antigravity, Claude Code, etc.) exactly **where** each known problem lives and **how** to fix it. Read `AGENT.md` first for overall project context — this file is the actionable checklist that goes with it. Work top to bottom; each item lists severity, exact location, root cause, the fix, and how to verify it worked.

Source of these findings: audit of `Quotebook.zip` (core app) and `quotes.zip` (348 bulk-generated pages in `quotes/`), dated 25 July 2026.

---

## ISSUE-01 — Undefined CSS variables break subcategory tag chips
**Severity:** High · **Scope:** 279 of 348 generated pages in `quotes/`

### Where
`src/css/style.css` — the `:root` block (lines 5–29).

### What's wrong
279 generated pages (e.g. `quotes/birthday-boss.html`, `quotes/anniversary-husband.html`) render a second tag chip using:
```html
<span class="quote-category-tag" style="background:var(--accent-teal-soft);color:var(--accent-teal);">Boss</span>
```
`--accent-teal` and `--accent-teal-soft` **do not exist anywhere in `style.css`.** Confirmed by diffing every `var(--...)` reference in the generated pages against every variable actually defined in `:root` — these two are the only ones missing. The chip renders with browser-default/invalid color instead of the intended teal.

### Fix
Add the two missing variables to `style.css`, aliased to the existing teal tokens so no new colors are introduced (stay inside the palette from `PRD-color-system.md`):

```css
/* Teal (reserved complementary — single deliberate use) */
--teal-700: #12403F;
--teal-100: #D9EDEA;
--accent-teal: var(--teal-700);        /* add this line */
--accent-teal-soft: var(--teal-100);   /* add this line */
```
Insert directly after the existing `--teal-100: #D9EDEA;` line (line 16 of `style.css`).

### Verify
```bash
grep -c "accent-teal" src/css/style.css   # should now return 2
```
Then open `quotes/birthday-boss.html` in a browser — the "Boss" sub-tag should render with a teal background/text instead of black or transparent.

---

## ISSUE-02 — "Open Interactive Library" link is broken on composite-category pages
**Severity:** High · **Scope:** 279 of 336 generated pages

### Where
`src/js/app.js`, inside `init()` — around line 126:
```javascript
if (catParam && state.categoriesMap[catParam]) {
  state.activeCategory = catParam;
}
```

### What's wrong
Generated pages link to the interactive library like:
```
../quotes.html?category=Anniversary+-+Husband
```
`state.categoriesMap` is only populated from the 57 real categories in `data/quotes_8000_plus.json` — composite values like `"Anniversary - Husband"` don't exist as keys. The `if` check fails silently, `state.activeCategory` never changes, and the user lands on the unfiltered full library instead of husband-anniversary quotes.

### Fix
Two valid approaches — pick one based on how much filtering behavior you want:

**Option A (fast, minimal): fall back to the base category.**
```javascript
if (catParam) {
  if (state.categoriesMap[catParam]) {
    state.activeCategory = catParam;
  } else if (catParam.includes(' - ')) {
    const baseCategory = catParam.split(' - ')[0].trim();
    if (state.categoriesMap[baseCategory]) {
      state.activeCategory = baseCategory;
    }
  }
}
```
This makes `?category=Anniversary+-+Husband` at least filter to the real "Anniversary" category instead of showing nothing filtered.

**Option B (correct, more work): make composite categories real.**
Register every generated composite category (occasion + relationship/tone combination) into `state.categoriesMap` when `loadQuotesData()` builds it, so the filter genuinely narrows to that combination. This requires the interactive library's data model to actually carry occasion/relationship/tone metadata per quote (see `PRD-programmatic-seo.md` §3) — bigger scope, do this once that metadata pass is done.

**Recommendation:** ship Option A now (five-line fix, immediately correct-enough behavior), plan Option B alongside the metadata work in ISSUE-06.

### Verify
Visit `quotes.html?category=Anniversary+-+Husband` directly — with Option A, it should filter to "Anniversary" quotes rather than showing the full unfiltered list.

---

## ISSUE-03 — Duplicate quotes on 12 legacy pages
**Severity:** Medium · **Scope:** exactly these 12 files in `quotes/`:
```
good-night-wishes.html
anniversary-quotes-for-husband.html
anniversary-quotes-for-wife.html
birthday-wishes-for-best-friend.html
birthday-quotes-for-best-friend.html
attitude-status-in-english.html
birthday-quotes-for-friends.html
birthday-instagram-captions-for-friends.html
love-quotes-for-girlfriend.html
love-quotes-for-boyfriend.html
birthday-wishes-for-colleagues.html
good-morning-wishes.html
```

### What's wrong
These 12 pages were produced by an older version of the generation pipeline than the other 336. Each repeats 1–2 quotes back-to-back multiple times — e.g. `birthday-wishes-for-best-friend.html` shows the same J.D. Salinger quote twice in direct sequence.

### Fix
Do not hand-patch these 12 files individually. Instead:
1. Identify (or ask Kaushal for) whichever script/process generated the **336 clean pages** — that pipeline already dedupes correctly.
2. Re-run that same clean pipeline for these 12 topics so they're regenerated in the current (bug-free) format, replacing the old files entirely.
3. If the generator for the clean 336 batch isn't available, use the repair script in **ISSUE-08** below, which includes a dedup pass that works directly on the existing HTML output.

### Verify
```bash
python3 - <<'EOF'
import re
for f in ["good-night-wishes.html","anniversary-quotes-for-husband.html"]:  # etc.
    txt = open(f"quotes/{f}", encoding="utf-8", errors="ignore").read()
    quotes = re.findall(r'card-quote-text">"([^"]*)"', txt)
    assert len(quotes) == len(set(quotes)), f"{f} still has duplicates"
print("clean")
EOF
```

---

## ISSUE-04 — Boilerplate meta descriptions across 336 pages (thin-content risk)
**Severity:** High (SEO) · **Scope:** 336 of 348 pages

### Where
Wherever the generator builds the `<meta name="description">` / `<title>` / OG / Twitter tags and the JSON-LD `"description"` field for the 336-page batch (generator script not included in `quotes.zip` — locate it, likely `generate-seo-network.ps1` or a newer variant; if it can't be found, apply the fix via the repair script in ISSUE-08 as a post-process instead).

### What's wrong
Every one of these 336 pages uses the exact same sentence with only the subject swapped:
> "Discover curated quotes on **[X]**. Pair with HD backgrounds and generate custom posters."

And for composite categories, `[X]` comes out in reversed/unnatural English order — "Husband Anniversary," "Friends Anniversary," "Boss Birthday" instead of "Anniversary Quotes for Husband," "Birthday Quotes for Boss." Titles follow the same mechanical pattern: `Explore [X] Quotes - Quotebook`, with no real quote count or year.

336 near-identical descriptions differing only by a swapped noun phrase is close to the textbook definition of a templated/thin-content pattern search engines discount.

### Fix
1. **Fix word order at the source.** Wherever the category string is built (likely `${relationship} ${occasion}` string concatenation), swap to `${occasion} Quotes for ${relationship}` — e.g. `Anniversary Quotes for Husband`, not `Husband Anniversary`.
2. **Vary the description template.** Use 3–4 rotating templates keyed off a hash of the slug (so it's deterministic, not random per build) instead of one fixed sentence, e.g.:
   - `"{count}+ {topic} to make their day — copy, listen, or turn into a poster in one tap."`
   - `"Looking for the perfect {topic_lowercase}? Here are {count} hand-picked favorites."`
   - `"Real, ready-to-send {topic_lowercase} — {count} to choose from, no signup needed."`
3. **Insert the real quote count and current year** into the title: `{count}+ {Topic} ({year})` instead of `Explore {Topic} Quotes - Quotebook`.
4. **Add a genuine 40–80 word intro paragraph** per page (currently missing on all 336 — see ISSUE-05).

### Verify
```bash
grep -ohE 'name="description" content="Discover curated quotes on' quotes/*.html | wc -l
# should be 0 after the fix (currently 336)
```

---

## ISSUE-05 — No intro paragraph on 336 pages
**Severity:** Medium (SEO + UX) · **Scope:** 336 of 348 pages

### Where
Same generator as ISSUE-04. Compare against the 12 legacy pages, which DO have this element (e.g. `birthday-wishes-for-best-friend.html` has: *"Find inspiration instantly with this premium compilation of 21 birthday wishes for best friends..."*) — that block is simply missing from the newer template.

### Fix
Add the same intro-paragraph block used in the legacy template to the current generator, sourcing the real count and topic per page:
```html
<p class="section-desc" style="font-size:1.05rem; line-height:1.6; color:var(--text-secondary); font-family:var(--font-sans);">
  {intro_sentence_using_real_count_and_topic}
</p>
```
Pull `{intro_sentence}` from the same rotating-template pool described in ISSUE-04 point 2, so intro and meta description are consistent but not identical.

### Verify
Manually spot-check 5 random files from the 336 batch for a non-empty `.section-desc` paragraph between the `<h1>` and the quotes grid.

---

## ISSUE-06 — Keyword cannibalization between old and new pages
**Severity:** Medium (SEO) · **Scope:** at least these 5 confirmed pairs, likely more

| Old (buggy, legacy template) | New (clean, current template) |
|---|---|
| `birthday-quotes-for-friends.html` | `birthday-friend.html` |
| `birthday-quotes-for-best-friend.html` | *(no distinct new-batch equivalent yet — leave as-is for now)* |
| `anniversary-quotes-for-husband.html` | `anniversary-husband.html` |
| `anniversary-quotes-for-wife.html` | `anniversary-wife.html` |
| `good-morning-wishes.html` | `good-morning-general.html` / `good-morning-love.html` |

### What's wrong
Each pair targets essentially the same search query. Two live URLs competing for one intent splits ranking signal between them instead of concentrating it on one strong page.

### Fix
For each confirmed pair:
1. Decide which URL is canonical — recommend keeping the **new, clean, deduped page** (e.g. `birthday-friend.html`) as canonical since it doesn't have the ISSUE-03 duplicate-quote bug.
2. On the **old** page, either:
   - Delete it and add a redirect rule (`.htaccess` / hosting-level 301) from the old URL to the new one, or
   - If deletion isn't possible yet (e.g. no server-side redirect support on current static host), add `<link rel="canonical" href="{new-page-url}">` on the old page pointing to the new one, so search engines consolidate signal there instead.
3. Do **not** leave both live with self-referencing canonicals — that's the current state and it's the actual problem.

### Verify
`site:` search (once deployed) or Search Console "Coverage" report should show one indexed URL per intent, not two competing ones.

---

## ISSUE-07 — Generic `WebPage` JSON-LD instead of `Quotation`/`BreadcrumbList`
**Severity:** Medium (SEO) · **Scope:** all 348 pages

### Where
The `<script type="application/ld+json">` block in the `<head>` of every generated page.

### What's wrong
Every page uses:
```json
{ "@context": "https://schema.org", "@type": "WebPage", "name": "...", "description": "...", "url": "..." }
```
This is valid but generic — it doesn't tell Google these are quote collections, and there's no breadcrumb trail for site-structure understanding.

### Fix
Replace/extend with a `CollectionPage` containing `hasPart` entries per quote (or a `Quotation` array) plus a `BreadcrumbList`:
```json
[
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "{title}",
    "description": "{description}",
    "url": "{canonical_url}"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "{domain}/index.html"},
      {"@type": "ListItem", "position": 2, "name": "Quotes", "item": "{domain}/quotes.html"},
      {"@type": "ListItem", "position": 3, "name": "{title}", "item": "{canonical_url}"}
    ]
  }
]
```

### Verify
Paste a generated page's JSON-LD into Google's [Rich Results Test] after the fix — should validate as `CollectionPage` + `BreadcrumbList` with no errors.

---

## ISSUE-08 — Placeholder domain, BOM characters, and a ready-to-run repair script
**Severity:** High (domain) / Low (BOM) · **Scope:** all 348 pages

### What's wrong
- Every canonical/OG/JSON-LD URL points to `https://quotebook.example.com/...` — not a real, deployable domain.
- Every file starts with a UTF-8 BOM (`\ufeff`) before `<!DOCTYPE html>` — a PowerShell-on-Windows artifact. Mostly harmless but worth cleaning.

### Fix — batch repair script
Since several of the fixes above (domain swap, BOM strip, duplicate removal, description rewording) apply identically across many files, use this script rather than hand-editing 348 files. Save as `scripts/repair-bulk-pages.js` and run with `node scripts/repair-bulk-pages.js https://yourrealdomain.com`:

```javascript
const fs = require('fs');
const path = require('path');

const REAL_DOMAIN = process.argv[2];
if (!REAL_DOMAIN) {
  console.error('Usage: node repair-bulk-pages.js https://yourrealdomain.com');
  process.exit(1);
}

const quotesDir = path.join(__dirname, '..', 'quotes');
const authorsDir = path.join(__dirname, '..', 'authors');

function repairFile(filePath) {
  let txt = fs.readFileSync(filePath, 'utf8');

  // 1. Strip BOM
  if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);

  // 2. Replace placeholder domain
  txt = txt.replace(/https:\/\/quotebook\.example\.com/g, REAL_DOMAIN);

  // 3. Dedupe repeated <article class="quote-card...</article> blocks
  const articleRegex = /<article class="quote-card[\s\S]*?<\/article>/g;
  const seen = new Set();
  txt = txt.replace(articleRegex, (block) => {
    const quoteMatch = block.match(/card-quote-text">"([^"]*)"/);
    const key = quoteMatch ? quoteMatch[1] : block;
    if (seen.has(key)) return ''; // drop duplicate
    seen.add(key);
    return block;
  });

  fs.writeFileSync(filePath, txt, 'utf8');
}

[quotesDir, authorsDir].forEach(dir => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => {
    repairFile(path.join(dir, f));
    console.log('Repaired:', f);
  });
});

console.log('Done. Re-run generate-static-pages.js\'s sitemap step, or update sitemap.xml domain manually next.');
```

This script handles the domain swap, BOM strip, and duplicate-quote removal (ISSUE-03 and part of ISSUE-08) in one pass across all 348 files. It does **not** fix ISSUE-01, ISSUE-02, ISSUE-04, ISSUE-05, or ISSUE-06 — those need the template/generator-level fixes described above, since they're not simple find-and-replace operations.

Also update `sitemap.xml` and `robots.txt` (`Sitemap:` line) to the real domain after running this.

### Verify
```bash
head -c 3 quotes/birthday-boss.html | xxd   # should NOT show ef bb bf (BOM) after fix
grep -c "quotebook.example.com" quotes/*.html authors/*.html sitemap.xml   # should be 0 everywhere
```

---

## Suggested order of work

1. ISSUE-01 (one CSS edit, fixes 279 pages instantly)
2. ISSUE-02 Option A (five-line JS fix)
3. ISSUE-08 script (domain + BOM + dedup in one pass — also resolves ISSUE-03)
4. ISSUE-04 + ISSUE-05 together (same generator, do in one edit pass, then regenerate all 336)
5. ISSUE-06 (redirects/canonicals — do after #4 so you're not redirecting into a page that's about to change again)
6. ISSUE-07 (schema upgrade — lowest urgency, do last)

After all six are done, re-run the full verification commands above in sequence and re-audit a random sample of 10 pages by hand before resubmitting the sitemap to Search Console.
