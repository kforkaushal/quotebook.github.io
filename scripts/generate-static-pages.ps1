$quotesJsonPath = "data\quotes_8000_plus.json"
$quotesDir = "quotes"
$authorsDir = "authors"
$sitemapPath = "sitemap.xml"

# Ensure output directories exist
if (!(Test-Path -Path $quotesDir)) { New-Item -ItemType Directory -Path $quotesDir | Out-Null }
if (!(Test-Path -Path $authorsDir)) { New-Item -ItemType Directory -Path $authorsDir | Out-Null }

Write-Host "Reading database from $quotesJsonPath..."
$rawData = Get-Content -Raw -Path $quotesJsonPath -Encoding UTF8 | ConvertFrom-Json
$categories = $rawData.categories

$sitemapUrls = [System.Collections.Generic.List[string]]::new()
$sitemapUrls.Add("https://quotebook.example.com/index.html")
$sitemapUrls.Add("https://quotebook.example.com/quotes.html")

function Escape-Html($text) {
    if ($null -eq $text) { return "" }
    return $text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&#039;")
}

function Get-Slug($name) {
    if ($null -eq $name) { return "" }
    $slug = $name.ToLower()
    $slug = [System.Text.RegularExpressions.Regex]::Replace($slug, "[^a-z0-9]+", "-")
    $slug = $slug.Trim("-")
    return $slug
}

$headHtml = @"
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../src/css/style.css">
"@

$headerHtml = @"
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
      <button class="mobile-menu-toggle" id="quotesMenuToggle" aria-label="Open Menu" aria-expanded="false">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>
    </div>
    <nav class="quotes-mobile-drawer" id="quotesMobileDrawer" aria-hidden="true">
      <div class="drawer-inner">
        <a href="../index.html" class="drawer-item">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="../quotes.html" class="drawer-item highlight">
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
"@

# 1. Process Categories
Write-Host "Generating category pages..."
foreach ($prop in $categories.psobject.properties) {
    $catName = $prop.Name
    $catData = $prop.Value
    $slug = Get-Slug $catName
    $quotes = $catData.quotes
    
    # Sort quotes by popularity
    $sortedQuotes = $quotes | Sort-Object popularity -Descending | Select-Object -First 30
    
    $pageTitle = "Explore $(Escape-Html $catName) Quotes - Quotebook"
    $pageDesc = "Discover curated quotes on $(Escape-Html $catName) by timeless authors. Pair with HD backgrounds and generate custom posters."
    $canonicalUrl = "https://quotebook.example.com/quotes/$slug.html"
    $sitemapUrls.Add($canonicalUrl)

    $quotesListHtml = ""
    foreach ($q in $sortedQuotes) {
        $tagsHtml = ""
        if ($null -ne $q.tags) {
            $tagSlice = $q.tags | Select-Object -First 2
            foreach ($t in $tagSlice) {
                $tagsHtml += "<span class=`"mini-tag`">#$(Escape-Html $t)</span>"
            }
        }
        
        $popVal = [Math]::Round($q.popularity * 100, 1)
        $quotesListHtml += @"
      <article class="quote-card revealed" style="opacity:1; transform:translateY(0);">
        <div class="quote-card-header">
          <span class="quote-category-tag">$(Escape-Html $catName)</span>
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> $popVal</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"$(Escape-Html $q.quote)"</blockquote>
          <span class="card-author">- $(Escape-Html $q.author)</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-tags">
            $tagsHtml
          </div>
        </div>
      </article>
"@
    }

    $urlCat = [System.Web.HttpUtility]::UrlEncode($catName)
    $quotesCount = $quotes.Count
    $sortedQuotesCount = $sortedQuotes.Count

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
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "$pageTitle",
    "description": "$pageDesc",
    "url": "$canonicalUrl"
  }
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  $headerHtml

  <main class="main-container">
    <section class="toolbar-section">
      <div class="toolbar-info">
        <h1 class="section-heading">$(Escape-Html $catName) Quotes</h1>
        <span class="results-count">Showing $sortedQuotesCount featured quotes of $quotesCount total</span>
      </div>
      <div>
        <a href="../quotes.html?category=$urlCat" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
        $quotesListHtml
      </div>
      
      <div class="load-more-container">
        <a href="../quotes.html?category=$urlCat" class="btn-load-more" style="text-decoration:none;">
          <span>Explore All $quotesCount Quotes in Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>
  </main>

  $footerHtml
  <script src="../src/js/app.js"></script>
</body>
</html>
"@

    $outFilePath = Join-Path $quotesDir "$slug.html"
    [System.IO.File]::WriteAllText($outFilePath, $htmlContent, [System.Text.Encoding]::UTF8)
}

# 2. Process Authors
Write-Host "Generating author pages..."
$authorQuotesMap = @{}

foreach ($prop in $categories.psobject.properties) {
    $catName = $prop.Name
    $catData = $prop.Value
    foreach ($q in $catData.quotes) {
        if ($null -ne $q.author -and $q.author -ne "Unknown" -and $q.author -ne "") {
            $author = $q.author
            if (!$authorQuotesMap.ContainsKey($author)) {
                $authorQuotesMap[$author] = [System.Collections.Generic.List[PSObject]]::new()
            }
            $quoteObj = [PSCustomObject]@{
                quote = $q.quote
                author = $q.author
                popularity = $q.popularity
                category = $catName
                tags = $q.tags
            }
            $authorQuotesMap[$author].Add($quoteObj)
        }
    }
}

# Sort authors by count descending and take top 100
$sortedAuthorsList = $authorQuotesMap.Keys | Sort-Object { $authorQuotesMap[$_].Count } -Descending | Select-Object -First 100

foreach ($author in $sortedAuthorsList) {
    $slug = Get-Slug $author
    $quotes = $authorQuotesMap[$author]
    $sortedQuotes = $quotes | Sort-Object popularity -Descending | Select-Object -First 30
    
    $pageTitle = "$(Escape-Html $author) Quotes - Quotebook"
    $pageDesc = "Discover timeless wisdom and quotes by $(Escape-Html $author). Read aloud and design custom quotes posters."
    $canonicalUrl = "https://quotebook.example.com/authors/$slug.html"
    $sitemapUrls.Add($canonicalUrl)

    $quotesListHtml = ""
    foreach ($q in $sortedQuotes) {
        $tagsHtml = ""
        if ($null -ne $q.tags) {
            $tagSlice = $q.tags | Select-Object -First 2
            foreach ($t in $tagSlice) {
                $tagsHtml += "<span class=`"mini-tag`">#$(Escape-Html $t)</span>"
            }
        }
        
        $popVal = [Math]::Round($q.popularity * 100, 1)
        $quotesListHtml += @"
      <article class="quote-card revealed" style="opacity:1; transform:translateY(0);">
        <div class="quote-card-header">
          <span class="quote-category-tag">$(Escape-Html $q.category)</span>
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> $popVal</span>
        </div>
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"$(Escape-Html $q.quote)"</blockquote>
          <span class="card-author">- $(Escape-Html $author)</span>
        </div>
        <div class="quote-card-footer">
          <div class="card-tags">
            $tagsHtml
          </div>
        </div>
      </article>
"@
    }

    $urlAuth = [System.Web.HttpUtility]::UrlEncode($author)
    $quotesCount = $quotes.Count
    $sortedQuotesCount = $sortedQuotes.Count

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
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "$pageTitle",
    "description": "$pageDesc",
    "url": "$canonicalUrl"
  }
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  $headerHtml

  <main class="main-container">
    <section class="toolbar-section">
      <div class="toolbar-info">
        <h1 class="section-heading">$(Escape-Html $author) Quotes</h1>
        <span class="results-count">Showing $sortedQuotesCount featured quotes of $quotesCount total</span>
      </div>
      <div>
        <a href="../quotes.html?author=$urlAuth" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <div id="authorProfileWidget" data-author="$(Escape-Html $author)"></div>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
        $quotesListHtml
      </div>
      
      <div class="load-more-container">
        <a href="../quotes.html?author=$urlAuth" class="btn-load-more" style="text-decoration:none;">
          <span>Explore All $quotesCount Quotes in Library</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </section>
  </main>

  $footerHtml
  <script src="../src/js/app.js"></script>
</body>
</html>
"@

    $outFilePath = Join-Path $authorsDir "$slug.html"
    [System.IO.File]::WriteAllText($outFilePath, $htmlContent, [System.Text.Encoding]::UTF8)
}

# 3. Generate sitemap.xml
Write-Host "Writing sitemap.xml..."
$sitemapXml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n"
foreach ($url in $sitemapUrls) {
    $priority = "0.7"
    if ($url.Contains("index.html")) { $priority = "1.0" }
    elseif ($url.Contains("quotes.html")) { $priority = "0.9" }
    $sitemapXml += "  <url>`n    <loc>$url</loc>`n    <lastmod>2026-07-24</lastmod>`n    <changefreq>weekly</changefreq>`n    <priority>$priority</priority>`n  </url>`n"
}
$sitemapXml += "</urlset>"
[System.IO.File]::WriteAllText($sitemapPath, $sitemapXml, [System.Text.Encoding]::UTF8)

Write-Host "Static pages generated successfully in powershell!"
