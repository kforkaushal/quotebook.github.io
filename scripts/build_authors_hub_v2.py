import os
import glob
import re
import json

# Find all author files
files = glob.glob('authors/*.html')
authors = []

for path in files:
    fname = os.path.basename(path)
    if fname == 'index.html':
        continue
    
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Extract H1 name
    m_h1 = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE)
    raw_name = m_h1.group(1).replace(' Quotes', '').strip() if m_h1 else fname.replace('.html', '').replace('-', ' ').title()
    
    # Clean up name and subtitle
    clean_name = raw_name
    subtitle = ""
    if ',' in raw_name and len(raw_name) > 25:
        parts = raw_name.split(',', 1)
        clean_name = parts[0].strip()
        subtitle = parts[1].strip()
        if len(subtitle) > 40:
            subtitle = subtitle[:37] + "..."
    elif ' - ' in raw_name:
        parts = raw_name.split(' - ', 1)
        clean_name = parts[0].strip()
        subtitle = parts[1].strip()
    
    # Extract quote count
    m_count = re.search(r'of\s+([0-9]+)\s+total', content, re.IGNORECASE)
    count = int(m_count.group(1)) if m_count else 0
    
    # Extract initials
    name_parts = clean_name.replace('.', ' ').split()
    if len(name_parts) >= 2:
        initials = (name_parts[0][0] + name_parts[-1][0]).upper()
    elif len(name_parts) == 1 and len(name_parts[0]) >= 2:
        initials = name_parts[0][:2].upper()
    else:
        initials = "AU"
        
    authors.append({
        'file': fname,
        'name': clean_name,
        'raw_name': raw_name,
        'subtitle': subtitle,
        'count': count,
        'initials': initials
    })

# Sort authors alphabetically
authors.sort(key=lambda x: x['name'].upper())

# Group by first letter
grouped = {}
for a in authors:
    first_char = a['name'][0].upper()
    if not first_char.isalpha():
        first_char = '#'
    if first_char not in grouped:
        grouped[first_char] = []
    grouped[first_char].append(a)

alphabet = sorted([k for k in grouped.keys() if k != '#'])
if '#' in grouped:
    alphabet.append('#')

# Palette for author avatar initials (matching theme tokens)
color_classes = [
    'avatar-terracotta',
    'avatar-teal',
    'avatar-amber',
    'avatar-navy',
    'avatar-sage',
    'avatar-crimson'
]

# Generate Alphabet Pills
alpha_pills_list = ['<button class="alpha-pill active" data-letter="all">All</button>']
for l in alphabet:
    alpha_pills_list.append(f'<button class="alpha-pill" data-letter="{l}">{l}</button>')
alpha_pills_html = "\n        ".join(alpha_pills_list)

# Generate Author Sections
sections_list = []
color_idx = 0

for letter in alphabet:
    auth_list = grouped[letter]
    cards_list = []
    for a in auth_list:
        c_class = color_classes[color_idx % len(color_classes)]
        color_idx += 1
        
        count_display = f"{a['count']} Quotes" if a['count'] > 0 else "View Quotes"
        sub_html = f'<span class="author-subtext">{a["subtitle"]}</span>' if a['subtitle'] else ""
        
        cards_list.append(f'''          <a href="{a['file']}" class="author-item-card" data-name="{a['name'].lower()} {a['subtitle'].lower()}">
            <div class="author-card-avatar {c_class}">{a['initials']}</div>
            <div class="author-card-content">
              <span class="author-card-name">{a['name']}</span>
              {sub_html}
              <span class="author-card-count"><i class="fa-solid fa-quote-left"></i> {count_display}</span>
            </div>
            <div class="author-card-arrow"><i class="fa-solid fa-chevron-right"></i></div>
          </a>''')
    
    cards_str = "\n".join(cards_list)
    sections_list.append(f'''      <section class="alpha-group-section" id="group-{letter}" data-group="{letter}">
        <div class="alpha-group-header">
          <div class="alpha-group-badge">{letter}</div>
          <span class="alpha-group-meta">{len(auth_list)} Author{'s' if len(auth_list) != 1 else ''}</span>
        </div>
        <div class="author-items-grid">
{cards_str}
        </div>
      </section>''')

all_sections_html = "\n".join(sections_list)

# Top Spotlight Authors
spotlight_slugs = [
    'mahatma-gandhi.html',
    'albert-einstein.html',
    'steve-jobs.html',
    'abdul-kalam.html',
    'rumi.html',
    'oscar-wilde.html',
    'abraham-lincoln.html',
    'maya-angelou.html'
]

spotlight_items = []
for slug in spotlight_slugs:
    match = next((a for a in authors if a['file'] == slug), None)
    if match:
        spotlight_items.append(match)

spotlight_cards = []
for i, sp in enumerate(spotlight_items):
    c_class = color_classes[i % len(color_classes)]
    spotlight_cards.append(f'''        <a href="{sp['file']}" class="spotlight-card">
          <div class="spotlight-avatar {c_class}">{sp['initials']}</div>
          <div class="spotlight-details">
            <span class="spotlight-name">{sp['name']}</span>
            <span class="spotlight-count"><i class="fa-solid fa-quote-left"></i> {sp['count']} Quotes</span>
          </div>
          <i class="fa-solid fa-arrow-up-right-from-square spotlight-icon"></i>
        </a>''')

spotlight_html = "\n".join(spotlight_cards)

html_page = f'''<!DOCTYPE html>
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

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../src/css/style.css">

  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../data/img/android-chrome-512x512.png">

  <!-- SEO Metadata -->
  <title>Famous Quote Authors A–Z Directory | Quotebook</title>
  <meta name="description" content="Browse 100+ famous thinkers, philosophers, leaders, and writers. Discover timeless quotes by Mahatma Gandhi, Albert Einstein, Steve Jobs, Rumi, and more.">
  <meta name="keywords" content="quote authors, famous authors, philosophers, famous thinkers, Mahatma Gandhi quotes, Albert Einstein quotes, Steve Jobs quotes, Rumi quotes">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://quotebook.me/authors/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Quotebook">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="Famous Quote Authors A–Z Directory | Quotebook">
  <meta property="og:description" content="Browse 100+ famous thinkers, philosophers, leaders, and writers on Quotebook.">
  <meta property="og:url" content="https://quotebook.me/authors/">
  <meta property="og:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@quotebookme">
  <meta name="twitter:title" content="Famous Quote Authors A–Z Directory | Quotebook">
  <meta name="twitter:description" content="Browse 100+ famous thinkers, philosophers, leaders, and writers on Quotebook.">
  <meta name="twitter:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Schema.org -->
  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Authors Directory", "item": "https://quotebook.me/authors/" }}
      ]
    }},
    {{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Famous Quote Authors Directory",
      "description": "Explore timeless quotes organized by over 100 celebrated authors, philosophers, and leaders.",
      "url": "https://quotebook.me/authors/"
    }}
  ]
  </script>

  <style>
    /* Authors Directory Theme-Matched Styles */
    .authors-page-layout {{
      padding-top: 1.5rem;
      padding-bottom: 5rem;
    }}

    /* Hero Editorial Header */
    .authors-hero-header {{
      text-align: center;
      margin-bottom: 2.75rem;
      max-width: 820px;
      margin-left: auto;
      margin-right: auto;
    }}
    .authors-badge {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--orange-50);
      color: var(--orange-700);
      border: 1px solid var(--orange-100);
      padding: 0.4rem 1.15rem;
      border-radius: var(--radius-pill);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 1.25rem;
    }}
    .authors-hero-title {{
      font-family: var(--font-serif);
      font-size: clamp(2.4rem, 5vw, 3.6rem);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.15;
      margin-bottom: 1rem;
    }}
    .authors-hero-desc {{
      font-family: var(--font-sans);
      color: var(--text-secondary);
      font-size: 1.15rem;
      line-height: 1.65;
      margin-bottom: 2rem;
    }}

    /* Search Input Bar */
    .authors-search-wrap {{
      max-width: 580px;
      margin: 0 auto;
      position: relative;
    }}
    .authors-search-input {{
      width: 100%;
      padding: 0.95rem 3rem 0.95rem 3.25rem;
      border: 1.5px solid var(--border-light);
      border-radius: var(--radius-pill);
      font-family: var(--font-sans);
      font-size: 1.05rem;
      background: var(--surface-card);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
      outline: none;
      transition: all var(--transition-fast);
    }}
    .authors-search-input:focus {{
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 4px rgba(193, 89, 44, 0.12);
    }}
    .search-icon-left {{
      position: absolute;
      left: 1.35rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 1.1rem;
      pointer-events: none;
    }}
    .search-clear-btn {{
      position: absolute;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 0.4rem;
      display: none;
      border-radius: 50%;
    }}
    .search-clear-btn:hover {{
      color: var(--text-primary);
    }}
    .search-live-status {{
      margin-top: 0.75rem;
      font-size: 0.88rem;
      color: var(--text-muted);
      font-weight: 500;
    }}

    /* Bento Spotlight Section */
    .spotlight-section {{
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 2rem 2.25rem;
      margin-bottom: 3.5rem;
      box-shadow: var(--shadow-sm);
    }}
    .spotlight-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }}
    .spotlight-title {{
      font-family: var(--font-serif);
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }}
    .spotlight-title i {{
      color: var(--accent-primary);
    }}
    .spotlight-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.1rem;
    }}
    .spotlight-card {{
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--paper-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 1rem 1.15rem;
      text-decoration: none;
      color: inherit;
      transition: all var(--transition-fast);
    }}
    .spotlight-card:hover {{
      background: #ffffff;
      border-color: var(--accent-primary);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }}
    .spotlight-avatar {{
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
      color: #ffffff;
    }}
    .spotlight-details {{
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
      flex: 1;
    }}
    .spotlight-name {{
      font-family: var(--font-serif);
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .spotlight-count {{
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }}
    .spotlight-count i {{
      font-size: 0.75rem;
      color: var(--accent-primary);
    }}
    .spotlight-icon {{
      font-size: 0.85rem;
      color: var(--text-muted);
      opacity: 0.6;
      transition: transform var(--transition-fast), color var(--transition-fast);
    }}
    .spotlight-card:hover .spotlight-icon {{
      transform: translate(2px, -2px);
      color: var(--accent-primary);
      opacity: 1;
    }}

    /* Sticky Alphabet Jump Bar */
    .alpha-sticky-container {{
      position: sticky;
      top: 4.8rem;
      z-index: 40;
      margin-bottom: 3.5rem;
      background: rgba(250, 246, 240, 0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-pill);
      padding: 0.5rem 0.75rem;
      box-shadow: var(--shadow-sm);
    }}
    .alpha-nav-scroll {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding: 0.15rem;
    }}
    .alpha-nav-scroll::-webkit-scrollbar {{
      display: none;
    }}
    .alpha-pill {{
      min-width: 34px;
      height: 34px;
      padding: 0 0.5rem;
      border-radius: var(--radius-pill);
      background: transparent;
      border: 1px solid transparent;
      font-family: var(--font-sans);
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }}
    .alpha-pill:hover {{
      background: var(--paper-100);
      color: var(--text-primary);
    }}
    .alpha-pill.active {{
      background: var(--accent-primary);
      color: #ffffff;
      border-color: var(--accent-primary);
      box-shadow: 0 2px 8px rgba(193, 89, 44, 0.3);
    }}

    /* Author Group Sections */
    .alpha-group-section {{
      margin-bottom: 4rem;
      scroll-margin-top: 9.5rem;
    }}
    .alpha-group-header {{
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--border-light);
      padding-bottom: 0.65rem;
    }}
    .alpha-group-badge {{
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--orange-50);
      color: var(--accent-primary);
      border: 1.5px solid var(--orange-100);
      font-family: var(--font-serif);
      font-size: 1.6rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .alpha-group-meta {{
      font-family: var(--font-sans);
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.02em;
    }}

    /* Authors Grid */
    .author-items-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.25rem;
    }}
    .author-item-card {{
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.4rem;
      text-decoration: none;
      color: inherit;
      display: flex;
      align-items: center;
      gap: 1.1rem;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      position: relative;
    }}
    .author-item-card:hover {{
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent-primary);
    }}
    .author-card-avatar {{
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: 1.05rem;
      flex-shrink: 0;
      color: #ffffff;
      transition: transform var(--transition-fast);
    }}
    .author-item-card:hover .author-card-avatar {{
      transform: scale(1.06);
    }}
    .author-card-content {{
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
      flex: 1;
    }}
    .author-card-name {{
      font-family: var(--font-serif);
      font-size: 1.22rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }}
    .author-subtext {{
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-style: italic;
    }}
    .author-card-count {{
      font-size: 0.82rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.15rem;
    }}
    .author-card-count i {{
      color: var(--accent-primary);
      font-size: 0.75rem;
    }}
    .author-card-arrow {{
      color: var(--border-light);
      font-size: 0.95rem;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }}
    .author-item-card:hover .author-card-arrow {{
      color: var(--accent-primary);
      transform: translateX(4px);
    }}

    /* Avatar Themes */
    .avatar-terracotta {{ background: linear-gradient(135deg, #C1592C, #8C3D1D); }}
    .avatar-teal {{ background: linear-gradient(135deg, #165b59, #12403F); }}
    .avatar-amber {{ background: linear-gradient(135deg, #d97706, #b45309); }}
    .avatar-navy {{ background: linear-gradient(135deg, #2563eb, #1d4ed8); }}
    .avatar-sage {{ background: linear-gradient(135deg, #059669, #047857); }}
    .avatar-crimson {{ background: linear-gradient(135deg, #e11d48, #be123c); }}

    /* Empty Search State */
    .search-empty-state {{
      display: none;
      text-align: center;
      padding: 4rem 1.5rem;
      background: var(--surface-card);
      border: 1px dashed var(--border-medium);
      border-radius: var(--radius-lg);
      margin: 2rem 0;
    }}
    .search-empty-icon {{
      font-size: 3rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      opacity: 0.6;
    }}
    .search-empty-title {{
      font-family: var(--font-serif);
      font-size: 1.6rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }}
    .search-empty-text {{
      color: var(--text-secondary);
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }}
    .btn-reset-search {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--accent-primary);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.5rem;
      border-radius: var(--radius-pill);
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: background var(--transition-fast);
    }}
    .btn-reset-search:hover {{
      background: var(--accent-primary-hover);
    }}

    /* Mobile Responsive Header & Nav Drawer */
    @media (max-width: 768px) {{
      .authors-hero-title {{ font-size: 2.2rem; }}
      .alpha-sticky-container {{ top: 4.2rem; padding: 0.4rem; }}
      .author-items-grid {{ grid-template-columns: 1fr; }}
      .spotlight-grid {{ grid-template-columns: 1fr; }}
      .spotlight-section {{ padding: 1.5rem; }}
      
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

  <!-- Header Navigation -->
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
        <a href="../quotes/index.html" class="nav-link">Categories</a>
        <a href="index.html" class="nav-link active">Authors</a>
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

  <!-- Main Container -->
  <main class="main-container authors-page-layout">
    
    <!-- Standard Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <a href="../index.html"><i class="fa-solid fa-house"></i> Home</a>
      <span class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="breadcrumb-current">Authors Directory</span>
    </nav>

    <!-- Hero Editorial Header -->
    <section class="authors-hero-header">
      <div class="authors-badge">
        <i class="fa-solid fa-feather-pointed"></i> Curated Thinkers &amp; Writers
      </div>
      <h1 class="authors-hero-title">Famous Authors A–Z</h1>
      <p class="authors-hero-desc">
        Explore words of enduring wisdom from {len(authors)} celebrated philosophers, historical icons, scientists, and novelists across human history.
      </p>

      <!-- Search Input -->
      <div class="authors-search-wrap">
        <i class="fa-solid fa-magnifying-glass search-icon-left"></i>
        <input type="text" id="authorsSearchInput" class="authors-search-input" placeholder="Search authors by name (e.g. Gandhi, Einstein, Jobs)..." autocomplete="off">
        <button id="clearSearchBtn" class="search-clear-btn" aria-label="Clear Search"><i class="fa-solid fa-xmark"></i></button>
        <div class="search-live-status" id="searchLiveStatus">Showing all {len(authors)} authors</div>
      </div>
    </section>

    <!-- Top Spotlight Bento -->
    <section class="spotlight-section" id="spotlightSection">
      <div class="spotlight-header">
        <h2 class="spotlight-title">
          <i class="fa-solid fa-star"></i> Most Read Thinkers
        </h2>
      </div>
      <div class="spotlight-grid">
{spotlight_html}
      </div>
    </section>

    <!-- Sticky Alphabet Jump Bar -->
    <nav class="alpha-sticky-container" aria-label="Alphabet Index">
      <div class="alpha-nav-scroll" id="alphaNav">
        {alpha_pills_html}
      </div>
    </nav>

    <!-- Empty Search State -->
    <div class="search-empty-state" id="searchEmptyState">
      <i class="fa-solid fa-user-slash search-empty-icon"></i>
      <h2 class="search-empty-title">No Authors Found</h2>
      <p class="search-empty-text">We couldn't find any author matching your search query.</p>
      <button class="btn-reset-search" id="btnResetSearch">
        <i class="fa-solid fa-rotate-left"></i> Clear Search Filter
      </button>
    </div>

    <!-- Authors Directory Container -->
    <div id="authorsGroupsContainer">
{all_sections_html}
    </div>

  </main>

  <!-- App Footer -->
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
          <a href="../quotes/index.html">Browse Categories</a>
          <a href="index.html">Browse Authors</a>
          <a href="../poster.html">Poster Studio</a>
          <a href="../about.html">About Us</a>
          <a href="../contact.html">Contact Us</a>
        </div>

        <div class="footer-col">
          <h4>Popular Topics</h4>
          <a href="mahatma-gandhi.html">Mahatma Gandhi</a>
          <a href="albert-einstein.html">Albert Einstein</a>
          <a href="../quotes/popular-quotes.html">Popular Quotes</a>
          <a href="../quotes/stoic-philosophy/stoic-philosophy-wisdom.html">Wisdom</a>
          <a href="../terms.html">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>

  <!-- Scripts -->
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

      // Live Instant Search
      const searchInput = document.getElementById('authorsSearchInput');
      const clearBtn = document.getElementById('clearSearchBtn');
      const statusText = document.getElementById('searchLiveStatus');
      const emptyState = document.getElementById('searchEmptyState');
      const spotlightSec = document.getElementById('spotlightSection');
      const resetSearchBtn = document.getElementById('btnResetSearch');
      const cards = document.querySelectorAll('.author-item-card');
      const groups = document.querySelectorAll('.alpha-group-section');
      const totalAuthors = cards.length;

      function performSearch() {{
        const q = searchInput.value.toLowerCase().trim();
        clearBtn.style.display = q ? 'block' : 'none';
        
        let matchCount = 0;

        if (q) {{
          if (spotlightSec) spotlightSec.style.display = 'none';
        }} else {{
          if (spotlightSec) spotlightSec.style.display = 'block';
        }}

        groups.forEach(group => {{
          let groupVisible = 0;
          const groupCards = group.querySelectorAll('.author-item-card');
          
          groupCards.forEach(card => {{
            const name = card.getAttribute('data-name');
            if (!q || name.includes(q)) {{
              card.style.display = 'flex';
              groupVisible++;
              matchCount++;
            }} else {{
              card.style.display = 'none';
            }}
          }});

          group.style.display = groupVisible > 0 ? 'block' : 'none';
        }});

        if (matchCount === 0) {{
          emptyState.style.display = 'block';
          statusText.textContent = `No authors matching "${{q}}"`;
        }} else {{
          emptyState.style.display = 'none';
          if (q) {{
            statusText.textContent = `Showing ${{matchCount}} author${{matchCount !== 1 ? 's' : ''}} matching "${{q}}"`;
          }} else {{
            statusText.textContent = `Showing all ${{totalAuthors}} authors`;
          }}
        }}
      }}

      searchInput.addEventListener('input', performSearch);

      clearBtn.addEventListener('click', () => {{
        searchInput.value = '';
        searchInput.focus();
        performSearch();
      }});

      if (resetSearchBtn) {{
        resetSearchBtn.addEventListener('click', () => {{
          searchInput.value = '';
          performSearch();
        }});
      }}

      // Alphabet Jump Scrolling with Proper Offset
      const alphaPills = document.querySelectorAll('.alpha-pill');
      alphaPills.forEach(pill => {{
        pill.addEventListener('click', () => {{
          const letter = pill.getAttribute('data-letter');
          
          alphaPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          if (letter === 'all') {{
            window.scrollTo({{ top: 0, behavior: 'smooth' }});
          }} else {{
            const targetSection = document.getElementById(`group-${{letter}}`);
            if (targetSection) {{
              const totalOffset = 150; // Accounting for fixed header + sticky alphabet bar
              const elementPosition = targetSection.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

              window.scrollTo({{
                top: offsetPosition,
                behavior: 'smooth'
              }});
            }}
          }}
        }});
      }});

      // Auto-highlight active alphabet pill on scroll
      if ('IntersectionObserver' in window) {{
        const observer = new IntersectionObserver((entries) => {{
          entries.forEach(entry => {{
            if (entry.isIntersecting) {{
              const group = entry.target.getAttribute('data-group');
              alphaPills.forEach(p => {{
                if (p.getAttribute('data-letter') === group) {{
                  p.classList.add('active');
                  p.scrollIntoView({{ behavior: 'smooth', inline: 'nearest', block: 'nearest' }});
                }} else {{
                  p.classList.remove('active');
                }}
              }});
            }}
          }});
        }}, {{ rootMargin: '-140px 0px -70% 0px' }});

        groups.forEach(sec => observer.observe(sec));
      }}
    }});
  </script>
</body>
</html>
'''

with open('authors/index.html', 'w', encoding='utf-8') as f:
    f.write(html_page)

print(f"Successfully generated clean authors/index.html with {len(authors)} authors!")
