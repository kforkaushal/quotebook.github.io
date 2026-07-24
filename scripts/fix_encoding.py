import os, functools

replacements = [
    ('\u00e2\u20ac\u201c', '\u2014'),  # em-dash
    ('\u00e2\u20ac\u201d', '\u2013'),  # en-dash
    ('\u00e2\u20ac\u2026', '\u2026'),  # ellipsis
    ('\u00e2\u20ac\u02dc', '\u2018'),  # left single quote
    ('\u00e2\u20ac\u2122', '\u2019'),  # right single quote
    ('\u00e2\u20ac\u0153', '\u201c'),  # left double quote
]

fixed_count = 0
for root, dirs, files in os.walk('data'):
    for name in files:
        if not name.endswith('.json'):
            continue
        path = os.path.join(root, name)
        with open(path, 'r', encoding='utf-8', errors='replace') as fh:
            text = fh.read()
        fixed = functools.reduce(lambda s, pr: s.replace(pr[0], pr[1]), replacements, text)
        if fixed != text:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(fixed)
            print(f'Fixed: {name}')
            fixed_count += 1
        else:
            print(f'Skip:  {name}')

print(f'\nDone — {fixed_count} file(s) fixed.')
