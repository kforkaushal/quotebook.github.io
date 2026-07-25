$enrichedJsonPath = "data\quotes_enriched.json"
$quotesDir = "quotes"
$sitemapPath = "sitemap.xml"

# Ensure quotes folder exists
if (!(Test-Path -Path $quotesDir)) { New-Item -ItemType Directory -Path $quotesDir | Out-Null }

Write-Host "Reading enriched database..."
$raw = Get-Content -Raw -Path $enrichedJsonPath -Encoding UTF8 | ConvertFrom-Json
$categories = $raw.categories

# Flatten all quotes to make querying 100x faster
Write-Host "Flattening quotes list..."
$allQuotes = [System.Collections.Generic.List[PSObject]]::new()
foreach ($prop in $categories.psobject.properties) {
    $catName = $prop.Name
    $catData = $prop.Value
    foreach ($q in $catData.quotes) {
        $allQuotes.Add($q)
    }
}
Write-Host "Flattened $($allQuotes.Count) quotes."

# Search-Intent Registry
$registry = @(
    # Occasion: Birthday
    [PSCustomObject]@{ occasion="Birthday"; relationship="Friend"; format="Quote"; slug="birthday-quotes-for-friends"; title="150+ Happy Birthday Quotes for Friends (2026)"; h1="Birthday Quotes for Friends"; desc="Curated happy birthday quotes for friends. Celebrate friendship with meaningful quotes and custom poster cards."; intentText="happy birthday quotes for friends" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Friend"; format="Wish"; slug="birthday-wishes-for-friends"; title="120+ Birthday Wishes for Friends to Make Them Smile (2026)"; h1="Birthday Wishes for Friends"; desc="Heartwarming and funny birthday wishes for friends. Copy, read aloud, or design custom birthday posters."; intentText="birthday wishes for friends" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Best Friend"; format="Quote"; slug="birthday-quotes-for-best-friend"; title="80+ Birthday Quotes for Best Friend - Heartfelt & Funny (2026)"; h1="Birthday Quotes for Best Friend"; desc="Beautiful birthday quotes for your best friend. Show them how much they mean to you on their special day."; intentText="birthday quotes for best friends" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Best Friend"; format="Wish"; slug="birthday-wishes-for-best-friend"; title="100+ Best Friend Birthday Wishes & Greetings (2026)"; h1="Birthday Wishes for Best Friend"; desc="Find the perfect birthday wish for your best friend. Statically generated, crawlable wishes with visual features."; intentText="birthday wishes for best friends" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Friend"; format="Caption"; slug="birthday-instagram-captions-for-friends"; title="90+ Birthday Instagram Captions for Friends (2026)"; h1="Birthday Instagram Captions for Friends"; desc="Cute, aesthetic, and funny birthday Instagram captions for friends. Ready to copy-paste for your next post."; intentText="birthday instagram captions for friends" },
    
    [PSCustomObject]@{ occasion="Birthday"; relationship="Brother"; format="Wish"; slug="birthday-wishes-for-brother"; title="110+ Happy Birthday Wishes for Brother (2026)"; h1="Birthday Wishes for Brother"; desc="Curated birthday wishes for your brother. From funny to emotional, find the perfect wording here."; intentText="happy birthday wishes for your brother" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Sister"; format="Wish"; slug="birthday-wishes-for-sister"; title="110+ Happy Birthday Wishes for Sister (2026)"; h1="Birthday Wishes for Sister"; desc="Send your sister the best birthday wishes. Explore inspirational and heartfelt messages she will love."; intentText="happy birthday wishes for your sister" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Mother"; format="Wish"; slug="birthday-wishes-for-mom"; title="90+ Birthday Wishes for Mom - Sweet & Loving (2026)"; h1="Birthday Wishes for Mom"; desc="Show your mother how much you love her with these sweet and heartfelt birthday wishes. Copy or read aloud."; intentText="happy birthday wishes for mom" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Father"; format="Wish"; slug="birthday-wishes-for-dad"; title="90+ Birthday Wishes for Dad from Son & Daughter (2026)"; h1="Birthday Wishes for Dad"; desc="Make your dad's day extra special with these happy birthday wishes. Perfect for greeting cards."; intentText="happy birthday wishes for dad" },
    
    [PSCustomObject]@{ occasion="Birthday"; relationship="Boss"; format="Wish"; slug="birthday-wishes-for-boss"; title="60+ Professional Birthday Wishes for Boss & Manager (2026)"; h1="Birthday Wishes for Boss"; desc="Maintain professional excellence with these curated birthday wishes for your boss, manager, or mentor."; intentText="professional birthday wishes for your boss" },
    [PSCustomObject]@{ occasion="Birthday"; relationship="Colleague"; format="Wish"; slug="birthday-wishes-for-colleagues"; title="80+ Birthday Wishes for Colleagues & Coworkers (2026)"; h1="Birthday Wishes for Colleagues"; desc="Polite, friendly, and funny office birthday wishes for colleagues and team members. Boost workplace vibes."; intentText="birthday wishes for office colleagues" },
    
    # Occasion: Anniversary
    [PSCustomObject]@{ occasion="Anniversary"; relationship="Husband"; format="Quote"; slug="anniversary-quotes-for-husband"; title="100+ Happy Anniversary Quotes for Husband (2026)"; h1="Anniversary Quotes for Husband"; desc="Celebrate your love story with these beautiful wedding anniversary quotes for your husband."; intentText="wedding anniversary quotes for your husband" },
    [PSCustomObject]@{ occasion="Anniversary"; relationship="Wife"; format="Quote"; slug="anniversary-quotes-for-wife"; title="100+ Happy Anniversary Quotes for Wife (2026)"; h1="Anniversary Quotes for Wife"; desc="Show your wife your deep devotion with these romantic wedding anniversary quotes and visual poster layouts."; intentText="wedding anniversary quotes for your wife" },
    
    # Occasion: Love
    [PSCustomObject]@{ occasion="Love"; relationship="Girlfriend"; format="Quote"; slug="love-quotes-for-girlfriend"; title="120+ Romantic Love Quotes for Girlfriend (2026)"; h1="Love Quotes for Girlfriend"; desc="Make her heart melt with these sweet, romantic, and deep love quotes for your girlfriend."; intentText="romantic love quotes for your girlfriend" },
    [PSCustomObject]@{ occasion="Love"; relationship="Boyfriend"; format="Quote"; slug="love-quotes-for-boyfriend"; title="120+ Romantic Love Quotes for Boyfriend (2026)"; h1="Love Quotes for Boyfriend"; desc="Tell him how much you care with these cute and romantic love quotes for your boyfriend."; intentText="romantic love quotes for your boyfriend" },
    
    # Tone: Savage/Attitude
    [PSCustomObject]@{ tone="Savage/Attitude"; format="Shayari"; slug="attitude-shayari-for-boys"; title="130+ Savage Attitude Shayari for Boys (2026)"; h1="Attitude Shayari for Boys"; desc="Explore the best collection of Hindi attitude shayari for boys. Copy status or make custom shayari posters."; intentText="attitude shayari in Hindi for boys" },
    [PSCustomObject]@{ tone="Savage/Attitude"; format="Status"; slug="attitude-status-in-english"; title="150+ Savage Attitude Status in English (2026)"; h1="Attitude Status in English"; desc="Upgrade your status profile with these savage attitude lines and short captions in English."; intentText="savage attitude status in English" },
    
    # Occasion: Good Morning / Good Night
    [PSCustomObject]@{ occasion="Good Morning"; format="Wish"; slug="good-morning-wishes"; title="140+ Good Morning Wishes & Quotes to Start the Day (2026)"; h1="Good Morning Wishes"; desc="Send positive energy with these good morning wishes. Perfect for Whatsapp messages and daily greeting cards."; intentText="good morning wishes and messages" },
    [PSCustomObject]@{ occasion="Good Night"; format="Wish"; slug="good-night-wishes"; title="120+ Good Night Wishes & Quotes for Peaceful Sleep (2026)"; h1="Good Night Wishes"; desc="Help your loved ones drift to sleep with these calming good night wishes and quote card designs."; intentText="good night wishes and sleeping quotes" }
)

# Template structures for anti-boilerplate variations
$introTemplates = @(
    "Looking for the perfect words? Discover our hand-picked collection of {count} {intent}. Whether you want to copy the text to clipboard, listen to it read aloud with speech synthesis, or design a custom card poster, we have you covered.",
    "Words have power. Here is a curated selection of {count} {intent} to help you express exactly what you feel. Pair them with HD photography from our Poster Studio or share them directly on WhatsApp and Instagram.",
    "Browse through {count} of the best {intent} sourced from our library. These hand-selected lines are designed to inspire, connect, and elevate your greeting card messages and social media bios.",
    "Make an impact today. Explore {count} {intent} that resonate deeply. You can preview these quotes on canvas backgrounds, read them aloud, and bookmark your favorites for later.",
    "Find inspiration instantly with this premium compilation of {count} {intent}. Read, copy, listen, or download them as high-quality visual poster cards using the Quotebook Studio tool."
)

function Escape-Html($text) {
    if ($null -eq $text) { return "" }
    return $text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&#039;")
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
  <link rel="stylesheet" href="../../src/css/style.css">
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

# Keep list of generated page URLs for sitemap index
$sitemapUrls = [System.Collections.Generic.List[string]]::new()
$sitemapUrls.Add("https://quotebook.example.com/index.html")
$sitemapUrls.Add("https://quotebook.example.com/quotes.html")

# Track generated vs skipped counts
$generatedCount = 0
$skippedCount = 0

Write-Host "Processing programmatic SEO network with semantic fallback rules..."
foreach ($combo in $registry) {
    # Filter quotes matching combo dynamically with semantic fallback rules
    $matches = $allQuotes | Where-Object {
        $text = $_.quote.ToLower()
        $cat = $_.category.ToLower()
        
        $ok = $true
        
        # 1. Occasion filtering
        if ($combo.occasion -eq "Birthday") {
            if ($combo.format -eq "Wish") {
                $ok = $ok -and ($text -match "\b(birthday|birth day|wish|wishing|may your|congrats|happy birthday)\b")
            } else {
                # Birthday Quotes - show friendship, love, or age quotes depending on relationship
                if ($combo.relationship -eq "Friend" -or $combo.relationship -eq "Best Friend") {
                    $ok = $ok -and ($text -match "\b(friend|friendship)\b")
                } elseif ($combo.relationship -eq "Brother" -or $combo.relationship -eq "Sister" -or $combo.relationship -eq "Mother" -or $combo.relationship -eq "Father") {
                    $relWord = $combo.relationship.ToLower()
                    if ($relWord -eq "mother") { $relWord = "(mother|mom)" }
                    if ($relWord -eq "father") { $relWord = "(father|dad)" }
                    $ok = $ok -and ($text -match "\b$relWord\b")
                } else {
                    $ok = $ok -and ($text -match "\bbirthday\b")
                }
            }
        }
        elseif ($combo.occasion -eq "Anniversary") {
            $ok = $ok -and ($cat -eq "love" -or $text -match "\b(anniversary|wedding|marry|marriage|husband|wife)\b")
        }
        elseif ($combo.occasion -eq "Love") {
            $ok = $ok -and ($cat -eq "love" -or $text -match "\b(love|romantic|girlfriend|boyfriend|heart|beloved)\b")
        }
        elseif ($combo.occasion -eq "Good Morning") {
            $ok = $ok -and ($text -match "\b(morning|sunrise|day|today|wake|sun)\b" -or $cat -eq "happiness")
        }
        elseif ($combo.occasion -eq "Good Night") {
            $ok = $ok -and ($text -match "\b(night|sleep|dream|evening|peace|rest)\b")
        }
        
        # 2. Relationship filtering (if specified)
        if ($null -ne $combo.relationship) {
            $relWord = $combo.relationship.ToLower()
            if ($relWord -eq "best friend") { $relWord = "(best friend|friend|friendship)" }
            elseif ($relWord -eq "mother") { $relWord = "(mother|mom)" }
            elseif ($relWord -eq "father") { $relWord = "(father|dad)" }
            elseif ($relWord -eq "colleague") { $relWord = "(colleague|coworker|office|work)" }
            $ok = $ok -and ($text -match "\b$relWord\b")
        }
        
        # 3. Tone filtering
        if ($combo.tone -eq "Savage/Attitude") {
            $ok = $ok -and ($text -match "\b(attitude|savage|rules|style|own|pride|strong|king|queen|boss)\b" -or $cat -eq "success" -or $cat -eq "humor")
        }
        
        # 4. Format filtering
        if ($combo.format -eq "Shayari") {
            # Shayari - match Hinglish/Hindi
            $ok = $ok -and ($_.language -eq "hi-Latn" -or $text -match "\b(dil|pyaar|mohabbat|zindagi|dost|humsafar|ishq|pyar|tamanna|khushi|wafa|dard)\b")
        }
        elseif ($combo.format -eq "Status") {
            # Status - match short, punchy quotes
            $ok = $ok -and ($_.wordCount -le 20)
        }
        elseif ($combo.format -eq "Caption") {
            # Instagram captions - match short quotes
            $ok = $ok -and ($_.wordCount -le 16)
        }
        
        $ok
    }

    # Quality Gate Check
    if ($matches.Count -lt 15) {
        Write-Host "  [Quality Gate Skip] '$($combo.slug)' has only $($matches.Count) matching quotes. Skipped to prevent thin content." -ForegroundColor Yellow
        $skippedCount++
        continue
    }

    # Select top 30 sorted by popularity score (deduplicated)
    $sortedQuotes = $matches | Sort-Object -Unique -Property quote | Sort-Object popularity -Descending | Select-Object -First 30
    
    $slug = $combo.slug
    $pageTitle = $combo.title
    $pageDesc = $combo.desc
    $h1Text = $combo.h1
    $intentText = $combo.intentText
    $canonicalUrl = "https://quotebook.example.com/quotes/$catSlug/$slug.html"
    $sitemapUrls.Add($canonicalUrl)

    # 1. Select random intro template
    $randomIntroTemplate = $introTemplates | Get-Random
    $introText = $randomIntroTemplate.Replace("{count}", $sortedQuotes.Count).Replace("{intent}", $intentText)

    # 2. Render sibling link recommendations widget
    $siblings = $registry | Where-Object { 
        ($_.occasion -eq $combo.occasion -or $_.format -eq $combo.format) -and $_.slug -ne $combo.slug 
    } | Select-Object -First 4
    
    $siblingLinksHtml = ""
    if ($siblings.Count -gt 0) {
        $siblingLinksHtml += "<div class=`"sibling-recommendations`"><h3>Explore Related Collections</h3><div class=`"sibling-grid`">"
        foreach ($sib in $siblings) {
            $siblingLinksHtml += "<a href=`"$($sib.slug).html`" class=`"sibling-card`"><i class=`"fa-solid fa-bookmark`"></i> $($sib.h1)</a>"
        }
        $siblingLinksHtml += "</div></div>"
    }

    # 3. Compile quote list HTML cards
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
      <article class="quote-card revealed" style="opacity: 1; transform: translateY(0px);">
        <div class="quote-card-header">
          <span class="quote-category-tag">$(Escape-Html $q.occasion)</span>
          <span class="quote-pop-badge"><i class="fa-solid fa-fire"></i> $popVal</span>
        </div>
        
        <div class="card-quote-body">
          <div class="quote-icon-watermark">&ldquo;</div>
          <blockquote class="card-quote-text">"$(Escape-Html $q.quote)"</blockquote>
          <span class="card-author">&mdash; $(Escape-Html $q.author)</span>
        </div>

        <div class="quote-card-footer">
          <div class="card-tags">
            $tagsHtml
          </div>
        </div>
      </article>
"@
    }

    # 4. Generate complete HTML file structure
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

  <!-- JSON-LD Breadcrumb & Quotation Schema -->
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
    <section class="toolbar-section" style="margin-bottom:2.5rem;">
      <div class="toolbar-info" style="max-width:800px;">
        <h1 class="section-heading" style="margin-bottom:0.75rem;">$h1Text</h1>
        <p class="section-desc" style="font-size:1.05rem; line-height:1.6; color:var(--text-secondary); font-family:var(--font-sans);">
          $introText
        </p>
      </div>
      <div style="margin-top:1rem;">
        <a href="../../quotes.html" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Interactive Library
        </a>
      </div>
    </section>

    <section class="quotes-grid-container">
      <div class="quotes-grid">
        $quotesListHtml
      </div>
    </section>

    $siblingLinksHtml
  </main>

  <div id="toastContainer" class="toast-container"></div>

  <!-- Poster Studio Modal Wrapper -->
  <div class="modal-backdrop hidden" id="posterModal">
    <div class="poster-modal-container">
      <button class="close-modal-btn" id="closePosterModal"><i class="fa-solid fa-xmark"></i></button>
      <div class="poster-workspace">
        <div class="canvas-container">
          <canvas id="posterCanvas" width="1080" height="1350"></canvas>
          <div class="canvas-loader hidden" id="canvasLoader">
            <div class="loader-spinner"></div>
            <span>Loading backdrop...</span>
          </div>
        </div>
        <div class="poster-sidebar">
          <div class="sidebar-header">
            <h3>Poster Studio</h3>
            <p>Customize your quote graphic</p>
          </div>
          <div class="poster-controls-scroll">
            <div class="control-section">
              <label class="control-label"><i class="fa-solid fa-image"></i> Backdrop Preset</label>
              <div class="overlay-presets" id="overlayPresets">
                <button class="preset-chip active" data-overlay="light-glass">Light Glass</button>
                <button class="preset-chip" data-overlay="warm-sun">Terracotta Warm</button>
                <button class="preset-chip" data-overlay="soft-rose">Soft Clay</button>
                <button class="preset-chip" data-overlay="serene-teal">Serene Teal</button>
                <button class="preset-chip" data-overlay="dark-contrast">Dark Contrast</button>
              </div>
            </div>
            <div class="control-section">
              <label class="control-label"><i class="fa-solid fa-font"></i> Typography Style</label>
              <div class="font-presets" id="fontPresets">
                <button class="font-chip active" data-font="Cormorant Garamond">Classic Serif</button>
                <button class="font-chip" data-font="Georgia">Editorial Serif</button>
                <button class="font-chip" data-font="Outfit">Modern Clean</button>
                <button class="font-chip" data-font="Caveat">Handwritten</button>
              </div>
            </div>
            <div class="control-section">
              <label class="control-label"><i class="fa-solid fa-maximize"></i> Layout Aspect Ratio</label>
              <div class="ratio-presets" id="ratioSelector">
                <button class="ratio-chip active" data-ratio="portrait"><i class="fa-solid fa-mobile-screen"></i> Portrait (4:5)</button>
                <button class="ratio-chip" data-ratio="square"><i class="fa-solid fa-square"></i> Square (1:1)</button>
                <button class="ratio-chip" data-ratio="stories"><i class="fa-solid fa-crop-simple"></i> Stories (9:16)</button>
              </div>
            </div>
            <div class="control-section">
              <label class="control-label"><i class="fa-solid fa-magnifying-glass"></i> Search Backdrop (Pixabay)</label>
              <div class="pixabay-search-bar">
                <input type="text" id="pixabayQueryInput" placeholder="e.g. library, stars, morning...">
                <button id="btnSearchPixabay" class="mini-search-btn"><i class="fa-solid fa-search"></i></button>
              </div>
              <div class="pixabay-thumbs-grid" id="pixabayThumbs"></div>
            </div>
          </div>
          <button class="btn-download-poster" id="btnDownloadPoster"><i class="fa-solid fa-download"></i> Download Image</button>
        </div>
      </div>
    </div>
  </div>

  $footerHtml

  <script src="../../src/js/poster.js"></script>
  <script src="../../src/js/config.js"></script>`n  <script src="../../src/js/app.js"></script>
</body>
</html>
"@

        $catSlug = $catName.ToLower() -replace '_', '-' -replace ' & ', '-' -replace ' ', '-' -replace '[^\w-]', ''
    $outDir = Join-Path $quotesDir $catSlug
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    $outFilePath = Join-Path $outDir "$slug.html"
    [System.IO.File]::WriteAllText($outFilePath, $htmlContent, [System.Text.Encoding]::UTF8)
    $generatedCount++
}

# Add all generated category files to sitemap index
Write-Host "Appending category static pages to sitemap index..."
foreach ($dir in Get-ChildItem -Path $quotesDir -Directory) {
    foreach ($file in Get-ChildItem -Path $dir.FullName -Filter "*.html") {
        $fileSlug = $file.BaseName
        $catSlugFolder = $dir.Name
        $canonical = "https://quotebook.example.com/quotes/$catSlugFolder/$fileSlug.html"
    if (!$sitemapUrls.Contains($canonical)) {
        $sitemapUrls.Add($canonical)
    }
    }
}

# Process static authors page urls to sitemap index
$authorsDir = "authors"
if (Test-Path -Path $authorsDir) {
    foreach ($file in Get-ChildItem -Path $authorsDir -Filter "*.html") {
        $fileSlug = $file.BaseName
        $canonical = "https://quotebook.example.com/authors/$fileSlug.html"
        if (!$sitemapUrls.Contains($canonical)) {
            $sitemapUrls.Add($canonical)
        }
    }
}

# Re-generate sitemap.xml
Write-Host "Writing combined sitemap.xml..."
$sitemapXml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n"
foreach ($url in $sitemapUrls) {
    $priority = "0.7"
    if ($url.Contains("index.html")) { $priority = "1.0" }
    elseif ($url.Contains("quotes.html")) { $priority = "0.9" }
    $sitemapXml += "  <url>`n    <loc>$url</loc>`n    <lastmod>2026-07-24</lastmod>`n    <changefreq>weekly</changefreq>`n    <priority>$priority</priority>`n  </url>`n"
}
$sitemapXml += "</urlset>"
[System.IO.File]::WriteAllText($sitemapPath, $sitemapXml, [System.Text.Encoding]::UTF8)

Write-Host "Programmatic SEO page compilation finished!" -ForegroundColor Green
Write-Host "Generated: $generatedCount pages" -ForegroundColor Green
Write-Host "Skipped: $skippedCount pages" -ForegroundColor Yellow
