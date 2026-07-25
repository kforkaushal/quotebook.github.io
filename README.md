# 📖 Quotebook — Timeless Quotes & Visual Poster Studio

**Quotebook** is an ultra-modern, editorial web application featuring a curated dataset of over **39,000+ quotes across 57 categories** paired with high-resolution photography fetched live from the **Pixabay API**.

---

## 🌟 Key Features

- **39,000+ Curated Quotes**: Instant search by author, keyword, or topic with multi-faceted filtering and popularity sorting.
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
- **API Integration**: Pixabay Photographic Search API (`key: YOUR_PIXABAY_API_KEY_HERE`).
- **Canvas Engine**: Native HTML5 Canvas 2D rendering API.
- **Typography**: Google Fonts (*Cormorant Garamond*, *Playfair Display*, *Outfit*, *Caveat*).
- **Icons**: Font Awesome 6.

---

## 📄 License

Open Source / Open Data (CC0 / MIT / Public Domain).
