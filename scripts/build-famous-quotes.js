const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'data', 'category_quotes', 'famous-quotes.json');
const outputPath = path.join(__dirname, '..', 'quotes', 'famous-quotes', 'index.html');
const duplicatePath = path.join(__dirname, '..', 'quotes', 'famous-quotes.html');

// Remove duplicate root file if it exists
if (fs.existsSync(duplicatePath)) {
  fs.unlinkSync(duplicatePath);
  console.log('Removed duplicate root file: quotes/famous-quotes.html');
}

// Read famous quotes dataset
const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
let quotes = rawData.quotes || [];

// Filter & sanitize quotes: remove duplicates, clean author names, pick top 100+
const seen = new Set();
const cleanQuotes = [];

for (const item of quotes) {
  let text = item.quote ? item.quote.trim() : '';
  let author = item.author ? item.author.trim() : 'Unknown';
  
  // Clean up author string if it includes book title after comma
  if (author.includes(',')) {
    author = author.split(',')[0].trim();
  }

  if (!text || seen.has(text.toLowerCase())) continue;
  seen.add(text.toLowerCase());

  cleanQuotes.push({ quote: text, author: author });
  if (cleanQuotes.length >= 100) break;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const quoteCardsHtml = cleanQuotes.map((q, idx) => `
      <article class="quote-card revealed" style="opacity: 1; transform: translateY(0px);">
        <div class="quote-card-header">
          <span class="quote-category-tag">Famous Quotes</span>
          <span class="quote-category-tag" style="background:var(--accent-teal-soft);color:var(--accent-teal);">#${idx + 1}</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"${escapeHtml(q.quote)}"</blockquote>
          <span class="card-author">&mdash; ${escapeHtml(q.author)}</span>
        </div>
        <div class="today-quote-actions" style="display:flex; gap:0.5rem; padding: 0.75rem 1.25rem; border-top:1px solid var(--border-light); background:rgba(255,255,255,0.4);">
          <button class="today-action-btn btn-copy" data-quote="${escapeHtml(q.quote)}" data-author="${escapeHtml(q.author)}" title="Copy to Clipboard"><i class="fa-solid fa-copy"></i> Copy</button>
          <button class="today-action-btn btn-speak" data-quote="${escapeHtml(q.quote)}" data-author="${escapeHtml(q.author)}" title="Read Aloud"><i class="fa-solid fa-volume-high"></i> Listen</button>
          <button class="today-action-btn btn-poster" data-quote="${escapeHtml(q.quote)}" data-author="${escapeHtml(q.author)}" data-cat="Famous Quotes" title="Create Poster"><i class="fa-solid fa-palette"></i> Poster</button>
        </div>
      </article>`).join('\n');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-P7WSN8P37J');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../../src/css/style.css">
  
  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="../../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../../data/img/android-chrome-512x512.png">

  <!-- SEO Metadata -->
  <title>100+ Most Famous Quotes of All Time: Legendary Words & Timeless Wisdom (2026)</title>
  <meta name="description" content="Explore 100+ of the most famous quotes of all time by Socrates, Albert Einstein, Maya Angelou, Oscar Wilde, and Confucius. Curated with instant copy, speech synthesis, and poster generator.">
  <link rel="canonical" href="https://quotebook.me/quotes/famous-quotes/">
  
  <!-- Open Graph -->
  <meta property="og:title" content="100+ Most Famous Quotes of All Time: Legendary Words & Timeless Wisdom">
  <meta property="og:description" content="Explore 100+ of the most famous quotes of all time by Socrates, Albert Einstein, Maya Angelou, Oscar Wilde, and Confucius. Curated with instant copy, speech synthesis, and poster generator.">
  <meta property="og:url" content="https://quotebook.me/quotes/famous-quotes/">
  <meta property="og:type" content="website">
  
  <!-- Twitter Card -->
  <meta name="twitter:title" content="100+ Most Famous Quotes of All Time: Legendary Words & Timeless Wisdom">
  <meta name="twitter:description" content="Explore 100+ of the most famous quotes of all time by Socrates, Albert Einstein, Maya Angelou, Oscar Wilde, and Confucius. Curated with instant copy, speech synthesis, and poster generator.">
  <meta name="twitter:card" content="summary_large_image">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "100+ Most Famous Quotes of All Time: Legendary Words & Timeless Wisdom",
      "description": "Explore 100+ of the most famous quotes of all time by Socrates, Albert Einstein, Maya Angelou, Oscar Wilde, and Confucius.",
      "url": "https://quotebook.me/quotes/famous-quotes/"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/index.html"},
        {"@type": "ListItem", "position": 2, "name": "Quotes", "item": "https://quotebook.me/quotes.html"},
        {"@type": "ListItem", "position": 3, "name": "Famous Quotes", "item": "https://quotebook.me/quotes/famous-quotes/"}
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What makes a quote famous?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Famous quotes combine syntactic brevity, emotional resonance, and universal human truth. They capture complex philosophical ideas in memorable language that transcends time."
          }
        },
        {
          "@type": "Question",
          "name": "How can I generate social media posters from these quotes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Click the Poster button on any quote card to open our Canvas Poster Studio, where you can style fonts, colors, and download 1080x1080 social media graphics."
          }
        }
      ]
    }
  ]
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  
  <!-- Header Navigation -->
  <header class="app-header">
    <div class="header-container">
      <a href="../../index" class="brand-logo" id="brandLogo">
        <div class="logo-icon"><img src="../../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle" id="quoteCountBadge">Timeless Wisdom & Art</span>
        </div>
      </a>
      <div class="header-actions" id="headerActions">
        <a href="../../index" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="../../quotes.html" class="icon-btn-text highlight" title="Explore Quotes">
          <i class="fa-solid fa-compass"></i>
          <span>Explore Quotes</span>
        </a>
      </div>
      <button class="mobile-menu-toggle" id="quotesMenuToggle" aria-label="Open Menu" aria-expanded="false">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>
    </div>
    <nav class="quotes-mobile-drawer" id="quotesMobileDrawer" aria-hidden="true">
      <div class="drawer-inner">
        <a href="../../index" class="drawer-item">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="../../quotes.html" class="drawer-item highlight">
          <i class="fa-solid fa-compass"></i>
          <span>Explore Quotes</span>
        </a>
      </div>
    </nav>
  </header>

  <main class="main-container">
    <section class="toolbar-section">
      <div class="toolbar-info">
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
          <a href="../../index.html"><i class="fa-solid fa-house"></i> Home</a>
          <span class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>
          <a href="../../quotes.html">Quotes</a>
          <span class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>
          <span class="breadcrumb-current">Famous Quotes</span>
        </nav>
        <h1 class="section-heading">100+ Most Famous Quotes of All Time</h1>
        <p class="section-desc" style="font-size:1.05rem; line-height:1.6; color:var(--text-secondary); font-family:var(--font-sans);">
          Browse our hand-curated collection of 100+ famous quotes from historic figures, philosophers, and authors. Copy quotes to clipboard, listen aloud with built-in speech synthesis, or launch our Canvas Poster Studio to design custom 1080x1080 social media graphics.
        </p>
      </div>
      <div>
        <a href="../../quotes.html?category=Famous+Quotes" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
${quoteCardsHtml}
      </div>

      <!-- Full Library Call-to-Action -->
      <div class="load-more-container" style="text-align:center; margin: 3rem 0;">
        <a href="../../quotes.html?category=Famous+Quotes" class="btn-load-more" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem; padding: 0.85rem 1.75rem; background:var(--accent-primary); color:#fff; border-radius:var(--radius-pill); font-weight:600;">
          <span>Explore All 1,200+ Famous Quotes in Interactive Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section" style="max-width: 900px; margin: 4rem auto 2rem; padding: 0 1.5rem;">
      <h2 style="font-family: var(--font-serif); font-size: 2.2rem; text-align: center; margin-bottom: 2rem; color: var(--text-primary);">
        Frequently Asked Questions
      </h2>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="padding: 1.5rem; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
            What makes a quote famous?
          </h3>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            Famous quotes combine syntactic brevity, emotional resonance, and universal human truth. They capture complex philosophical ideas in memorable language that transcends time.
          </p>
        </div>
        <div style="padding: 1.5rem; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
            How can I generate social media posters from these quotes?
          </h3>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            Click the <i class="fa-solid fa-palette" style="color:var(--accent-primary);"></i> <strong>Poster</strong> button on any quote card above to open our Canvas Poster Studio, where you can style fonts, colors, and download 1080x1080 graphics.
          </p>
        </div>
      </div>
    </section>

    <!-- Related Collections -->
    <section class="related-collections" style="margin: 4rem 0 2rem; text-align: center; max-width: 850px; margin-left: auto; margin-right: auto; padding: 0 1.5rem;">
      <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 1.5rem; color: var(--text-primary);">Explore Related Collections</h3>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <a href="../stoic-philosophy/stoic-philosophy-marcus-aurelius-style.html" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);">Stoic Philosophy</a>
        <a href="../inspirational/inspirational-general.html" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);">Inspirational Quotes</a>
        <a href="../motivation-hustle/motivation-hustle-ambition-drive.html" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);">Motivation & Hustle</a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <div class="logo-icon"><img src="../../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
          <span class="logo-title">Quotebook</span>
        </div>
        <p>A modern editorial web application for discovering quotes, listening aloud, and generating canvas posters with Pixabay photography.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Navigation</h4>
          <a href="../../index.html">Home</a>
          <a href="../../quotes.html">Quotes Library</a>
          <a href="../../quotes.html?action=poster">Poster Studio</a>
        </div>
        <div class="footer-col">
          <h4>Categories</h4>
          <a href="../../quotes.html?category=Wisdom+%26+Knowledge">Wisdom</a>
          <a href="../../quotes.html?category=Philosophy+%26+Thinking">Philosophy</a>
          <a href="../../quotes.html?category=Books+%26+Reading">Books</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="../../src/js/config.js"></script>
  <script src="../../src/js/app.js"></script>
</body>
</html>
`;

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, htmlContent, 'utf8');
console.log(\`Successfully generated \${cleanQuotes.length} quotes in: \${outputPath}\`);
