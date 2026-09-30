import os
import glob

categories = []
for d in sorted(glob.glob('quotes/*')):
    if os.path.isdir(d):
        slug = os.path.basename(d)
        title = slug.replace('-', ' ').title()
        files = sorted(glob.glob(os.path.join(d, '*.html')))
        pages = []
        for f in files:
            p_base = os.path.basename(f)
            p_name = p_base.replace(slug + '-', '').replace('.html', '').replace('-', ' ').title()
            pages.append({'File': f'{slug}/{p_base}', 'Name': p_name})
        categories.append({
            'Slug': slug,
            'Title': title,
            'Count': len(files),
            'Pages': pages
        })

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
    .quotes-hub {{ max-width: 1380px; margin: 0 auto; padding: 1.5rem 1.5rem 5rem; }}
    .hub-header {{ text-align: center; margin-bottom: 3rem; max-width: 820px; margin-left: auto; margin-right: auto; }}
    .hub-badge {{ display: inline-flex; align-items: center; gap: 0.5rem; background: var(--orange-50); color: var(--orange-700); border: 1px solid var(--orange-100); padding: 0.4rem 1.15rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 700; margin-bottom: 1.25rem; }}
    .hub-title {{ font-family: var(--font-serif); font-size: clamp(2.4rem, 5vw, 3.6rem); color: var(--text-primary); margin-bottom: 1rem; font-weight: 700; line-height: 1.15; }}
    .hub-desc {{ font-family: var(--font-sans); color: var(--text-secondary); font-size: 1.15rem; line-height: 1.65; margin-bottom: 2rem; }}

    .hub-search-bar {{ max-width: 580px; margin: 0 auto 2.5rem; position: relative; }}
    .hub-search-input {{ width: 100%; padding: 0.95rem 1.25rem 0.95rem 3.25rem; border: 1.5px solid var(--border-light); border-radius: var(--radius-pill); font-family: var(--font-sans); font-size: 1.05rem; background: var(--surface-card); color: var(--text-primary); outline: none; box-shadow: var(--shadow-sm); transition: all var(--transition-fast); }}
    .hub-search-input:focus {{ border-color: var(--accent-primary); box-shadow: 0 0 0 4px rgba(193, 89, 44, 0.12); }}
    .hub-search-icon {{ position: absolute; left: 1.35rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.1rem; }}

    .popular-banner {{ background: linear-gradient(135deg, var(--teal-700), #0d2e2d); border-radius: var(--radius-lg); padding: 2.2rem 2.5rem; color: #fff; margin-bottom: 3.5rem; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; box-shadow: var(--shadow-md); }}
    .popular-content {{ max-width: 650px; }}
    .popular-tag {{ display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.2); padding: 0.3rem 0.85rem; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }}
    .popular-title {{ font-family: var(--font-serif); font-size: 1.85rem; margin-bottom: 0.5rem; font-weight: 700; color: #fff; }}
    .popular-text {{ font-size: 0.95rem; color: rgba(255,255,255,0.85); line-height: 1.6; margin: 0; }}
    .popular-btn {{ display: inline-flex; align-items: center; gap: 0.6rem; background: #fff; color: var(--teal-700); padding: 0.85rem 1.6rem; border-radius: var(--radius-pill); text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: transform var(--transition-fast), box-shadow var(--transition-fast); flex-shrink: 0; }}
    .popular-btn:hover {{ transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }}

    .categories-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.75rem; }}
    .category-card {{ background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; box-shadow: var(--shadow-sm); transition: transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-smooth); }}
    .category-card:hover {{ transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--accent-primary); }}
    .cat-card-header {{ display: flex; align-items: center; gap: 1rem; }}
    .cat-icon-badge {{ width: 50px; height: 50px; border-radius: 14px; background: var(--orange-50); color: var(--orange-700); border: 1px solid var(--orange-100); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; }}
    .cat-meta {{ display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }}
    .cat-title {{ font-family: var(--font-serif); font-size: 1.35rem; font-weight: 700; margin: 0; color: var(--text-primary); }}
    .cat-title a {{ text-decoration: none; color: inherit; transition: color var(--transition-fast); }}
    .cat-title a:hover {{ color: var(--accent-primary); }}
    .cat-pages-count {{ font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }}

    .subtopics-wrap {{ display: flex; flex-wrap: wrap; gap: 0.5rem; }}
    .subtopic-chip {{ display: inline-flex; align-items: center; padding: 0.4rem 0.9rem; border-radius: var(--radius-pill); font-size: 0.85rem; text-decoration: none; background: var(--paper-100); color: var(--text-secondary); border: 1px solid var(--border-light); transition: all var(--transition-fast); }}
    .subtopic-chip:hover {{ background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }}
    .subtopic-more {{ display: inline-flex; align-items: center; padding: 0.4rem 0.85rem; border-radius: var(--radius-pill); font-size: 0.82rem; font-weight: 600; text-decoration: none; background: transparent; color: var(--accent-primary); border: 1px dashed var(--accent-primary); }}
    .subtopic-more:hover {{ background: var(--orange-50); }}

    @media (max-width: 768px) {{
      .quotes-hub {{ padding: 1.5rem 1rem 3rem; }}
      .categories-grid {{ grid-template-columns: 1fr; }}
      .popular-banner {{ padding: 1.75rem; flex-direction: column; align-items: flex-start; }}
      .mobile-menu-toggle {{
        display: flex !important;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        font-size: 1.4rem;
        color: var(--text-primary);
        cursor: pointer;
        padding: 0.5rem;
      }}
      .header-actions {{
        display: none !important;
      }}
      .home-nav-links {{
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: var(--surface-header);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border-light);
        display: flex;
        flex-direction: column;
        padding: 1.25rem 1.5rem;
        gap: 1rem;
        box-shadow: var(--shadow-lg);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(-8px);
        transition: all var(--transition-smooth);
        z-index: 1000;
      }}
      .home-nav-links.active {{
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }}
      .home-nav-links .nav-link {{
        font-size: 1.05rem;
        padding: 0.4rem 0;
        color: var(--text-primary);
        font-weight: 500;
      }}
      .home-nav-links .nav-link.active {{
        color: var(--accent-primary);
        font-weight: 700;
      }}
      .mobile-only-cta {{
        display: inline-flex !important;
        justify-content: center;
        align-items: center;
        background: var(--accent-primary);
        color: #ffffff !important;
        padding: 0.75rem 1.25rem !important;
        border-radius: var(--radius-pill);
        font-weight: 600 !important;
        margin-top: 0.5rem;
        text-align: center;
      }}
    }}
  </style>
</head>
<body class="light-theme home-page page-loaded">

  <!-- App Header -->
  <header class="app-header">
    <div class="header-container">
      <a href="../index.html" class="brand-logo" id="brandLogo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle" id="quoteCountBadge">Timeless Wisdom &amp; Art</span>
        </div>
      </a>

      <!-- Burger Menu Toggle Button for Mobile -->
      <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle Navigation Menu" aria-expanded="false">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>

      <!-- Header Navigation Links -->
      <nav class="home-nav-links" id="homeNavLinks">
        <a href="../index.html" class="nav-link">Home</a>
        <a href="../quotes.html" class="nav-link">Explore Quotes</a>
        <a href="index.html" class="nav-link active">Categories</a>
        <a href="../authors/index.html" class="nav-link">Authors</a>
        <a href="../poster.html" class="nav-link">Poster Studio</a>
        <a href="../blog/index.html" class="nav-link">Blog</a>
        <a href="../quotes.html" class="nav-link mobile-only-cta">Explore 1 Million+ Quotes</a>
      </nav>

      <div class="header-actions" id="headerActions">
        <a href="../quotes.html" class="cta-header-btn">
          <span>Explore 1 Million+ Quotes</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </header>

  <main class="quotes-hub">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <a href="../index.html"><i class="fa-solid fa-house"></i> Home</a>
      <span class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="breadcrumb-current">Quotes Directory</span>
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
          <a href="../index.html">Home</a>
          <a href="../quotes.html">Quotes Library</a>
          <a href="index.html">Browse Categories</a>
          <a href="../authors/index.html">Browse Authors</a>
          <a href="../poster.html">Poster Studio</a>
          <a href="../about.html">About Us</a>
          <a href="../contact.html">Contact Us</a>
        </div>

        <div class="footer-col">
          <h4>Popular Topics</h4>
          <a href="popular-quotes.html">Popular Quotes</a>
          <a href="stoic-philosophy/stoic-philosophy-wisdom.html">Wisdom</a>
          <a href="stoic-philosophy/stoic-philosophy-general.html">Philosophy</a>
          <a href="love/love-general.html">Love</a>
          <a href="motivation-hustle/motivation-hustle-success-mindset.html">Motivation</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', () => {{
      // Mobile Navigation Menu Toggle
      const mobileMenuToggle = document.getElementById('mobileMenuToggle');
      const homeNavLinks = document.getElementById('homeNavLinks');

      if (mobileMenuToggle && homeNavLinks) {{
        mobileMenuToggle.addEventListener('click', (e) => {{
          e.stopPropagation();
          const isActive = homeNavLinks.classList.toggle('active');
          mobileMenuToggle.classList.toggle('active', isActive);
          mobileMenuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        }});

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {{
          if (!homeNavLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {{
            homeNavLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
          }}
        }});

        // Close menu when clicking any nav link
        homeNavLinks.querySelectorAll('.nav-link').forEach(link => {{
          link.addEventListener('click', () => {{
            homeNavLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
          }});
        }});
      }}

      // Live Search Filter for Categories
      const searchInput = document.getElementById('categorySearch');
      const cards = document.querySelectorAll('.category-card');

      if (searchInput) {{
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
      }}
    }});
  </script>
</body>
</html>
'''

with open('quotes/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('quotes/index.html generated successfully!')
