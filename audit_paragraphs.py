import re
import os

def get_p_context(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    results = []
    current_section_class = 'root'
    section_stack = []
    
    # Track open/close of meaningful containers
    for i, line in enumerate(lines):
        # detect section/div/article openings with meaningful class
        sect_match = re.search(r'<(section|div|article|main|header|footer)[^>]*class=["\']([^"\'> ]+[^"\'>]*)["\']', line)
        if sect_match:
            classes = sect_match.group(2)
            first_class = classes.split()[0]
            meaningful_kws = ['hero','intro','section','story','about','insight','contact','values',
                              'journey','branding','role','fazit','feedback','station','antara',
                              'flamigo','lutra','notg','sippy','voyama','star','modal','timeline',
                              'page-body','work','dhbw','sap','ai-star','page-hero','antara-section',
                              'flamigo-section','lutra-section','notg-section','sippy-section',
                              'voyama-section','notg-idea','notg-process','notg-fazit','notg-results']
            if any(kw in first_class for kw in meaningful_kws):
                current_section_class = first_class
        
        # detect p tags
        if re.search(r'<p[\s>]', line):
            # check for inline style
            style_match = re.search(r'style=["\']([^"\']+)["\']', line)
            inline_style = style_match.group(1) if style_match else ''
            
            # get class of p itself
            p_class_match = re.search(r'<p[^>]*\bclass=["\']([^"\']+)["\']', line)
            p_class = p_class_match.group(1) if p_class_match else ''
            
            # snippet of text
            text_match = re.search(r'<p[^>]*>(.{0,100})', line)
            snippet = text_match.group(1) if text_match else ''
            snippet = re.sub(r'<[^>]+>', '', snippet)[:55]
            
            results.append({
                'line': i+1,
                'section_class': current_section_class,
                'p_class': p_class,
                'inline_style': inline_style,
                'snippet': snippet.strip()
            })
    return results

# Process all HTML files
site_dir = "/Users/I748634/Portfolio Webseite Design/site"
html_files = sorted([f for f in os.listdir(site_dir) if f.endswith('.html')])

for fname in html_files:
    fpath = os.path.join(site_dir, fname)
    print(f"\n===== {fname} =====")
    try:
        results = get_p_context(fpath)
        for r in results:
            sec = r['section_class'][:38].ljust(38)
            pc  = r['p_class'][:22].ljust(22)
            ist = r['inline_style'][:35].ljust(35)
            sn  = r['snippet'][:52]
            print(f"  L{r['line']:4d} | {sec} | p.{pc} | [{ist}] | {sn}")
    except Exception as e:
        print(f"  ERROR: {e}")
