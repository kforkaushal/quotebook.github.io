$inputPath = Join-Path $PSScriptRoot "..\data\category_quotes\famous-quotes.json"
$outputPathIndex = Join-Path $PSScriptRoot "..\quotes\famous-quotes\index.html"
$outputPathGeneral = Join-Path $PSScriptRoot "..\quotes\famous-quotes\famous-quotes-general.html"

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

$topQuotationsJson = @()

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

    if ($count -le 10) {
        $topQuotationsJson += @{
            "@type" = "Quotation"
            "text" = $text
            "spokenBy" = @{
                "@type" = "Person"
                "name" = $author
            }
        }
    }
    
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

function Build-PageHtml([string]$pageTitle, [string]$pageDesc, [string]$pageUrl, [string]$breadcrumbName) {
    $jsonLdBreadcrumb = @"
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://quotebook.me/index.html"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Quotes",
          "item": "https://quotebook.me/quotes.html"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "$breadcrumbName",
          "item": "$pageUrl"
        }
      ]
    }
"@

    $jsonLdCollection = @"
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "$pageTitle",
      "description": "$pageDesc",
      "url": "$pageUrl",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": 120,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Quotation",
              "text": "The unexamined life is not worth living.",
              "creator": { "@type": "Person", "name": "Socrates" }
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Quotation",
              "text": "In the middle of difficulty lies opportunity.",
              "creator": { "@type": "Person", "name": "Albert Einstein" }
            }
          },
          {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Quotation",
              "text": "Be the change you wish to see in the world.",
              "creator": { "@type": "Person", "name": "Mahatma Gandhi" }
            }
          }
        ]
      }
    }
"@

    $jsonLdFaq = @"
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are the most famous quotes of all time?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Universal classics include Socrates' 'The unexamined life is not worth living,' Albert Einstein's 'In the middle of difficulty lies opportunity,' Mahatma Gandhi's 'Be the change you wish to see in the world,' and Oscar Wilde's 'Be yourself; everyone else is already taken.'"
          }
        },
        {
          "@type": "Question",
          "name": "How can I copy or generate posters from these famous quotes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each quote card on Quotebook provides instant interactive tools. Use our Canvas Poster Studio to turn any famous line into high-resolution 1080x1080 social media graphics with curated backgrounds."
          }
        }
      ]
    }
"@

    return @"
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
  
  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="../../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../../data/img/android-chrome-512x512.png">

  <!-- Enhanced SEO Metadata -->
  <title>$pageTitle</title>
  <meta name="description" content="$pageDesc">
  <meta name="keywords" content="famous quotes, iconic quotes, historical quotes, quotes of all time, wisdom, inspiration, philosophy quotes, inspirational sayings">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="$pageUrl">
  
  <!-- Open Graph -->
  <meta property="og:title" content="$pageTitle">
  <meta property="og:description" content="$pageDesc">
  <meta property="og:url" content="$pageUrl">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Quotebook">
  <meta property="og:image" content="https://quotebook.me/data/img/og-cover.png">
  
  <!-- Twitter Card -->
  <meta name="twitter:title" content="$pageTitle">
  <meta name="twitter:description" content="$pageDesc">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- JSON-LD Structured Data (BreadcrumbList, CollectionPage, FAQPage) -->
  <script type="application/ld+json">
  [
$jsonLdBreadcrumb,
$jsonLdCollection,
$jsonLdFaq
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
          <span class="breadcrumb-current">$breadcrumbName</span>
        </nav>
        <h1 class="section-heading">$breadcrumbName Quotes</h1>
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

    <!-- FAQ Section for SEO -->
    <section class="faq-section" style="max-width: 900px; margin: 4rem auto 2rem; padding: 0 1.5rem;">
      <h2 style="font-family: var(--font-serif); font-size: 2.2rem; text-align: center; margin-bottom: 2rem; color: var(--text-primary);">
        Frequently Asked Questions
      </h2>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="padding: 1.5rem; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
            What are the most famous quotes of all time?
          </h3>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            Universal classics include Socrates' <em>"The unexamined life is not worth living,"</em> Albert Einstein's <em>"In the middle of difficulty lies opportunity,"</em> Mahatma Gandhi's <em>"Be the change you wish to see in the world,"</em> and Oscar Wilde's <em>"Be yourself; everyone else is already taken."</em>
          </p>
        </div>
        <div style="padding: 1.5rem; background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">
            How can I generate social media posters from these famous quotes?
          </h3>
          <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            Each quote card on Quotebook provides instant interactive tools. Use our Canvas Poster Studio to turn any famous line into high-resolution 1080x1080 social media graphics with curated HD backgrounds.
          </p>
        </div>
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
}

$htmlIndex = Build-PageHtml "120+ Famous Quotes of All Time: Legendary Words & Timeless Wisdom (2026)" "Browse through 120 of the best Famous Quotes sourced from our library. Hand-selected lines designed to inspire, connect, and elevate your speech or status." "https://quotebook.me/quotes/famous-quotes/index.html" "Famous Quotes"
$htmlGeneral = Build-PageHtml "120+ Famous Quotes for General (2026)" "Browse through 120 of the best Famous Quotes for General sourced from our library. Hand-selected lines designed to inspire, connect, and elevate your greeting card messages and social media bios." "https://quotebook.me/quotes/famous-quotes/famous-quotes-general.html" "Famous Quotes & General"

Set-Content -Path $outputPathIndex -Value $htmlIndex -Encoding UTF8
Set-Content -Path $outputPathGeneral -Value $htmlGeneral -Encoding UTF8
Write-Host "Successfully generated enhanced SEO famous quotes pages into: $outputPathIndex and $outputPathGeneral"
