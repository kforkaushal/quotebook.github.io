import os
import re

quotes_dir = r"c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

for root, dirs, files in os.walk(quotes_dir):
    html_files = [f for f in files if f.endswith('.html')]
    for f in html_files:
        path = os.path.join(root, f)
        
        try:
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
        except UnicodeDecodeError:
            with open(path, 'r', encoding='latin-1') as file:
                content = file.read()
                
        # Use regex to match the corrupted paragraph and replace it entirely
        # It matches anything between <p> and 2026 Quotebook...
        new_content = re.sub(
            r'<p>[^<]*2026 Quotebook\. Powered by Pixabay API & Open Quote Datasets\.</p>',
            r'<p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>',
            content
        )
        
        # In case the ampersand was already encoded as &amp; in some files
        new_content = re.sub(
            r'<p>[^<]*2026 Quotebook\. Powered by Pixabay API &amp; Open Quote Datasets\.</p>',
            r'<p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>',
            new_content
        )
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Fixed copyright in {path}")
