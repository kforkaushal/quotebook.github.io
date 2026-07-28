$inputPath = Join-Path $PSScriptRoot "..\data\category_quotes\famous-quotes.json"
$outputPathIndex = Join-Path $PSScriptRoot "..\quotes\famous-quotes\index.html"
$outputPathGeneral = Join-Path $PSScriptRoot "..\quotes\famous-quotes\famous-quotes-general.html"
$duplicatePath = Join-Path $PSScriptRoot "..\quotes\famous-quotes.html"

# Delete duplicate root file if present
if (Test-Path $duplicatePath) {
    Remove-Item $duplicatePath -Force
    Write-Host "Removed duplicate root file: quotes/famous-quotes.html"
}

# Ensure destination directory exists
$outDir = Split-Path $outputPathIndex -Parent
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$rawJson = Get-Content -Path $inputPath -Raw -Encoding UTF8 | ConvertFrom-Json
$quotes = $rawJson.quotes

$cardsHtml = ""
$count = 0
$seen = @{}

foreach ($q in $quotes) {
    $text = $q.quote.Trim()
    $author = if ($q.author) { $q.author.Trim() } else { "Quotebook Studio" }
    
    if ($author -like "*,*") {
        $author = ($author -split ",")[0].Trim()
    }
    
    $lower = $text.ToLower()
    if ($seen.ContainsKey($lower)) { continue }
    $seen[$lower] = $true
    
    $count++
    
    $escQuote = [System.Web.HttpUtility]::HtmlEncode($text)
    $escAuthor = [System.Web.HttpUtility]::HtmlEncode($author)
    
    $cardsHtml += @"
      <article class="quote-card revealed" style="opacity: 1; transform: translateY(0px);">
        <div class="quote-card-header">
          <span class="quote-category-tag">Famous Quotes</span>
          <span class="quote-category-tag" style="background:var(--accent-teal-soft);color:var(--accent-teal);">General</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"$escQuote"</blockquote>
          <span class="card-author">&mdash; $escAuthor</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-tags">
            
          </div>
        </div>
      </article>
"@

    if ($count -ge 120) { break }
}

$fullHtml = @"
<!DOCTYPE html>
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
  <link rel="icon" type="image/png" sizes="32x32" href="../../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../../data/img/android-chrome-512x512.png">
  <title>120+ Famous Quotes for General (2026)</title>
  <meta name="description" content="Browse through 120 of the best Famous Quotes for General sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.">
  <link rel="canonical" href="https://quotebook.me/quotes/famous-quotes/famous-quotes-general.html">
  
  <!-- Open Graph -->
  <meta property="og:title" content="120+ Famous Quotes for General (2026)">
  <meta property="og:description" content="Browse through 120 of the best Famous Quotes for General sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.">
  <meta property="og:url" content="https://quotebook.me/quotes/famous-quotes/famous-quotes-general.html">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:title" content="120+ Famous Quotes for General (2026)">
  <meta name="twitter:description" content="Browse through 120 of the best Famous Quotes for General sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.">
  <meta name="twitter:card" content="summary_large_image">

  <!-- JSON-LD -->
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "120+ Famous Quotes for General (2026)",
      "description": "Browse through 120 of the best Famous Quotes for General sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.",
      "url": "https://quotebook.me/quotes/famous-quotes/famous-quotes-general.html"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/index.html"},
        {"@type": "ListItem", "position": 2, "name": "Quotes", "item": "https://quotebook.me/quotes.html"},
        {"@type": "ListItem", "position": 3, "name": "120+ Famous Quotes for General (2026)", "item": "https://quotebook.me/quotes/famous-quotes/famous-quotes-general.html"}
      ]
    }
  ]
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
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
          <span class="breadcrumb-current">Famous Quotes &amp; General</span>
        </nav>
        <h1 class="section-heading">Famous Quotes &amp; General Quotes</h1>
        <p class="section-desc" style="font-size:1.05rem; line-height:1.6; color:var(--text-secondary); font-family:var(--font-sans);">
          Browse through 120 of the best Famous Quotes for General sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.
        </p>
      </div>
      <div>
        <a href="../../quotes.html?category=Famous+Quotes+-+General" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
$cardsHtml
      </div>
      
      <div class="load-more-container">
        <a href="../../quotes.html?category=Famous+Quotes+-+General" class="btn-load-more" style="text-decoration:none;">
          <span>Explore All 120 Quotes in Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>

    <!-- Related Categories -->
    <section class="related-collections" style="margin: 4rem 0 2rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto; padding: 0 1.5rem;">
      <h3 style="font-family: var(--font-serif); font-size: 2.2rem; margin-bottom: 1.5rem; color: var(--text-primary);">Explore Related Collections</h3>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <a href="famous-quotes-general.html" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);" onmouseover="this.style.background='var(--text-primary)'; this.style.color='#fff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--surface-card)'; this.style.color='var(--text-secondary)'; this.style.transform='translateY(0)';">Famous Quotes General</a>
        <a href="../inspirational/inspirational-general.html" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);" onmouseover="this.style.background='var(--text-primary)'; this.style.color='#fff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--surface-card)'; this.style.color='var(--text-secondary)'; this.style.transform='translateY(0)';">Inspirational Quotes</a>
        <a href="../motivation-hustle/motivation-hustle-ambition-drive.html" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);" onmouseover="this.style.background='var(--text-primary)'; this.style.color='#fff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--surface-card)'; this.style.color='var(--text-secondary)'; this.style.transform='translateY(0)';">Motivation & Hustle Quotes</a>
      </div>
    </section>

  </main>

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
          <a href="../../index">Home</a>
          <a href="../../quotes.html">Quotes Library</a>
          <a href="../../quotes.html?action=poster">Poster Studio</a>
          <a href="../../index#features">Features</a>
        </div>
        <div class="footer-col">
          <h4>Categories</h4>
          <a href="../../quotes.html?category=Wisdom+%26+Knowledge">Wisdom</a>
          <a href="../../quotes.html?category=Philosophy+%26+Thinking">Philosophy</a>
          <a href="../../quotes.html?category=Books+%26+Reading">Books</a>
          <a href="../../quotes.html?category=Motivation+%26+Inspiration">Motivation</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>
  <script src="../../src/js/config.js"></script>
  <script src="../../src/js/app.js"></script>
</body>
</html>
"@

Set-Content -Path $outputPathIndex -Value $fullHtml -Encoding UTF8
Set-Content -Path $outputPathGeneral -Value $fullHtml -Encoding UTF8
Write-Host "Successfully generated 120 quotes into: $outputPathIndex and $outputPathGeneral"
