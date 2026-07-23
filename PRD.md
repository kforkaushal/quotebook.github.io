# 🍊 Quotebook — Product Requirements Document (PRD) & Orange Theme Specification

> **Copyable Master Specification Document**  
> *Version 2.0 • Signature Terracotta Orange Theme Edition*

---

## 1. Executive Summary & Product Vision

**Quotebook** is a high-end editorial web application combining **39,531+ curated quotes** across **57 categories** with high-resolution photography fetched live from the **Pixabay API**.

### Core Pillars
- **Sub-10ms Instant Paint**: 2-stage JSON engine (`data/featured_quotes.json` -> `data/quotes_8000_plus.json`).
- **Signature Terracotta Orange Theme**: Warm cream backdrops, slate navy typography, and vibrant orange glass accents.
- **1-Click Canvas Poster Studio**: High-res 1080×1080 social media poster generator with custom fonts and overlay tints.
- **Multi-Sensory Experience**: Natural Web Speech synthesis audio read-aloud and distraction-free Zen Mode.

---

## 2. Signature Orange Theme Color Palette

Quotebook enforces a curated **Warm Terracotta Orange Palette** that feels warm, inviting, editorial, and state-of-the-art.

### 🎨 Color Tokens Palette Table

| Token Name | Hex Code | RGBA / HSL | Usage & Design Intent |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#f9f8f5` | `hsl(45, 20%, 97%)` | Main document background (Warm Cream White). |
| `--accent-primary` | `#e05638` | `rgba(224, 86, 56, 1)` | Signature Terracotta Orange — Brand logo, primary CTAs, active pills. |
| `--accent-orange` | `#f97316` | `rgba(249, 115, 22, 1)`| Vivid Warm Orange — Gradient shimmer highlight, badge highlights. |
| `--accent-amber` | `#d97706` | `rgba(217, 119, 6, 1)` | Golden Amber — Rating stars, poster chips, secondary accents. |
| `--accent-peach` | `#ffedd5` | `rgba(255, 237, 213, 0.6)`| Soft Peach Glass Tint — Translucent badge fills, card highlights. |
| `--surface-card` | `rgba(255, 255, 255, 0.9)` | `backdrop-filter: blur(16px)` | Translucent glass card surface. |
| `--surface-header` | `rgba(255, 255, 255, 0.94)`| `backdrop-filter: blur(20px)` | Sticky navbar header background. |
| `--text-primary` | `#0f172a` | `rgba(15, 23, 42, 1)` | Obsidian Navy Slate — Headings, quote body text, bold titles. |
| `--text-secondary` | `#475569` | `rgba(71, 85, 105, 1)` | Slate Grey — Subheadings, author attributions, metadata. |
| `--text-muted` | `#94a3b8` | `rgba(148, 163, 184, 1)`| Soft Slate — Watermarks, search placeholders, counts. |
| `--border-light` | `rgba(226, 232, 240, 0.8)`| `rgba(226, 232, 240, 0.8)`| Subtle slate card & container borders. |

---

## 3. Top 5 UI/UX Design "Tricks & Secrets" for Home Screen WOW Factor

### 💡 Trick 1: Ambient Mesh Light Glow Orbs
Off-screen radial gradient circles with `filter: blur(60px)` and `will-change: transform; transform: translate3d(0,0,0)` create a living, breathing background without dropping scroll framerates.
```css
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.55;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  animation: floatOrb 18s ease-in-out infinite alternate;
}
.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(254, 215, 170, 0.8) 0%, rgba(224, 86, 56, 0.15) 50%, transparent 70%);
}
```

### 💡 Trick 2: Shimmering Gradient Typography
Sweeps a multi-stop orange-to-amber gradient across main headlines for a glossy, eye-catching text effect.
```css
.text-gradient-shimmer {
  background: linear-gradient(135deg, #e05638 0%, #f97316 50%, #d97706 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textShimmer 6s ease-in-out infinite alternate;
}
```

### 💡 Trick 3: 3D Depth & Stacking Perspective
Using `transform: perspective(1000px) rotateY(-16deg) rotateX(10deg)` on hero mockups creates tangible depth that instantly wows visitors.
```css
.tilted-phone-frame {
  transform: perspective(1000px) rotateY(-16deg) rotateX(10deg) rotateZ(3deg);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.tilted-phone-wrapper:hover .tilted-phone-frame {
  transform: perspective(1000px) rotateY(-4deg) rotateX(4deg) rotateZ(0deg) scale(1.03);
}
```

### 💡 Trick 4: Dynamic Preloading Crossfade (`setSmoothBackgroundImage`)
Eliminates white flashes by buffering Pixabay image downloads in memory before smoothly crossfading:
```javascript
function setSmoothBackgroundImage(element, imageUrl) {
  if (!element || !imageUrl) return;
  const tempImg = new Image();
  tempImg.crossOrigin = "Anonymous";
  tempImg.onload = () => {
    element.style.transition = 'opacity 0.4s ease-in-out, background-image 0.4s ease-in-out';
    element.style.backgroundImage = `url('${imageUrl}')`;
    element.style.opacity = '1';
  };
  tempImg.src = imageUrl;
}
```

### 💡 Trick 5: Spring Micro-Interactions
Using Apple-style easing `cubic-bezier(0.16, 1, 0.3, 1)` gives buttons, cards, and modal popups a natural tactile feel.

---

## 4. Home Screen Architecture & Component Inventory

### 1. App Header (`index.html`)
- Official SVG Brand Logo ([data/img/logo.svg](file:///c:/Users/bitbu/OneDrive/Documents/GitHub/Quotebook/data/img/logo.svg)) in a white elevated container (`.logo-icon`).
- Navigation links (*Home*, *Explore Quotes*, *Poster Gallery*, *Device Preview*, *Features*).
- CTA Button (*"Explore 39,000+ Quotes →"*).

### 2. Hero Section
- Status Pill Badge (`🔴 39,531+ Curated Quotes & Pixabay Photography`).
- Headline (*"Inspiring Words. Breathtaking Visuals."*) with shimmer orange gradient.
- Dual Overlapping 3D Mobile Devices displaying live Zen Mode quote and poster preview.

### 3. Infinite Marquee Ticker
- Continuous horizontal scrolling category bar (`@keyframes marqueeScroll`).

### 4. Key Statistics Banner
- Highlights: `39,531+ Quotes`, `57 Categories`, `HD Pixabay Photos`, `1-Click Poster Studio`.

### 5. Visual Poster Gallery Showcase
- 4-card grid displaying high-resolution visual posters paired with photography.

### 6. Interactive Device Preview Switcher
- Selector tabs (**📱 Mobile**, **tablet Tablet**, **💻 Desktop**) dynamically resizing `#deviceMockupFrame`.

---

## 5. Sub-10ms Performance Architecture

1. **Stage 1 (Sub-10ms Paint)**:
   - `app.js` fetches `data/featured_quotes.json` (~400KB) FIRST. Initial page and quotes render in **< 10 milliseconds**.
2. **Stage 2 (Background Sync)**:
   - `data/quotes_8000_plus.json` (~57MB) loads silently in background idle time without UI thread blocking.

---

## 6. Complete Copyable Theme Tokens (CSS)

```css
:root {
  --bg-main: #f9f8f5;
  --surface-card: rgba(255, 255, 255, 0.9);
  --surface-header: rgba(255, 255, 255, 0.94);
  
  --accent-primary: #e05638;
  --accent-orange: #f97316;
  --accent-amber: #d97706;
  --accent-peach: #ffedd5;
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  --border-light: rgba(226, 232, 240, 0.8);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
  
  --transition-smooth: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 7. Conclusion

This Product Requirements Document establishes the design system and UI/UX tricks for **Quotebook**. All specs are implemented across `index.html`, `quotes.html`, `src/css/style.css`, `src/js/app.js`, and `src/js/poster.js`.
