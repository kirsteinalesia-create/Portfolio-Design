#!/usr/bin/env python3
with open('site/work-dhbw.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the actual text
idx = content.find('Präzision')
if idx >= 0:
    start = max(0, idx - 30)
    end = min(len(content), idx + 80)
    segment = content[start:end]
    print("Found text:")
    print(repr(segment))
    print("\nFirst quote char:")
    for i, char in enumerate(segment[:20]):
        print(f"  {i}: {repr(char)} (U+{ord(char):04X})")
