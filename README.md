# 📖 Quotebook — Timeless Quotes & Visual Poster Studio

> **Live site:** [quotebook.me](https://quotebook.me)

**Quotebook** is an editorial, fast-loading static web app featuring a curated library of **1 Million+ quotes across 57 categories**, beautiful background photography via **Picsum Photos** (no API key required), and a full-featured **HTML5 Canvas Poster Studio**.

---

## ✨ Features

| Feature | Description |
|---|---|
| **1M+ Curated Quotes** | Search by keyword, author, or any of 57 categories with multi-faceted filtering and popularity sorting |
| **Background Photography** | Deterministic, category-matched HD photos via Picsum Photos — works on any domain, no API key, no CORS issues |
| **Poster Studio** | Design quote posters on an HTML5 Canvas: 5 overlay styles, 3 aspect ratios (1:1 / 4:5 / 16:9), custom font picker, 1-click PNG download |
| **Text-to-Speech** | Listen to any quote read aloud using the Web Speech API |
| **Zen Mode** | Fullscreen auto-advancing slideshow with crossfading photo backdrops and an 8-second progress bar |
| **Bookmarks** | One-click bookmarking with `localStorage` persistence and JSON export |
| **Famous Quotes** | Dedicated category page with its own sub-pages and SEO breadcrumbs |
| **Lite Mode** | User-toggleable data-saver mode that disables all image fetching |
| **Responsive** | Optimised for mobile, tablet, and desktop — hamburger nav, touch-friendly cards |

---

## 📁 Repository Structure

```
Quotebook/
├── index.html                        # Home — hero, bento grid, device showcase
├── quotes.html                       # Quotes library + Poster Studio modal
├── poster.html                       # Dedicated full-page Poster Studio
├── about.html                        # About page
├── contact.html                      # Contact page
├── terms.html                        # Terms & Conditions
│
├── quotes/                           # GENERATED — category & intent pages
│   ├── famous-quotes/
│   │   ├── index.html                # Famous Quotes category hub
│   │   └── famous-quotes-general.html
│   └── ...                           # 50+ long-tail SEO pages
│
├── authors/                          # GENERATED — per-author pages (~100)
│
├── data/
│   ├── quotes_8000_plus.json         # Working dataset (39,000+ quotes, fetched client-side)
│   ├── featured_quotes.json          # Lightweight homepage subset (fast initial load)
│   ├── metadata.json                 # Category manifest for lazy-loading
│   ├── categories/                   # Per-category split files (14 of 57 complete)
│   └── img/                          # Logo, favicons, OG cover image
│
├── src/
│   ├── css/style.css                 # Single stylesheet — design tokens, layout, animations
│   └── js/
│       ├── app.js                    # Main application logic (quotes, search, Zen Mode, photos)
│       ├── poster.js                 # HTML5 Canvas PosterStudio class
│       ├── config.js                 # Runtime config placeholder
│       └── searchWorker.js           # Web Worker for background full-corpus search
│
├── scripts/
│   ├── generate-static-pages.js/.ps1 # Generates quotes/ and authors/ pages + sitemap.xml
│   ├── tag-database-rules.js/.ps1    # Tags dataset → quotes_enriched.json (build-time only)
│   ├── build-famous-quotes.ps1       # Generates Famous Quotes sub-pages from JSON
│   └── generate-seo-network.ps1      # Windows — generates long-tail SEO intent pages
│
├── agent/
│   ├── AGENT.md                      # Source-of-truth context doc for AI coding agents
│   └── seo.md                        # SEO upgrade task spec (head meta + JSON-LD)
│
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## 🚀 Running Locally

No build step. Serve the folder with any static HTTP server:

```bash
# Python
python -m http.server 8080

# Node.js
npx http-server ./ -p 8080

# VS Code — use the "Live Server" extension
```

Then open:
- **Home:** `http://localhost:8080/`
- **Quotes Explorer:** `http://localhost:8080/quotes.html`
- **Poster Studio:** `http://localhost:8080/poster.html`

---

## ⚙️ Image Engine

Background photos are served by [Picsum Photos](https://picsum.photos) — **no API key, no sign-up, no domain registration needed**. Every quote category maps to a deterministic numeric seed so the same category always renders the same curated landscape photo. On a slow or offline connection, every background gracefully falls back to a styled deep-blue/teal gradient (never a blank white panel).

---

## 🛠️ Generating Static Pages

> ⚠️ Read `agent/AGENT.md` §4 before re-running any generator. The live files in `quotes/` contain hand-edited content that the current script does not reproduce — re-running will overwrite it.

```powershell
# Regenerate all quotes/ and authors/ pages + sitemap.xml
node scripts/generate-static-pages.js

# Tag the full dataset (build-time only — output is NOT served)
node scripts/tag-database-rules.js

# Generate Famous Quotes sub-pages (Windows)
.\scripts\build-famous-quotes.ps1
```

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5 |
| Styling | Vanilla CSS — custom property design tokens, grid/flexbox, CSS animations |
| Logic | ES6+ Vanilla JS — no framework, no bundler |
| Images | [Picsum Photos](https://picsum.photos) — free, keyless, CORS-safe HD photography |
| Canvas | Native HTML5 Canvas 2D API (Poster Studio) |
| Search | Web Worker (`searchWorker.js`) for background full-corpus search |
| Speech | Web Speech API (`speechSynthesis`) |
| Fonts | Google Fonts — *Cormorant Garamond*, *Outfit*, *Caveat* |
| Icons | Font Awesome 6 |
| Analytics | Google Analytics 4 |

---

## 🔍 SEO

All 6 main pages have a complete, consistent meta set:

- Unique `<title>` + `<meta name="description">` per page
- `keywords`, `robots`, `author` meta tags
- Full Open Graph block — `og:site_name`, `og:locale`, `og:image:width/height/alt`
- Twitter Card — `twitter:site`, `twitter:image:alt`

**JSON-LD structured data per page:**

| Page | Schema types |
|---|---|
| `index.html` | `WebSite` + `Organization` |
| `quotes.html` | `BreadcrumbList` + `CollectionPage` + `FAQPage` |
| `poster.html` | `BreadcrumbList` + `WebApplication` (free offer) |
| `about.html` | `AboutPage` + `BreadcrumbList` |
| `contact.html` | `ContactPage` + `BreadcrumbList` |
| `terms.html` | `WebPage` |

Generated category/author pages also include `CollectionPage` + `BreadcrumbList` JSON-LD.

---

## 📄 License

Open Source — CC0 / MIT / Public Domain.


---

## 🌟 Key Features

- **1 Million+ Curated Quotes**: Instant search by author, keyword, or topic with multi-faceted filtering and popularity sorting.
- **Pixabay HD Photography**: Context-aware photography automatically matched to quote categories (*Wisdom*, *Nature*, *Books*, *Philosophy*, *Love*, *Motivation*, etc.).
- **HTML5 Canvas Poster Studio**: Design customizable quote posters with custom typography, glassmorphism tint overlays, aspect ratio selectors (1:1, 4:5, 16:9), and 1-click PNG image export.
- **Text-to-Speech Synthesis**: Listen to any quote read aloud with natural speech pronunciation.
- **Distraction-Free Zen Mode**: Fullscreen auto-advancing slideshow with crossfading photography backdrops.
- **Saved Bookmarks**: 1-Click bookmarking with `localStorage` persistence and JSON export.
- **Cross-Device Responsive Design**: Optimized for smartphones, tablets, and desktop displays.

---

## 📁 Repository Structure

```
Quotebook/
├── data/
│   └── quotes_8000_plus.json    # 39,000+ curated quotes JSON database
├── src/
│   ├── css/
│   │   └── style.css            # Light Mode design system & glassmorphism styling
│   └── js/
│       ├── app.js               # Dual-page application engine & Pixabay API loader
│       └── poster.js            # HTML5 Canvas poster studio generator
├── index.html                   # Home Landing Page with Device Showcase & Marquee
├── quotes.html                  # Quotes Library Explorer & Canvas Poster Studio
└── README.md                    # Project documentation
```

---

## 🚀 How to Run Locally

You can serve the project using any static HTTP web server (such as Python, Node `http-server`, VS Code Live Server, or IIS):

### Option 1: Python
```bash
python -m http.server 8080
```

### Option 2: Node.js (http-server or serve)
```bash
npx http-server ./ -p 8080
```

### Accessing the App
- **Home Landing**: `http://localhost:8080/index.html`
- **Quotes Explorer**: `http://localhost:8080/quotes.html`

---

## 🎨 Technologies Used

- **Frontend**: HTML5, CSS3 (Vanilla CSS variables, glassmorphism, flexbox/grid), ES6+ JavaScript.
- **API Integration**: Pixabay Photographic Search API (`key: YOUR_PIXABAY_API_KEY_HERE`). *Note: To enable background photography, create a file at `src/js/config.js` containing `window.CONFIG = { PIXABAY_API_KEY: "your_key" };`.*
- **Canvas Engine**: Native HTML5 Canvas 2D rendering API.
- **Typography**: Google Fonts (*Cormorant Garamond*, *Playfair Display*, *Outfit*, *Caveat*).
- **Icons**: Font Awesome 6.

---

## 📄 License

Open Source / Open Data (CC0 / MIT / Public Domain).
