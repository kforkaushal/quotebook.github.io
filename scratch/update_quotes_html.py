import os
import re

quotes_dir = r"c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook\quotes"

backlink_html = """        <a href="../../quotes.html" style="display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); text-decoration: none; font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem; padding: 0.4rem 0.8rem; border-radius: 20px; background: rgba(0,0,0,0.03); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(0,0,0,0.06)'; this.style.color='var(--text-primary)';" onmouseout="this.style.background='rgba(0,0,0,0.03)'; this.style.color='var(--text-secondary)';">
          <i class="fa-solid fa-arrow-left"></i> Back to All Quotes
        </a>
"""

for root, dirs, files in os.walk(quotes_dir):
    html_files = [f for f in files if f.endswith('.html')]
    if not html_files:
        continue

    # Build the related collections HTML for this folder
    related_links = []
    for f in html_files:
        # e.g. "inspirational-courage.html" -> "Courage Quotes"
        # Try to extract the subcategory
        parts = f.replace('.html', '').split('-')
        if len(parts) > 1:
            name = " ".join(parts[1:]).title()
        else:
            name = parts[0].title()
        
        link = f"""        <a href="{f}" style="padding: 0.6rem 1.25rem; background: var(--surface-card); border-radius: 25px; border: 1px solid var(--border-light); color: var(--text-secondary); text-decoration: none; font-weight: 500; transition: all 0.2s ease; box-shadow: var(--shadow-sm);" onmouseover="this.style.background='var(--text-primary)'; this.style.color='#fff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='var(--surface-card)'; this.style.color='var(--text-secondary)'; this.style.transform='translateY(0)';">{name} Quotes</a>"""
        related_links.append(link)
    
    related_html = f"""
    <!-- Related Categories -->
    <section class="related-collections" style="margin: 4rem 0 2rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto; padding: 0 1.5rem;">
      <h3 style="font-family: var(--font-serif); font-size: 2.2rem; margin-bottom: 1.5rem; color: var(--text-primary);">Explore Related Collections</h3>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
""" + "\n".join(related_links) + """
      </div>
    </section>
"""

    for f in html_files:
        path = os.path.join(root, f)
        
        # Don't touch the one we already edited manually just to be safe, or just overwrite it cleanly
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        modified = False
        
        # 1. Inject Backlink (if not already there)
        if '<i class="fa-solid fa-arrow-left"></i> Back to All Quotes' not in content:
            # Find the h1
            content = re.sub(r'(<h1 class="section-heading">)', backlink_html + r'\1', content, count=1)
            modified = True
            
        # 2. Inject Related Collections (if not already there)
        if 'Explore Related Collections' not in content:
            # Replace `</main>` with the related section + `</main>`
            # We want it right before `</main>`
            content = content.replace('</main>', related_html + '\n  </main>')
            modified = True
            
        if modified:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Updated {path}")
