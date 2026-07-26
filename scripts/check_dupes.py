import re
import glob

# The 12 buggy files mentioned in ISSUES.md (some might have been deleted, let's search all new ones)
files = glob.glob("quotes/**/*.html", recursive=True)

for f in files:
    with open(f, encoding="utf-8", errors="ignore") as file:
        txt = file.read()
        quotes = re.findall(r'class="card-quote-text">"([^"]*)"', txt)
        if len(quotes) > 0 and len(quotes) != len(set(quotes)):
            print(f"DUPLICATES IN {f}: Total {len(quotes)}, Unique {len(set(quotes))}")
