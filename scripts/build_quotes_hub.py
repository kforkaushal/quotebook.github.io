import json

with open('categories_list.json', 'r', encoding='utf-8-sig') as f:
    categories = json.load(f)

# Sort categories alphabetically
categories.sort(key=lambda x: x['Title'])

# Category icon mapper
icons = {
    'anniversary': 'fa-champagne-glasses',
    'attitude-savage': 'fa-fire',
    'birthday': 'fa-cake-candles',
    'breakup-heartbreak': 'fa-heart-crack',
    'congratulations': 'fa-award',
    'daily-affirmations': 'fa-sun',
    'encouragement': 'fa-hand-holding-heart',
    'family-bonds': 'fa-people-roof',
    'famous-quotes': 'fa-quote-left',
    'fitness-workout': 'fa-dumbbell',
    'food-cooking': 'fa-utensils',
    'friendship': 'fa-user-group',
    'funny': 'fa-face-laugh-beam',
    'good-morning': 'fa-cloud-sun',
    'good-night': 'fa-moon',
    'holiday': 'fa-calendar-days',
    'inspirational': 'fa-lightbulb',
    'instagram-captions': 'fa-camera',
    'linkedin-professional': 'fa-briefcase',
    'love': 'fa-heart',
    'motivation-hustle': 'fa-bolt',
    'pet-animal': 'fa-paw',
    'relationship-dating': 'fa-heart-pulse',
    'sad-emotional': 'fa-cloud-rain',
    'seasonal-events': 'fa-snowflake',
    'self-growth-mental-health': 'fa-brain',
    'sorry': 'fa-handshake',
    'spiritual-mindfulness': 'fa-om',
    'stoic-philosophy': 'fa-landmark',
    'student-education': 'fa-graduation-cap',
    'sympathy': 'fa-dove',
    'thank-you': 'fa-hands-praying',
    'tiktok-reels-quotes': 'fa-hashtag',
    'travel-adventure': 'fa-compass',
    'wedding': 'fa-ring',
    'whatsapp-status': 'fa-comment-dots',
    'writing-literature': 'fa-book-open'
}

cards_html = []
for cat in categories:
    slug = cat['Slug']
    title = cat['Title']
    count = cat['Count']
    icon = icons.get(slug, 'fa-quote-right')
    
    # Subpage chips (up to 4)
    chips = []
    for p in cat['Pages'][:4]:
        chips.append(f'<a href="{p["File"]}" class="subtopic-chip">{p["Name"]}</a>')
    
    more_count = count - 4
    if more_count > 0:
        first_page = cat['Pages'][0]['File']
        chips.append(f'<a href="{first_page}" class="subtopic-more">+{more_count} more</a>')
        
    chips_html = "".join(chips)
    primary_link = cat['Pages'][0]['File'] if cat['Pages'] else "#"
    
    cards_html.append(f'''      <div class="category-card" data-title="{title.lower()}">
        <div class="cat-card-header">
          <div class="cat-icon-badge"><i class="fa-solid {icon}"></i></div>
          <div class="cat-meta">
            <h2 class="cat-title"><a href="{primary_link}">{title}</a></h2>
            <span class="cat-pages-count">{count} curated collections</span>
          </div>
        </div>
        <div class="subtopics-wrap">
          {chips_html}
        </div>
      </div>''')

all_cards = "\n".join(cards_html)

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9227354288966999" crossorigin="anonymous"></script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-P7WSN8P37J');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../src/css/style.css">
  <link rel="icon" type="image/png" sizes="32x32" href="../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../data/img/android-chrome-512x512.png">

  <title>Quotes by Category &amp; Topic Directory | Quotebook</title>
  <meta name="description" content="Explore over 290+ curated quote collections across 37 themes. Browse love, motivation, stoicism, attitude, friendship, life quotes, and more on Quotebook.">
  <link rel="canonical" href="https://quotebook.me/quotes/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Quotes by Category &amp; Topic Directory | Quotebook">
  <meta property="og:description" content="Explore over 290+ curated quote collections across 37 themes on Quotebook.">
  <meta property="og:url" content="https://quotebook.me/quotes/">
  <meta property="og:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Quotes by Category &amp; Topic Directory | Quotebook">
  <meta name="twitter:description" content="Explore over 290+ curated quote collections across 37 themes on Quotebook.">
  <meta name="twitter:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Schema.org -->
  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Quotes Directory", "item": "https://quotebook.me/quotes/" }}
      ]
    }},
    {{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Quotes by Category Directory",
      "description": "Explore over 290 curated quote collections organized across 37 distinct categories.",
      "url": "https://quotebook.me/quotes/"
    }}
  ]
  </script>

  <style>
    .quotes-hub {{ max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }}
    .hub-header {{ text-align: center; margin-bottom: 3rem; }}
    .hub-badge {{ display: inline-flex; align-items: center; gap: 0.5rem; background: var(--orange-100); color: var(--orange-700); padding: 0.35rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }}
    .hub-title {{ font-family: var(--font-serif); font-size: clamp(2.2rem, 5vw, 3.4rem); color: var(--text-primary); margin-bottom: 1rem; font-weight: 700; }}
    .hub-desc {{ font-family: var(--font-sans); color: var(--text-secondary); max-width: 700px; margin: 0 auto 2rem; font-size: 1.1rem; line-height: 1.6; }}

    .hub-search-bar {{ max-width: 540px; margin: 0 auto 2.5rem; position: relative; }}
    .hub-search-input {{ width: 100%; padding: 0.9rem 1.25rem 0.9rem 3rem; border: 1.5px solid var(--border-medium); border-radius: var(--radius-pill); font-family: var(--font-sans); font-size: 1rem; background: var(--surface-card); color: var(--text-primary); outline: none; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }}
    .hub-search-input:focus {{ border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15); }}
    .hub-search-icon {{ position: absolute; left: 1.15rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.05rem; }}

    .popular-banner {{ background: linear-gradient(135deg, var(--teal-900), var(--teal-700)); border-radius: var(--radius-lg); padding: 2.2rem 2.5rem; color: #fff; margin-bottom: 3.5rem; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; box-shadow: var(--shadow-md); }}
    .popular-content {{ max-width: 650px; }}
    .popular-tag {{ display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.2); padding: 0.3rem 0.85rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }}
    .popular-title {{ font-family: var(--font-serif); font-size: 1.85rem; margin-bottom: 0.5rem; font-weight: 700; color: #fff; }}
    .popular-text {{ font-size: 0.95rem; color: rgba(255,255,255,0.85); line-height: 1.6; margin: 0; }}
    .popular-btn {{ display: inline-flex; align-items: center; gap: 0.6rem; background: #fff; color: var(--teal-900); padding: 0.85rem 1.6rem; border-radius: var(--radius-pill); text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: transform var(--transition-fast), box-shadow var(--transition-fast); flex-shrink: 0; }}
    .popular-btn:hover {{ transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }}

    .categories-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.75rem; }}
    .category-card {{ background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; transition: transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-smooth); }}
    .category-card:hover {{ transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--accent-primary); }}
    .cat-card-header {{ display: flex; align-items: center; gap: 1rem; }}
    .cat-icon-badge {{ width: 50px; height: 50px; border-radius: 12px; background: linear-gradient(135deg, var(--orange-100), var(--orange-50)); color: var(--orange-700); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; }}
    .cat-meta {{ display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }}
    .cat-title {{ font-family: var(--font-serif); font-size: 1.35rem; font-weight: 700; margin: 0; color: var(--text-primary); }}
    .cat-title a {{ text-decoration: none; color: inherit; transition: color var(--transition-fast); }}
    .cat-title a:hover {{ color: var(--accent-primary); }}
    .cat-pages-count {{ font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }}

    .subtopics-wrap {{ display: flex; flex-wrap: wrap; gap: 0.5rem; }}
    .subtopic-chip {{ display: inline-flex; align-items: center; padding: 0.35rem 0.85rem; border-radius: var(--radius-pill); font-size: 0.85rem; text-decoration: none; background: var(--paper-100); color: var(--text-secondary); border: 1px solid var(--border-light); transition: all var(--transition-fast); }}
    .subtopic-chip:hover {{ background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }}
    .subtopic-more {{ display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 600; text-decoration: none; background: transparent; color: var(--accent-primary); border: 1px dashed var(--accent-primary); }}
    .subtopic-more:hover {{ background: var(--orange-50); }}

    @media (max-width: 768px) {{
      .quotes-hub {{ padding: 1.5rem 1rem 3rem; }}
      .categories-grid {{ grid-template-columns: 1fr; }}
      .popular-banner {{ padding: 1.75rem; flex-direction: column; align-items: flex-start; }}
    }}
  </style>
</head>
<body class="light-theme page-loaded">

  <!-- App Header -->
  <header class="app-header">
    <div class="header-container">
      <a href="/" class="brand-logo" id="brandLogo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle" id="quoteCountBadge">Timeless Wisdom &amp; Art</span>
        </div>
      </a>
      <div class="header-actions" id="headerActions">
        <a href="/" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="/quotes.html" class="icon-btn-text highlight" title="Explore Quotes">
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
        <a href="/" class="drawer-item">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="/quotes.html" class="drawer-item highlight">
          <i class="fa-solid fa-compass"></i>
          <span>Explore 1 Million+ Quotes</span>
        </a>
        <a href="/poster.html" class="drawer-item">
          <i class="fa-solid fa-palette"></i>
          <span>Poster Studio</span>
        </a>
        <a href="/quotes/" class="drawer-item active">
          <i class="fa-solid fa-folder-open"></i>
          <span>Categories</span>
        </a>
        <a href="/authors/" class="drawer-item">
          <i class="fa-solid fa-users"></i>
          <span>Authors A–Z</span>
        </a>
      </div>
    </nav>
  </header>

  <main class="quotes-hub">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb" style="margin-bottom: 2rem;">
      <a href="/" style="color:var(--text-secondary); text-decoration:none;"><i class="fa-solid fa-house"></i> Home</a>
      <span class="breadcrumb-separator" style="margin: 0 0.5rem; color:var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="breadcrumb-current" style="color:var(--text-primary); font-weight:600;">Quotes Directory</span>
    </nav>

    <div class="hub-header">
      <span class="hub-badge"><i class="fa-solid fa-layer-group"></i> 37 Curated Categories</span>
      <h1 class="hub-title">Browse Quotes by Category</h1>
      <p class="hub-desc">Discover inspiring wisdom, love notes, stoic philosophy, workout motivation, and everyday affirmations across 290+ dedicated collection pages.</p>
      
      <div class="hub-search-bar">
        <i class="fa-solid fa-magnifying-glass hub-search-icon"></i>
        <input type="text" id="categorySearch" class="hub-search-input" placeholder="Search categories (e.g. Love, Stoic, Motivation, Attitude)..." autocomplete="off">
      </div>
    </div>

    <!-- Popular Quotes Banner -->
    <div class="popular-banner">
      <div class="popular-content">
        <span class="popular-tag"><i class="fa-solid fa-fire"></i> Most Read</span>
        <h2 class="popular-title">100 Most Popular Quotes of All Time</h2>
        <p class="popular-text">From Einstein and Steve Jobs to Maya Angelou and Rumi, explore the top 100 most famous, shared, and enduring quotes in history.</p>
      </div>
      <a href="popular-quotes.html" class="popular-btn">
        <span>Explore Top 100</span>
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>

    <!-- Categories Grid -->
    <div class="categories-grid" id="categoriesContainer">
{all_cards}
    </div>
  </main>

  <!-- Global Footer -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
          <span class="logo-title">Quotebook</span>
        </div>
        <p>A modern editorial web application for discovering quotes, listening aloud, and generating canvas posters with Pixabay photography.</p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4>Navigation</h4>
          <a href="/">Home</a>
          <a href="/quotes.html">Quotes Library</a>
          <a href="/poster.html">Poster Studio</a>
          <a href="/quotes/">Browse Categories</a>
          <a href="/authors/">Browse Authors</a>
          <a href="/about.html">About Us</a>
          <a href="/contact.html">Contact Us</a>
        </div>

        <div class="footer-col">
          <h4>Popular Topics</h4>
          <a href="/quotes/popular-quotes.html">Popular Quotes</a>
          <a href="/quotes/stoic-philosophy/stoic-philosophy-wisdom.html">Wisdom</a>
          <a href="/quotes/stoic-philosophy/stoic-philosophy-general.html">Philosophy</a>
          <a href="/quotes/love/love-general.html">Love</a>
          <a href="/quotes/motivation-hustle/motivation-hustle-success-mindset.html">Motivation</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>

  <script>
    // Live Search Filter for Categories
    const searchInput = document.getElementById('categorySearch');
    const cards = document.querySelectorAll('.category-card');

    searchInput.addEventListener('input', (e) => {{
      const q = e.target.value.toLowerCase().trim();
      cards.forEach(card => {{
        const title = card.dataset.title;
        if (!q || title.includes(q)) {{
          card.style.display = 'flex';
        }} else {{
          card.style.display = 'none';
        }}
      }});
    }});
  </script>
</body>
</html>
'''

with open('quotes/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('quotes/index.html generated successfully!')
