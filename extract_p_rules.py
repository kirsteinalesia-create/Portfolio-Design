import re
import os

css_dir = "/Users/I748634/Portfolio Webseite Design/site/assets/css"
files = ['style.css','pages.css','sap-stations.css','timeline.css',
         'antara.css','flamigo.css','lutra.css','notg.css','sippy.css',
         'voyama.css','ai-star.css','station-1.css','hero.css','contact.css']

print("=== ALL p-SELECTOR RULES WITH font-size or line-height ===\n")

for fname in files:
    fpath = os.path.join(css_dir, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath) as fp:
        content = fp.read()
    # Find all selector{rules} blocks that contain a p selector
    # Use a broader approach: find all CSS rules
    # Pattern: find everything before { that ends in p or p.something or .something p
    blocks = re.findall(r'([^{}]+)\{([^{}]+)\}', content)
    for selector, rules in blocks:
        selector = selector.strip()
        # Check if selector targets a p element
        if not re.search(r'\bp\b', selector):
            continue
        # Only care about font-size or line-height rules
        if 'font-size' not in rules and 'line-height' not in rules:
            continue
        # Extract the values
        fs_match = re.search(r'font-size:\s*([^;]+)', rules)
        lh_match = re.search(r'line-height:\s*([^;]+)', rules)
        fs = fs_match.group(1).strip() if fs_match else '—'
        lh = lh_match.group(1).strip() if lh_match else '—'
        # Clean up selector for display
        sel_clean = re.sub(r'\s+', ' ', selector.replace('\n', ' ').replace('\r', '')).strip()[-80:]
        print(f"{fname:<18} | {sel_clean:<70} | fs={fs:<16} | lh={lh}")
