const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'data', 'social_media_quotes.json');
const quotesDir = path.join(__dirname, '..', 'quotes');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

// Ensure output directories exist
if (!fs.existsSync(quotesDir)) fs.mkdirSync(quotesDir);

console.log('Reading social media database from:', jsonPath);
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = rawData.categories || {};

const sitemapUrls = [];

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toTitleCase(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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
      <a href="../index.html" class="brand-logo" id="brandLogo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle" id="quoteCountBadge">Timeless Wisdom & Art</span>
        </div>
      </a>
      <div class="header-actions" id="headerActions">
        <a href="../index.html" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="../quotes.html" class="icon-btn-text highlight" title="Explore Quotes">
          <i class="fa-solid fa-compass"></i>
          <span>Explore Quotes</span>
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
  </footer>
`;

let generatedCount = 0;
console.log('Generating HTML pages for social media dataset...');

for (const [catName, catData] of Object.entries(categories)) {
  for (const [subName, quotesList] of Object.entries(catData.subcategories)) {
    if (quotesList.length < 5) continue;

    const cleanCat = toTitleCase(catName);
    const cleanSub = toTitleCase(subName);

    const slug = `${catName.toLowerCase().replace(/_/g, '-')}-${subName.toLowerCase().replace(/_/g, '-')}`;
    const pageTitle = `${quotesList.length}+ Best ${cleanCat} for ${cleanSub} (2026)`;
    const pageDesc = `Explore the best collection of ${cleanSub} ${cleanCat}. Copy, bookmark, or generate beautiful quote posters directly in your browser.`;
    const h1Text = `${cleanCat} - ${cleanSub}`;
    const canonicalUrl = `https://quotebook.me/quotes/${slug}.html`;

    sitemapUrls.push(canonicalUrl);

    let quotesListHtml = '';
    quotesList.forEach(q => {
      const quoteText = typeof q === 'string' ? q : q.quote;
      const authorText = (typeof q === 'string' || !q.author) ? 'Quotebook Studio' : q.author;
      
      quotesListHtml += `
      <article class="quote-card revealed" style="opacity: 1; transform: translateY(0px);">
        <div class="quote-card-header">
          <span class="quote-category-tag">${escapeHtml(cleanCat)}</span>
          <span class="quote-category-tag" style="background:var(--accent-teal-soft);color:var(--accent-teal);">${escapeHtml(cleanSub)}</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"${escapeHtml(quoteText)}"</blockquote>
          <span class="card-author">&mdash; ${escapeHtml(authorText)}</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-actions">
            <button class="mini-action-btn card-btn-copy" title="Copy Text"><i class="fa-regular fa-copy"></i></button>
            <button class="mini-action-btn card-btn-poster" title="Create Poster"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
          </div>
        </div>
      </article>
      `;
    });

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
    <section class="toolbar-section" style="margin-bottom:2.5rem;">
      <div class="toolbar-info" style="max-width:800px;">
        <h1 class="section-heading" style="margin-bottom:0.75rem;">${h1Text}</h1>
        <p class="section-desc" style="font-size:1.05rem; line-height:1.6; color:var(--text-secondary); font-family:var(--font-sans);">
          Looking for the perfect words? Discover our hand-picked collection of ${quotesList.length} ${cleanCat} for ${cleanSub}. You can copy these directly or design a custom card poster using our studio tool.
        </p>
      </div>
      <div style="margin-top:1rem;">
        <a href="../quotes.html" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>
    <section class="quotes-grid-container">
      <div class="quotes-grid">
        ${quotesListHtml}
      </div>
    </section>
  </main>
  ${footerHtml}
</body>
</html>`;
    
    fs.writeFileSync(path.join(quotesDir, `${slug}.html`), htmlContent, 'utf8');
    generatedCount++;
  }
}

console.log(`Successfully generated ${generatedCount} SEO pages.`);

if (fs.existsSync(sitemapPath)) {
  console.log('Appending new URLs to sitemap.xml...');
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  let newUrlsXml = '';
  
  sitemapUrls.forEach(url => {
    if (!sitemapContent.includes(url)) {
      newUrlsXml += `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
  });

  if (newUrlsXml !== '') {
    sitemapContent = sitemapContent.replace('</urlset>', newUrlsXml + '</urlset>');
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log('Sitemap updated.');
  }
}
