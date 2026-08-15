import os
import json
import hashlib
import re
import urllib.parse

from datetime import datetime, timedelta

# Target directories
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dataset_path = os.path.join(base_dir, "data", "quotes_8000_plus.json")
archive_dir = os.path.join(base_dir, "quote-of-the-day")

os.makedirs(archive_dir, exist_ok=True)

print("Loading quotes dataset from:", dataset_path)
with open(dataset_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Flatten quotes from categories dict -> obj {"count": x, "quotes": [...]}
all_quotes = []
if "categories" in raw_data:
    for cat_name, cat_obj in raw_data["categories"].items():
        q_list = cat_obj.get("quotes", []) if isinstance(cat_obj, dict) else cat_obj
        for q in q_list:
            if isinstance(q, dict) and "quote" in q and "author" in q:
                all_quotes.append({
                    "quote": q["quote"],
                    "author": q.get("author", "Unknown"),
                    "category": cat_name,
                    "tags": q.get("tags", []),
                    "popularity": q.get("popularity", 0.5)
                })

print(f"Total quotes loaded: {len(all_quotes)}")

def get_quote_for_date(date_str):
    # Deterministic hash of date string
    h = hashlib.sha256(date_str.encode('utf-8')).hexdigest()
    idx = int(h, 16) % len(all_quotes)
    return all_quotes[idx]

def get_initials(name):
    parts = [p for p in name.replace("-", " ").split() if p.isalpha()]
    if not parts:
        return "QB"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()

def clean_text(text):
    if not text:
        return ""
    # Clean HTML entity codes if present
    text = (text.replace("&#039;", "'")
                .replace("&amp;", "&")
                .replace("&quot;", '"')
                .replace("&lt;", "<")
                .replace("&gt;", ">"))
    
    # Strip prefix titles and bracketed tags like "Title [10w] Quote..." -> "Quote..."
    text = re.sub(r'^.*?\[\d+[a-zA-Z]*\]\s*', '', text)
    # Strip remaining bracketed tags anywhere in quote
    text = re.sub(r'\[\d+[a-zA-Z]*\]', '', text)
    
    # Fix missing spaces after sentence ending punctuation (e.g. "calling.It's" -> "calling. It's")
    text = re.sub(r'([a-z0-9\)])\.([A-Z])', r'\1. \2', text)
    
    # Normalize spaces
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def escape_html(text):
    text = clean_text(text)
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&#039;"))

# Generate archive for dates from 2026-06-01 to 2026-12-31
start_date = datetime(2026, 6, 1)
end_date = datetime(2026, 12, 31)

current_date = start_date
dates_list = []

while current_date <= end_date:
    dates_list.append(current_date.strftime("%Y-%m-%d"))
    current_date += timedelta(days=1)

print(f"Generating daily quote pages for {len(dates_list)} dates ({dates_list[0]} to {dates_list[-1]})...")

generated_pages = []

for i, date_str in enumerate(dates_list):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    formatted_date = dt.strftime("%B %d, %Y")
    
    q_obj = get_quote_for_date(date_str)
    q_text = clean_text(q_obj["quote"])
    q_author = clean_text(q_obj["author"])
    q_cat = clean_text(q_obj["category"])
    q_initials = get_initials(q_author)

    prev_date = dates_list[i-1] if i > 0 else None
    next_date = dates_list[i+1] if i < len(dates_list) - 1 else None

    page_title = f"Quote of the Day for {formatted_date} — \"{q_author}\" | Quotebook"
    page_desc = f"Quote of the Day for {formatted_date}: \"{q_text[:140]}\" by {q_author}. Read, listen aloud, and create custom posters on Quotebook."
    canonical_url = f"https://quotebook.me/quote-of-the-day/{date_str}.html"

    # URL-encode poster URL parameters properly to handle & and special characters
    poster_href = f"../quotes.html?action=poster&quote={urllib.parse.quote(q_text)}&author={urllib.parse.quote(q_author)}&category={urllib.parse.quote(q_cat)}"

    prev_link_html = f'<a href="{prev_date}.html" class="nav-prev-btn" style="text-decoration:none; padding: 0.55rem 1.2rem; border-radius: var(--radius-pill); border: 1px solid var(--border-light); color: var(--text-primary); font-size: 0.9rem; font-weight: 600; background: var(--surface-card);"><i class="fa-solid fa-arrow-left"></i> {datetime.strptime(prev_date, "%Y-%m-%d").strftime("%b %d")}</a>' if prev_date else '<span></span>'
    next_link_html = f'<a href="{next_date}.html" class="nav-next-btn" style="text-decoration:none; padding: 0.55rem 1.2rem; border-radius: var(--radius-pill); border: 1px solid var(--border-light); color: var(--text-primary); font-size: 0.9rem; font-weight: 600; background: var(--surface-card);">{datetime.strptime(next_date, "%Y-%m-%d").strftime("%b %d")} <i class="fa-solid fa-arrow-right"></i></a>' if next_date else '<span></span>'

    # 4 related quotes
    related_quotes = [q for q in all_quotes if clean_text(q["category"]) == q_cat and clean_text(q["quote"]) != q_text][:4]
    related_cards_html = ""
    for rq in related_quotes:
        rq_text = clean_text(rq["quote"])
        rq_author = clean_text(rq["author"])
        rq_cat = clean_text(rq["category"])
        related_cards_html += f'''
        <article class="quote-card revealed" style="opacity:1; transform:translateY(0);">
          <div class="quote-card-header">
            <span class="quote-category-tag">{escape_html(rq_cat)}</span>
          </div>
          <div class="card-quote-body">
            <div class="quote-icon-watermark">&ldquo;</div>
            <blockquote class="card-quote-text">"{escape_html(rq_text)}"</blockquote>
            <span class="card-author">&mdash; {escape_html(rq_author)}</span>
          </div>
        </article>'''

    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9227354288966999"
       crossorigin="anonymous"></script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-P7WSN8P37J');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape_html(page_title)}</title>
  <meta name="description" content="{escape_html(page_desc)}">
  <link rel="canonical" href="{canonical_url}">

  <!-- Open Graph -->
  <meta property="og:title" content="{escape_html(page_title)}">
  <meta property="og:description" content="{escape_html(page_desc)}">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:type" content="article">
  <meta property="article:published_time" content="{date_str}T00:00:00Z">

  <!-- Twitter -->
  <meta name="twitter:title" content="{escape_html(page_title)}">
  <meta name="twitter:description" content="{escape_html(page_desc)}">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <link rel="stylesheet" href="../src/css/style.css">
  <link rel="icon" type="image/png" sizes="32x32" href="../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../data/img/favicon-16x16.png">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Quotation",
    "text": "{escape_html(q_text)}",
    "creator": {{
      "@type": "Person",
      "name": "{escape_html(q_author)}"
    }},
    "datePublished": "{date_str}",
    "url": "{canonical_url}"
  }}
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  <header class="app-header">
    <div class="header-container">
      <a href="../index.html" class="brand-logo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle">Daily Quote Archive</span>
        </div>
      </a>
      <div class="header-actions">
        <a href="../index.html" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="index.html" class="icon-btn-text highlight" title="Browse Daily Quote Archive">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Daily Archive</span>
        </a>
      </div>
      <button class="mobile-menu-toggle" id="archiveMenuToggle" aria-label="Open Menu" aria-expanded="false">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>
    </div>
    <nav class="quotes-mobile-drawer" id="archiveMobileDrawer" aria-hidden="true">
      <div class="drawer-inner">
        <a href="../index.html" class="drawer-item">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="index.html" class="drawer-item highlight">
          <i class="fa-solid fa-calendar-days"></i>
          <span>Daily Archive</span>
        </a>
      </div>
    </nav>
  </header>

  <main class="main-container">
    <!-- Date First Navigation & Header -->
    <section class="toolbar-section" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
      <div class="toolbar-info">
        <span class="archive-date-block-large"><i class="fa-solid fa-calendar-day"></i> {formatted_date}</span>
        <h1 class="section-heading" style="margin-top: 0.5rem;">Quote of the Day</h1>
      </div>
      <div class="date-nav-bar" style="display: flex; gap: 0.75rem; align-items: center;">
        {prev_link_html}
        {next_link_html}
      </div>
    </section>

    <!-- Main Featured Daily Quote Card -->
    <section class="daily-featured-hero">
      <article class="daily-archive-hero">
        <div class="quote-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <span class="quote-category-tag" style="background: rgba(193,89,44,0.1); color: var(--accent-primary); padding: 0.35rem 0.85rem; border-radius: var(--radius-pill); font-weight: 600;"><i class="fa-solid fa-tag"></i> {escape_html(q_cat)}</span>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;"><i class="fa-regular fa-clock"></i> Featured Entry</span>
        </div>
        <div class="card-quote-body" style="margin-bottom: 1.5rem;">
          <div class="quote-icon-watermark" style="font-size: 4rem; opacity: 0.15; color: var(--accent-primary); line-height: 1;">&ldquo;</div>
          <blockquote class="card-quote-text" style="font-family: var(--font-serif); font-size: 2.2rem; font-weight: 600; color: var(--text-primary); line-height: 1.35; margin-bottom: 1.25rem;">"{escape_html(q_text)}"</blockquote>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="archive-author-avatar">{q_initials}</span>
            <cite class="card-author" style="font-family: var(--font-sans); font-size: 1.25rem; font-weight: 700; color: var(--accent-primary); font-style: normal;">— {escape_html(q_author)}</cite>
          </div>
        </div>
        <div class="today-quote-actions" style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
          <button class="today-action-btn btn-copy" data-quote="{escape_html(q_text)}" data-author="{escape_html(q_author)}" style="padding: 0.65rem 1.3rem; border-radius: var(--radius-pill); border: 1px solid var(--border-light); background: var(--surface-card); cursor: pointer; font-weight: 600;"><i class="fa-solid fa-copy"></i> Copy Quote</button>
          <button class="today-action-btn btn-speak" data-quote="{escape_html(q_text)}" data-author="{escape_html(q_author)}" style="padding: 0.65rem 1.3rem; border-radius: var(--radius-pill); border: 1px solid var(--border-light); background: var(--surface-card); cursor: pointer; font-weight: 600;"><i class="fa-solid fa-volume-high"></i> Listen Aloud</button>
          <a href="{escape_html(poster_href)}" class="today-action-btn btn-poster" style="padding: 0.65rem 1.4rem; border-radius: var(--radius-pill); background: var(--accent-primary); color: #fff; text-decoration: none; font-weight: 600;"><i class="fa-solid fa-palette"></i> Design Poster Studio</a>
        </div>
      </article>
    </section>

    <!-- Related Quotes Section -->
    <section class="related-quotes-section" style="margin-top: 3.5rem;">
      <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 1.5rem;">More {escape_html(q_cat)} Quotes</h3>
      <div class="quotes-grid">
        {related_cards_html}
      </div>
    </section>

    <!-- Bottom Navigation Bar -->
    <section class="archive-footer-nav" style="margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <a href="index.html" class="btn-secondary" style="text-decoration: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-pill); border: 1px solid var(--border-light); color: var(--text-primary); font-weight: 600;"><i class="fa-solid fa-list-ul"></i> All Daily Quote Archives</a>
      <a href="../quotes.html" class="btn-primary" style="text-decoration: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-pill); background: var(--accent-primary); color: #fff; font-weight: 600;"><i class="fa-solid fa-compass"></i> Explore 1 Million+ Quotes</a>
    </section>
  </main>

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
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>
  <script src="../src/js/app.js"></script>
  <script>
    const menuToggleBtn = document.getElementById('archiveMenuToggle');
    const mobileDrawer = document.getElementById('archiveMobileDrawer');
    if (menuToggleBtn && mobileDrawer) {{
      menuToggleBtn.addEventListener('click', () => {{
        const isOpen = mobileDrawer.classList.toggle('active');
        mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
        menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
      }});
    }}
  </script>
</body>
</html>'''

    out_file = os.path.join(archive_dir, f"{date_str}.html")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    generated_pages.append({
        "date_str": date_str,
        "formatted_date": formatted_date,
        "quote": q_text,
        "author": q_author,
        "category": q_cat,
        "initials": q_initials
    })

print(f"Generated {len(generated_pages)} daily quote html pages.")

# Extract today's item for top hero banner in index.html (2026-08-02)
today_item = [p for p in generated_pages if p["date_str"] == "2026-08-02"]
today_hero_item = today_item[0] if today_item else generated_pages[-1]

today_hero_html = f'''
    <section class="daily-featured-hero" style="margin-bottom: 3rem;">
      <article class="daily-archive-hero">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <span class="archive-date-block-large"><i class="fa-solid fa-star"></i> TODAY'S FEATURED QUOTE — {today_hero_item['formatted_date']}</span>
          <span style="background: rgba(193,89,44,0.1); color: var(--accent-primary); padding: 0.3rem 0.75rem; border-radius: var(--radius-pill); font-weight: 600; font-size: 0.85rem;"><i class="fa-solid fa-tag"></i> {escape_html(today_hero_item['category'])}</span>
        </div>
        <blockquote style="font-family: var(--font-serif); font-size: 2rem; font-weight: 600; color: var(--text-primary); line-height: 1.35; margin-bottom: 1.25rem;">"{escape_html(today_hero_item['quote'])}"</blockquote>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="archive-author-avatar">{today_hero_item['initials']}</span>
            <span style="font-family: var(--font-sans); font-size: 1.2rem; font-weight: 700; color: var(--accent-primary);">— {escape_html(today_hero_item['author'])}</span>
          </div>
          <a href="{today_hero_item['date_str']}.html" class="showcase-header-btn" style="padding: 0.65rem 1.4rem; text-decoration: none;">
            <span>Read Today's Entry</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    </section>'''

# Build DATE FIRST cards for quote-of-the-day/index.html
archive_items_html = ""
for item in reversed(generated_pages):
    trunc_quote = item['quote'][:130] + '...' if len(item['quote']) > 130 else item['quote']
    archive_items_html += f'''
    <a href="{item['date_str']}.html" class="archive-card-link" style="text-decoration: none; color: inherit; display: block;">
      <article class="archive-card-item">
        <div class="archive-card-date-header">
          <span class="archive-date-badge-first"><i class="fa-regular fa-calendar-check"></i> {item['formatted_date']}</span>
          <span style="font-size: 0.78rem; background: rgba(193,89,44,0.08); color: var(--accent-primary); padding: 0.2rem 0.6rem; border-radius: var(--radius-pill); font-weight: 600;">{escape_html(item['category'])}</span>
        </div>
        <div style="flex: 1; margin-bottom: 1.25rem;">
          <blockquote style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 600; color: var(--text-primary); line-height: 1.4;">"{escape_html(trunc_quote)}"</blockquote>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; pt: 0.75rem; border-top: 1px solid var(--border-light);">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="archive-author-avatar">{item['initials']}</span>
            <span style="font-family: var(--font-sans); font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">— {escape_html(item['author'])}</span>
          </div>
          <span style="color: var(--accent-primary); font-size: 0.85rem; font-weight: 600;">View <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </article>
    </a>'''

archive_index_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9227354288966999"
       crossorigin="anonymous"></script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-P7WSN8P37J');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote of the Day Archive — Daily Inspiration &amp; Wisdom | Quotebook</title>
  <meta name="description" content="Browse our complete archive of daily quotes. Discover handpicked inspirational quotes for every single day of the year on Quotebook.">
  <link rel="canonical" href="https://quotebook.me/quote-of-the-day/">

  <!-- Open Graph -->
  <meta property="og:title" content="Quote of the Day Archive | Quotebook">
  <meta property="og:description" content="Browse our complete archive of daily quotes. Discover handpicked inspirational quotes for every day.">
  <meta property="og:url" content="https://quotebook.me/quote-of-the-day/">
  <meta property="og:type" content="website">

  <!-- Twitter -->
  <meta name="twitter:title" content="Quote of the Day Archive | Quotebook">
  <meta name="twitter:description" content="Browse our complete archive of daily quotes. Discover handpicked inspirational quotes for every day.">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <link rel="stylesheet" href="../src/css/style.css">
  <link rel="icon" type="image/png" sizes="32x32" href="../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../data/img/favicon-16x16.png">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Quote of the Day Archive",
    "description": "Daily quote archive offering curated quotes for every day.",
    "url": "https://quotebook.me/quote-of-the-day/"
  }}
  </script>
</head>
<body class="light-theme quotes-page page-loaded">
  <header class="app-header">
    <div class="header-container">
      <a href="../index.html" class="brand-logo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle">Daily Quote Archive</span>
        </div>
      </a>
      <div class="header-actions">
        <a href="../index.html" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="../quotes.html" class="icon-btn-text highlight" title="Explore Quotes">
          <i class="fa-solid fa-compass"></i>
          <span>Explore Quotes</span>
        </a>
      </div>
      <button class="mobile-menu-toggle" id="archiveMenuToggle" aria-label="Open Menu" aria-expanded="false">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>
    </div>
    <nav class="quotes-mobile-drawer" id="archiveMobileDrawer" aria-hidden="true">
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

  <main class="main-container">
    <!-- Header Section -->
    <section class="toolbar-section" style="margin-bottom: 2rem;">
      <div class="toolbar-info">
        <span class="showcase-badge"><i class="fa-solid fa-calendar-days"></i> Daily Archive Hub</span>
        <h1 class="section-heading">Quote of the Day Archive</h1>
        <p class="title-desc">Explore our complete editorial calendar of daily quotes, wisdom, and daily inspiration entries.</p>
      </div>
      <div>
        <a href="../quotes.html" class="icon-btn-text highlight" style="text-decoration:none;">
          <i class="fa-solid fa-compass"></i> Open Full Library
        </a>
      </div>
    </section>

    <!-- Top Featured Today Banner -->
    {today_hero_html}

    <!-- Date First Archive Card Grid -->
    <section class="archive-grid-section" style="margin-top: 2rem;">
      <h2 style="font-family: var(--font-serif); font-size: 1.75rem; margin-bottom: 1.5rem; color: var(--text-primary);"><i class="fa-solid fa-calendar-week"></i> Daily Calendar Entries</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        {archive_items_html}
      </div>
    </section>
  </main>

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
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>
  <script src="../src/js/app.js"></script>
  <script>
    const menuToggleBtn = document.getElementById('archiveMenuToggle');
    const mobileDrawer = document.getElementById('archiveMobileDrawer');
    if (menuToggleBtn && mobileDrawer) {{
      menuToggleBtn.addEventListener('click', () => {{
        const isOpen = mobileDrawer.classList.toggle('active');
        mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
        menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
      }});
    }}
  </script>
</body>
</html>'''

with open(os.path.join(archive_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(archive_index_html)

print("Generated quote-of-the-day/index.html archive landing page successfully.")
