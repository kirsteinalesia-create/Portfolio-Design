#!/usr/bin/env python3
with open('site/work-dhbw.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define all replacements
replacements = [
    ('„Präzision beginnt im Core." Eine ganzheitliche Kampagne über Flyer, Instagram &amp; Poster.', 
     '"Precision begins in the Core." A holistic campaign across flyers, Instagram &amp; posters.'),
    ('„Euer Spieleabend. Immer und überall." Eine Games-Marke, die Familien über jede Distanz verbindet.',
     '"Your game night. Always and everywhere." A games brand that connects families across any distance.'),
    ('„Barrierefreiheit überall." Eine inklusive Reise-App für selbstbestimmten Städtetourismus in Speyer.',
     '"Accessibility everywhere." An inclusive travel app for independent city tourism in Speyer.'),
]

# Apply all replacements
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"✓ Replaced: {old[:40]}...")
    else:
        print(f"✗ Not found: {old[:40]}...")

# Write back
with open('site/work-dhbw.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nAll translations completed!")
