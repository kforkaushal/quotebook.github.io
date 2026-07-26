const fs = require('fs');
const path = require('path');

// Target paths
const quotesJsonPath = path.join(__dirname, '..', 'data', 'quotes_8000_plus.json');
const quotesDir = path.join(__dirname, '..', 'quotes');
const authorsDir = path.join(__dirname, '..', 'authors');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

// Ensure output directories exist
if (!fs.existsSync(quotesDir)) fs.mkdirSync(quotesDir);
if (!fs.existsSync(authorsDir)) fs.mkdirSync(authorsDir);

console.log('Reading database from:', quotesJsonPath);
const rawData = JSON.parse(fs.readFileSync(quotesJsonPath, 'utf8'));
const categories = rawData.categories || {};

// We also want to accumulate all URLs for sitemap.xml
const sitemapUrls = [
  'https://quotebook.me/index.html',
  'https://quotebook.me/quotes.html'
];

// Helper to escape HTML characters
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate category slug
function getSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Global template parts (Header, Footer, Head imports)
const headHtml = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../src/css/style.css">
  <link rel="icon" type="image/png" sizes="32x32" href="../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../data/img/android-chrome-512x512.png">
`;

const headerHtml = `
  <header class="app-header">
    <div class="header-container">
      <a href="../index" class="brand-logo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle">Timeless Wisdom & Art</span>
        </div>
      </a>
      <div class="header-actions">
        <button class="icon-btn-text lite-mode-toggle-btn" id="toggleDataSaver" title="Toggle Lite Mode (Saves Internet)">
          <i class="fa-solid fa-leaf"></i>
          <span>Lite Mode: <strong class="lite-status">Off</strong></span>
        </button>
        <a href="../index" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="../quotes" class="icon-btn-text highlight" title="Explore Quotes">
          <i class="fa-solid fa-compass"></i>
          <span>Explore</span>
        </a>
      </div>
    </div>
  </header>
`;

const footerHtml = `
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
          <span class="logo-title">Quotebook</span>
        </div>
        <p>A modern editorial web application for discovering quotes, listening aloud, and generating canvas posters.</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Quotebook. Powered by Pixabay API & Open Quote Datasets.</p>
    </div>
  </footer>
`;

// 1. Process Categories
console.log('Generating category pages...');
Object.keys(categories).forEach(catName => {
  const catObj = categories[catName];
  const slug = getSlug(catName);
  const quotes = catObj.quotes || [];
  
  // Sort quotes by popularity
  const sortedQuotes = [...quotes].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const staticQuotes = sortedQuotes.slice(0, 30); // Render first 30 quotes statically
  
  const pageTitle = `Explore ${escapeHtml(catName)} Quotes — Quotebook`;
  const pageDesc = `Discover curated quotes on ${escapeHtml(catName)} by timeless authors. Pair with HD backgrounds and generate custom posters.`;
  const canonicalUrl = `https://quotebook.me/quotes/${slug}.html`;
  sitemapUrls.push(canonicalUrl);

  const quotesListHtml = staticQuotes.map(q => {
    return `
      <article class="quote-card revealed" style="opacity:1; transform:translateY(0);">
        <div class="quote-card-header">
          <span class="quote-category-tag">${escapeHtml(catName)}</span>
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> ${((q.popularity || 0) * 100).toFixed(1)}</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"${escapeHtml(q.quote)}"</blockquote>
          <span class="card-author">&mdash; ${escapeHtml(q.author || 'Unknown')}</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-tags">
            ${(q.tags || []).slice(0, 2).map(t => `<span class="mini-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  ${headHtml}
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDesc}">
  <meta name="twitter:card" content="summary_large_image">

  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${pageTitle}",
    "description": "${pageDesc}",
    "url": "${canonicalUrl}"
  }
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  ${headerHtml}

  <main class="main-container">
    <section class="toolbar-section">
      <div class="toolbar-info">
        <h1 class="section-heading">${escapeHtml(catName)} Quotes</h1>
        <span class="results-count">Showing ${staticQuotes.length} featured quotes of ${quotes.length} total</span>
      </div>
      <div>
        <a href="../quotes?category=${encodeURIComponent(catName)}" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
        ${quotesListHtml}
      </div>
      
      <div class="load-more-container">
        <a href="../quotes?category=${encodeURIComponent(catName)}" class="btn-load-more" style="text-decoration:none;">
          <span>Explore All ${quotes.length} Quotes in Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>
  </main>

  ${footerHtml}
</body>
</html>`;

  fs.writeFileSync(path.join(quotesDir, `${slug}.html`), htmlContent, 'utf8');
});

// 2. Process Authors
console.log('Generating author pages...');
// Group all quotes by author
const authorQuotesMap = {};
Object.keys(categories).forEach(catName => {
  const catObj = categories[catName];
  (catObj.quotes || []).forEach(q => {
    if (q.author && q.author !== 'Unknown') {
      if (!authorQuotesMap[q.author]) {
        authorQuotesMap[q.author] = [];
      }
      authorQuotesMap[q.author].push({
        quote: q.quote,
        author: q.author,
        popularity: q.popularity || 0,
        category: catName,
        tags: q.tags || []
      });
    }
  });
});

// Take top 100 authors to generate static pages (for SEO priority)
const sortedAuthors = Object.keys(authorQuotesMap)
  .sort((a, b) => authorQuotesMap[b].length - authorQuotesMap[a].length)
  .slice(0, 100);

sortedAuthors.forEach(author => {
  const slug = getSlug(author);
  const quotes = authorQuotesMap[author];
  const sortedQuotes = [...quotes].sort((a, b) => b.popularity - a.popularity);
  const staticQuotes = sortedQuotes.slice(0, 30);
  
  const pageTitle = `${escapeHtml(author)} Quotes — Quotebook`;
  const pageDesc = `Discover timeless wisdom and quotes by ${escapeHtml(author)}. Read aloud and design custom quotes posters.`;
  const canonicalUrl = `https://quotebook.me/authors/${slug}.html`;
  sitemapUrls.push(canonicalUrl);

  const quotesListHtml = staticQuotes.map(q => {
    return `
      <article class="quote-card revealed" style="opacity:1; transform:translateY(0);">
        <div class="quote-card-header">
          <span class="quote-category-tag">${escapeHtml(q.category)}</span>
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> ${(q.popularity * 100).toFixed(1)}</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"${escapeHtml(q.quote)}"</blockquote>
          <span class="card-author">&mdash; ${escapeHtml(author)}</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-tags">
            ${q.tags.slice(0, 2).map(t => `<span class="mini-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  ${headHtml}
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDesc}">
  <meta name="twitter:card" content="summary_large_image">

  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${pageTitle}",
    "description": "${pageDesc}",
    "url": "${canonicalUrl}"
  }
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  ${headerHtml}

  <main class="main-container">
    <section class="toolbar-section">
      <div class="toolbar-info">
        <h1 class="section-heading">${escapeHtml(author)} Quotes</h1>
        <span class="results-count">Showing ${staticQuotes.length} featured quotes of ${quotes.length} total</span>
      </div>
      <div>
        <a href="../quotes?author=${encodeURIComponent(author)}" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
        ${quotesListHtml}
      </div>
      
      <div class="load-more-container">
        <a href="../quotes?author=${encodeURIComponent(author)}" class="btn-load-more" style="text-decoration:none;">
          <span>Explore All ${quotes.length} Quotes in Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>
  </main>

  ${footerHtml}
</body>
</html>`;

  fs.writeFileSync(path.join(authorsDir, `${slug}.html`), htmlContent, 'utf8');
});

// 3. Write sitemap.xml
console.log('Writing sitemap.xml...');
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-07-24</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${url.includes('index.html') ? '1.0' : (url.includes('quotes.html') ? '0.9' : '0.7')}</priority>\n  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log('Static pages generated successfully!');
