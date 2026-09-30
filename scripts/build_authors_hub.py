import json
import os

with open('authors_list.json', 'r', encoding='utf-8-sig') as f:
    authors = json.load(f)

# Sort authors alphabetically
authors.sort(key=lambda x: x['Name'].upper())

# Group by first letter
grouped = {}
for a in authors:
    name = a['Name']
    if ',' in name and len(name) > 35:
        name = name.split(',')[0].strip()
    a['DisplayName'] = name
    first_char = name[0].upper()
    if not first_char.isalpha():
        first_char = '#'
    if first_char not in grouped:
        grouped[first_char] = []
    grouped[first_char].append(a)

alphabet = sorted([k for k in grouped.keys() if k != '#'])
if '#' in grouped:
    alphabet.append('#')

alpha_pills = "\n".join([f'      <a href="#{letter}" class="alpha-pill">{letter}</a>' for letter in alphabet])

sections_html = []
for letter in alphabet:
    auths = grouped[letter]
    cards = []
    for a in auths:
        count_str = f"{a['Count']} quotes" if a['Count'] else "View quotes"
        cards.append(f'''          <a href="{a['File']}" class="author-card" data-name="{a['DisplayName'].lower()}">
            <div class="author-info">
              <span class="author-name">{a['DisplayName']}</span>
              <span class="author-quotes-count"><i class="fa-regular fa-quote-left"></i> {count_str}</span>
            </div>
            <i class="fa-solid fa-chevron-right author-arrow"></i>
          </a>''')
    cards_str = "\n".join(cards)
    sections_html.append(f'''      <section class="alpha-section" id="{letter}">
        <div class="alpha-header">
          <span class="alpha-letter">{letter}</span>
          <span class="alpha-count">{len(auths)} author{'s' if len(auths) != 1 else ''}</span>
        </div>
        <div class="authors-grid">
{cards_str}
        </div>
      </section>''')

all_sections = "\n".join(sections_html)

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

  <title>Famous Quote Authors A–Z Directory | Quotebook</title>
  <meta name="description" content="Browse 100+ famous thinkers, philosophers, leaders, and writers. Discover timeless quotes by Mahatma Gandhi, Albert Einstein, Steve Jobs, Rumi, and more.">
  <link rel="canonical" href="https://quotebook.me/authors/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Famous Quote Authors A–Z Directory | Quotebook">
  <meta property="og:description" content="Browse 100+ famous thinkers, philosophers, leaders, and writers on Quotebook.">
  <meta property="og:url" content="https://quotebook.me/authors/">
  <meta property="og:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
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
        {{ "@type": "ListItem", "position": 2, "name": "Authors", "item": "https://quotebook.me/authors/" }}
      ]
    }},
    {{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Famous Quote Authors Directory",
      "description": "Explore timeless quotes by over 100 celebrated authors, philosophers, and leaders.",
      "url": "https://quotebook.me/authors/"
    }}
  ]
  </script>

  <style>
    .authors-hub {{ max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }}
    .hub-header {{ text-align: center; margin-bottom: 3rem; }}
    .hub-badge {{ display: inline-flex; align-items: center; gap: 0.5rem; background: var(--orange-100); color: var(--orange-700); padding: 0.35rem 1rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }}
    .hub-title {{ font-family: var(--font-serif); font-size: clamp(2.2rem, 5vw, 3.4rem); color: var(--text-primary); margin-bottom: 1rem; font-weight: 700; }}
    .hub-desc {{ font-family: var(--font-sans); color: var(--text-secondary); max-width: 680px; margin: 0 auto 2rem; font-size: 1.1rem; line-height: 1.6; }}
    
    .hub-search-bar {{ max-width: 540px; margin: 0 auto 2.5rem; position: relative; }}
    .hub-search-input {{ width: 100%; padding: 0.9rem 1.25rem 0.9rem 3rem; border: 1.5px solid var(--border-medium); border-radius: var(--radius-pill); font-family: var(--font-sans); font-size: 1rem; background: var(--surface-card); color: var(--text-primary); outline: none; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); }}
    .hub-search-input:focus {{ border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15); }}
    .hub-search-icon {{ position: absolute; left: 1.15rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.05rem; }}

    .alpha-nav {{ display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; margin-bottom: 3.5rem; position: sticky; top: 4.5rem; background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: var(--radius-pill); box-shadow: var(--shadow-sm); z-index: 10; border: 1px solid var(--border-light); }}
    .alpha-pill {{ display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; font-family: var(--font-sans); font-weight: 600; font-size: 0.9rem; text-decoration: none; color: var(--text-secondary); background: var(--surface-card); border: 1px solid var(--border-light); transition: all var(--transition-fast); }}
    .alpha-pill:hover, .alpha-pill.active {{ background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); transform: scale(1.08); }}

    .alpha-section {{ margin-bottom: 3.5rem; scroll-margin-top: 8rem; }}
    .alpha-header {{ display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border-light); padding-bottom: 0.6rem; }}
    .alpha-letter {{ font-family: var(--font-serif); font-size: 2.2rem; font-weight: 700; color: var(--accent-primary); }}
    .alpha-count {{ font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }}

    .authors-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem; }}
    .author-card {{ background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem 1.4rem; text-decoration: none; color: inherit; display: flex; align-items: center; justify-content: space-between; gap: 1rem; transition: transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-smooth); }}
    .author-card:hover {{ transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--accent-primary); }}
    .author-info {{ display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }}
    .author-name {{ font-family: var(--font-sans); font-weight: 600; font-size: 1rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
    .author-quotes-count {{ font-size: 0.8rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.35rem; }}
    .author-arrow {{ color: var(--text-muted); font-size: 0.85rem; transition: transform var(--transition-fast), color var(--transition-fast); }}
    .author-card:hover .author-arrow {{ transform: translateX(3px); color: var(--accent-primary); }}

    .featured-authors {{ margin-bottom: 3.5rem; background: linear-gradient(135deg, var(--orange-50), var(--paper-100)); border: 1px solid var(--orange-100); border-radius: var(--radius-lg); padding: 2rem 2.25rem; }}
    .featured-title {{ font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-primary); margin-bottom: 1.25rem; font-weight: 600; }}
    .featured-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }}
    .featured-chip {{ display: flex; align-items: center; gap: 0.75rem; background: var(--surface-card); padding: 0.75rem 1rem; border-radius: var(--radius-md); text-decoration: none; border: 1px solid var(--border-light); transition: all var(--transition-fast); }}
    .featured-chip:hover {{ border-color: var(--accent-primary); transform: translateY(-2px); }}
    .featured-avatar {{ width: 38px; height: 38px; border-radius: 50%; background: var(--orange-500); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; }}
    .featured-name {{ font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }}

    @media (max-width: 768px) {{
      .authors-hub {{ padding: 1.5rem 1rem 3rem; }}
      .alpha-nav {{ display: none; }}
      .authors-grid {{ grid-template-columns: 1fr; }}
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
        <a href="/authors/" class="drawer-item active">
          <i class="fa-solid fa-users"></i>
          <span>Authors A–Z</span>
        </a>
      </div>
    </nav>
  </header>

  <main class="authors-hub">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb" style="margin-bottom: 2rem;">
      <a href="/" style="color:var(--text-secondary); text-decoration:none;"><i class="fa-solid fa-house"></i> Home</a>
      <span class="breadcrumb-separator" style="margin: 0 0.5rem; color:var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="breadcrumb-current" style="color:var(--text-primary); font-weight:600;">Authors</span>
    </nav>

    <div class="hub-header">
      <span class="hub-badge"><i class="fa-solid fa-feather"></i> Editorial Directory</span>
      <h1 class="hub-title">Famous Authors A–Z</h1>
      <p class="hub-desc">Explore timeless thoughts and words of wisdom from 100+ celebrated authors, philosophers, scientists, and historical leaders across human history.</p>
      
      <div class="hub-search-bar">
        <i class="fa-solid fa-magnifying-glass hub-search-icon"></i>
        <input type="text" id="authorSearch" class="hub-search-input" placeholder="Search authors by name (e.g. Gandhi, Einstein, Jobs)..." autocomplete="off">
      </div>
    </div>

    <!-- Featured Authors Spotlight -->
    <div class="featured-authors">
      <div class="featured-title"><i class="fa-solid fa-star" style="color:var(--accent-primary); margin-right:0.4rem;"></i> Most Read Authors</div>
      <div class="featured-grid">
        <a href="mahatma-gandhi.html" class="featured-chip">
          <div class="featured-avatar">MG</div>
          <div class="featured-name">Mahatma Gandhi</div>
        </a>
        <a href="albert-einstein.html" class="featured-chip">
          <div class="featured-avatar" style="background:var(--teal-700);">AE</div>
          <div class="featured-name">Albert Einstein</div>
        </a>
        <a href="steve-jobs.html" class="featured-chip">
          <div class="featured-avatar" style="background:#2563eb;">SJ</div>
          <div class="featured-name">Steve Jobs</div>
        </a>
        <a href="abdul-kalam.html" class="featured-chip">
          <div class="featured-avatar" style="background:#7c3aed;">AK</div>
          <div class="featured-name">Abdul Kalam</div>
        </a>
        <a href="rumi.html" class="featured-chip">
          <div class="featured-avatar" style="background:#d97706;">RU</div>
          <div class="featured-name">Rumi</div>
        </a>
        <a href="oscar-wilde.html" class="featured-chip">
          <div class="featured-avatar" style="background:#059669;">OW</div>
          <div class="featured-name">Oscar Wilde</div>
        </a>
      </div>
    </div>

    <!-- Sticky Alphabet Filter Bar -->
    <div class="alpha-nav" id="alphaNav">
{alpha_pills}
    </div>

    <!-- Author Sections by Letter -->
    <div id="authorsContainer">
{all_sections}
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
          <a href="/authors/">Browse Authors</a>
          <a href="/about.html">About Us</a>
          <a href="/contact.html">Contact Us</a>
        </div>

        <div class="footer-col">
          <h4>Categories</h4>
          <a href="/quotes/popular-quotes.html">Popular Quotes</a>
          <a href="/quotes/stoic-philosophy/stoic-philosophy-wisdom.html">Wisdom</a>
          <a href="/quotes/stoic-philosophy/stoic-philosophy-general.html">Philosophy</a>
          <a href="/quotes/writing-literature/writing-literature-general.html">Books</a>
          <a href="/terms.html">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>

  <script>
    // Live Search Filter for Authors
    const searchInput = document.getElementById('authorSearch');
    const authorCards = document.querySelectorAll('.author-card');
    const sections = document.querySelectorAll('.alpha-section');

    searchInput.addEventListener('input', (e) => {{
      const q = e.target.value.toLowerCase().trim();
      sections.forEach(sec => {{
        let visibleCount = 0;
        const cards = sec.querySelectorAll('.author-card');
        cards.forEach(card => {{
          const name = card.dataset.name;
          if (!q || name.includes(q)) {{
            card.style.display = 'flex';
            visibleCount++;
          }} else {{
            card.style.display = 'none';
          }}
        }});
        sec.style.display = visibleCount > 0 ? 'block' : 'none';
      }});
    }});
  </script>
</body>
</html>
'''

with open('authors/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('authors/index.html generated successfully!')
