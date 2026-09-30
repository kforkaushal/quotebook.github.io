import os
import glob
import re
from datetime import datetime

# 1. Update robots meta tag in quote-of-the-day HTML files
qotd_files = sorted(glob.glob('quote-of-the-day/2026-*.html'))
today_str = "2026-09-30"
today_dt = datetime.strptime(today_str, "%Y-%m-%d")

updated_noindex = 0
updated_index = 0

for file_path in qotd_files:
    fname = os.path.basename(file_path)
    date_str = fname.replace('.html', '')
    try:
        page_dt = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        continue
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Rule: Keep last 30 days (September 2026 up to today) as indexable.
    # Older archives (June, July, August) and future dates (Oct, Nov, Dec) get noindex, follow.
    if page_dt.year == 2026 and page_dt.month == 9 and page_dt <= today_dt:
        robots_directive = '<meta name="robots" content="index, follow">'
        updated_index += 1
    else:
        robots_directive = '<meta name="robots" content="noindex, follow">'
        updated_noindex += 1

    # Check if a robots tag already exists
    if re.search(r'<meta\s+name=["\']robots["\'][^>]*>', content, re.IGNORECASE):
        new_content = re.sub(r'<meta\s+name=["\']robots["\'][^>]*>', robots_directive, content, flags=re.IGNORECASE)
    else:
        # Insert after <meta name="viewport"...> or after <head>
        if '<meta name="viewport"' in content:
            new_content = content.replace(
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                f'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n  {robots_directive}'
            )
        else:
            new_content = content.replace('<head>', f'<head>\n  {robots_directive}')

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

print(f"QOTD meta robots updated: {updated_index} pages set to index, {updated_noindex} archive/future pages set to noindex, follow.")

# 2. Build Clean, High-Value sitemap.xml
urls = []

# Core Root Pages
urls.append(('https://quotebook.me/', '2026-09-30', 'daily', '1.0'))
urls.append(('https://quotebook.me/quotes.html', '2026-09-30', 'daily', '0.9'))
urls.append(('https://quotebook.me/quotes/', '2026-09-30', 'weekly', '0.9'))
urls.append(('https://quotebook.me/authors/', '2026-09-30', 'weekly', '0.9'))
urls.append(('https://quotebook.me/quotes/gandhi-jayanti-quotes.html', '2026-09-30', 'weekly', '0.85'))
urls.append(('https://quotebook.me/quotes/popular-quotes.html', '2026-09-30', 'weekly', '0.85'))
urls.append(('https://quotebook.me/poster.html', '2026-09-30', 'weekly', '0.8'))
urls.append(('https://quotebook.me/blog/', '2026-09-30', 'weekly', '0.8'))
urls.append(('https://quotebook.me/blog/attitude-status-captions.html', '2026-09-30', 'weekly', '0.8'))
urls.append(('https://quotebook.me/quote-of-the-day/', '2026-09-30', 'daily', '0.8'))
urls.append(('https://quotebook.me/gallery/', '2026-09-30', 'monthly', '0.7'))
urls.append(('https://quotebook.me/about.html', '2026-09-30', 'monthly', '0.5'))
urls.append(('https://quotebook.me/contact.html', '2026-09-30', 'monthly', '0.5'))
urls.append(('https://quotebook.me/terms.html', '2026-09-30', 'monthly', '0.4'))

# All 103 Author Pages
author_files = sorted(glob.glob('authors/*.html'))
for af in author_files:
    bf = os.path.basename(af)
    if bf == 'index.html':
        continue
    urls.append((f'https://quotebook.me/authors/{bf}', '2026-09-30', 'monthly', '0.7'))

# All Category Collection Pages under quotes/
quote_files = sorted(glob.glob('quotes/**/*.html', recursive=True))
for qf in quote_files:
    rel = os.path.relpath(qf, 'quotes').replace('\\', '/')
    if rel in ['index.html', 'popular-quotes.html', 'gandhi-jayanti-quotes.html']:
        continue
    urls.append((f'https://quotebook.me/quotes/{rel}', '2026-09-30', 'monthly', '0.7'))

# Only the Recent 30 Daily Quote Pages (September 2026)
for file_path in qotd_files:
    fname = os.path.basename(file_path)
    date_str = fname.replace('.html', '')
    try:
        page_dt = datetime.strptime(date_str, "%Y-%m-%d")
        if page_dt.year == 2026 and page_dt.month == 9 and page_dt <= today_dt:
            urls.append((f'https://quotebook.me/quote-of-the-day/{fname}', date_str, 'monthly', '0.6'))
    except ValueError:
        continue

# Generate XML
xml_entries = []
for loc, lastmod, freq, prio in urls:
    xml_entries.append(f'''  <url>
    <loc>{loc}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{prio}</priority>
  </url>''')

sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
''' + "\n".join(xml_entries) + '\n</urlset>\n'

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

print(f"Generated clean sitemap.xml with {len(urls)} curated, high-priority indexable URLs!")
