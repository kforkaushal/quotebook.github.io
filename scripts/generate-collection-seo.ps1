$jsonPath = "data\quotes_collection.json"
$quotesDir = "quotes"
$sitemapPath = "sitemap.xml"

# Ensure quotes folder exists
if (!(Test-Path -Path $quotesDir)) { New-Item -ItemType Directory -Path $quotesDir | Out-Null }

Write-Host "Reading database from $jsonPath..."
$raw = Get-Content -Raw -Path $jsonPath -Encoding UTF8 | ConvertFrom-Json
$categories = $raw.categories

$headHtml = @"
  <meta charset="UTF-8">
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
"@

$headerHtml = @"
  <header class="app-header">
    <div class="header-container">
      <a href="../../index.html" class="brand-logo" id="brandLogo">
        <div class="logo-icon"><img src="../../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle" id="quoteCountBadge">Timeless Wisdom & Art</span>
        </div>
      </a>
      <div class="header-actions" id="headerActions">
        <a href="../../index.html" class="icon-btn-text" title="Go to Home Landing">
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
        <a href="../../index.html" class="drawer-item">
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
"@

$footerHtml = @"
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
          <a href="../../index.html#features">Features</a>
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
      <p>© 2026 Quotebook. Powered by Pixabay API & Open Quote Datasets.</p>
    </div>
  </footer>
"@

function Escape-Html($text) {
    if ($null -eq $text) { return "" }
    return $text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&#039;")
}

function ToTitleCase($str) {
    if ($null -eq $str -or $str -eq "") { return "" }
    $str = $str -replace '_', ' '
    return (Get-Culture).TextInfo.ToTitleCase($str.ToLower())
}

# Keep list of generated page URLs for sitemap index
$sitemapUrls = [System.Collections.Generic.List[string]]::new()
$generatedCount = 0

Write-Host "Generating HTML pages..."

foreach ($catProp in $categories.psobject.properties) {
    $catName = $catProp.Name
    $catData = $catProp.Value
    
    foreach ($subProp in $catData.subcategories.psobject.properties) {
        $subName = $subProp.Name
        $quotesList = $subProp.Value | Sort-Object -Unique -Property quote
        
        if ($quotesList.Count -lt 5) { continue }
        
        $cleanCat = ToTitleCase($catName)
        $cleanSub = ToTitleCase($subName)
        
        $slug = "$($catName.ToLower() -replace '_', '-')-$($subName.ToLower() -replace '_', '-')"
        $catSlug = $catName.ToLower() -replace '_', '-' -replace ' & ', '-' -replace ' ', '-' -replace '[^\w-]', ''
        $quotesCount = $quotesList.Count
        $currentYear = (Get-Date).Year
        $pageTitle = "$quotesCount+ $cleanCat Quotes for $cleanSub ($currentYear)"
        $randomIntro = "Discover curated quotes on $cleanCat for $cleanSub. Pair with HD backgrounds and generate custom posters."
        # Use a rotating template if available, else fallback
        $introTemplates = @(
            "Looking for the perfect words? Discover our hand-picked collection of {count} {intent}. Whether you want to copy the text to clipboard, listen to it read aloud with speech synthesis, or design a custom card poster, we have you covered.",
            "Words have power. Here is a curated selection of {count} {intent} to help you express exactly what you feel. Pair them with HD photography from our Poster Studio or share them directly on WhatsApp and Instagram.",
            "Browse through {count} of the best {intent} sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.",
            "Make an impact today. Explore {count} {intent} that resonate deeply. You can preview these quotes on canvas backgrounds, read them aloud, and bookmark your favorites for later.",
            "Find inspiration instantly with this premium compilation of {count} {intent}. Read, copy, listen, or download them as high-quality visual poster cards using the Quotebook Studio tool."
        )
        $randomIntro = $introTemplates | Get-Random
        $pageDesc = $randomIntro.Replace("{count}", $quotesCount).Replace("{intent}", "$cleanCat Quotes for $cleanSub")
        $canonicalUrl = "https://quotebook.example.com/quotes/$catSlug/$slug.html"
        
        $sitemapUrls.Add($canonicalUrl)
        
        $quotesListHtml = ""
        foreach ($q in $quotesList) {
            $quoteText = if ($q -is [string]) { $q } else { $q.quote }
            $authorText = if ($q -is [string] -or -not $q.author) { "Quotebook Studio" } else { $q.author }
            
            $quotesListHtml += @"
      <article class="quote-card revealed" style="opacity: 1; transform: translateY(0px);">
        <div class="quote-card-header">
          <span class="quote-category-tag">$(Escape-Html $cleanCat)</span>
          <span class="quote-category-tag" style="background:var(--accent-teal-soft);color:var(--accent-teal);">$(Escape-Html $cleanSub)</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"$(Escape-Html $quoteText)"</blockquote>
          <span class="card-author">&mdash; $(Escape-Html $authorText)</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-tags">
            
          </div>
        </div>
      </article>
"@
        }
        
        $urlCat = [System.Web.HttpUtility]::UrlEncode("$cleanCat - $cleanSub")
        $quotesCount = $quotesList.Count
        $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
  $headHtml
  <title>$pageTitle</title>
  <meta name="description" content="$pageDesc">
  <link rel="canonical" href="$canonicalUrl">
  
  <!-- Open Graph -->
  <meta property="og:title" content="$pageTitle">
  <meta property="og:description" content="$pageDesc">
  <meta property="og:url" content="$canonicalUrl">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:title" content="$pageTitle">
  <meta name="twitter:description" content="$pageDesc">
  <meta name="twitter:card" content="summary_large_image">

  <!-- JSON-LD -->
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "$pageTitle",
      "description": "$pageDesc",
      "url": "$canonicalUrl"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.example.com/index.html"},
        {"@type": "ListItem", "position": 2, "name": "Quotes", "item": "https://quotebook.example.com/quotes.html"},
        {"@type": "ListItem", "position": 3, "name": "$pageTitle", "item": "$canonicalUrl"}
      ]
    }
  ]
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  $headerHtml

  <main class="main-container">
    <section class="toolbar-section">
      <div class="toolbar-info">
        <h1 class="section-heading">$cleanCat &amp; $cleanSub Quotes</h1>
        <p class="section-desc" style="font-size:1.05rem; line-height:1.6; color:var(--text-secondary); font-family:var(--font-sans);">
          $pageDesc
        </p>
      </div>
      <div>
        <a href="../../quotes.html?category=$urlCat" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
        $quotesListHtml
      </div>
      
      <div class="load-more-container">
        <a href="../../quotes.html?category=$urlCat" class="btn-load-more" style="text-decoration:none;">
          <span>Explore All $quotesCount Quotes in Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>
  </main>

  $footerHtml
  <script src="../../src/js/config.js"></script>`n  <script src="../../src/js/app.js"></script>
</body>
</html>
"@
        $outDir = Join-Path $quotesDir $catSlug
        if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
        $outPath = Join-Path -Path $outDir -ChildPath "$slug.html"
        [IO.File]::WriteAllText($outPath, $htmlContent, [System.Text.Encoding]::UTF8)
        $generatedCount++
    }
}

Write-Host "Successfully generated $generatedCount SEO pages."

# Append to sitemap
if (Test-Path $sitemapPath) {
    Write-Host "Appending new URLs to sitemap.xml..."
    $sitemapContent = Get-Content -Raw -Path $sitemapPath
    
    $newUrlsXml = ""
    foreach ($url in $sitemapUrls) {
        if (-not ($sitemapContent -match [regex]::Escape($url))) {
            $newUrlsXml += "  <url>`n    <loc>$url</loc>`n    <changefreq>weekly</changefreq>`n    <priority>0.7</priority>`n  </url>`n"
        }
    }
    
    if ($newUrlsXml -ne "") {
        $sitemapContent = $sitemapContent -replace "</urlset>", "$newUrlsXml</urlset>"
        [IO.File]::WriteAllText($sitemapPath, $sitemapContent, [System.Text.Encoding]::UTF8)
        Write-Host "Sitemap updated."
    }
}
