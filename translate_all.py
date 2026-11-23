#!/usr/bin/env python3
import re

with open('site/work-dhbw.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define all remaining replacements
replacements = [
    # Item 1: Hero subtitle
    ('Meine akademische Reise an der DHBW: Studienarbeiten und Kurse, die meinen Weg als Designerin geformt haben.',
     'My academic journey at DHBW: coursework and projects that shaped my path as a designer.'),
    
    # Item 2: Cross-Media Campaign
    ('>Cross-Media-Kampagne<',
     '>Cross-Media Campaign<'),
    
    # Item 4: Brand & Business Plan
    ('>Marke &amp; Businessplan<',
     '>Brand &amp; Business Plan<'),
    
    # Item 6: Accessible Smart Tourism
    ('>Barrierefreier Smart Tourism<',
     '>Accessible Smart Tourism<'),
    
    # Item 10: Closing note
    ('→ Weitere DHBW-Projekte folgen. Antara, Flamigo &amp; Voyama sind online, klick dich rein.',
     '→ More DHBW projects coming. Antara, Flamigo &amp; Voyama are online — click to explore.'),
]

# Apply all replacements
count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"✓ Replaced: {old[:50]}...")
        count += 1
    else:
        print(f"✗ Not found: {old[:50]}...")

# Write back
with open('site/work-dhbw.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nCompleted: {count} translations applied!")
