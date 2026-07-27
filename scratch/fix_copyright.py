import os

quotes_dir = r"c:\Users\bitbu\OneDrive\Documents\GitHub\Quotebook"

for root, dirs, files in os.walk(quotes_dir):
    html_files = [f for f in files if f.endswith('.html')]
    for f in html_files:
        path = os.path.join(root, f)
        
        try:
            # Try utf-8 first
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
        except UnicodeDecodeError:
            # Fallback to latin-1 or cp1252
            with open(path, 'r', encoding='latin-1') as file:
                content = file.read()
                
        modified = False
        
        if ' 2026 Quotebook' in content:
            content = content.replace(' 2026 Quotebook', '&copy; 2026 Quotebook')
            modified = True
            
        if ' 2026 Quotebook' in content:
            content = content.replace(' 2026 Quotebook', '&copy; 2026 Quotebook')
            modified = True
            
        if '© 2026 Quotebook' in content:
             content = content.replace('© 2026 Quotebook', '&copy; 2026 Quotebook')
             modified = True

        if modified:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Fixed copyright in {path}")
