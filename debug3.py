#!/usr/bin/env python3
with open('site/work-dhbw.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the opening quote right before Präzision
idx = content.find('Präzision')
if idx >= 0:
    # Go back to find the opening quote
    start = max(0, idx - 5)
    end = idx + 10
    segment = content[start:end]
    print("Characters before and in 'Präzision':")
    for i, char in enumerate(segment):
        print(f"  {i}: {repr(char):6} U+{ord(char):04X} - {chr(ord(char)) if 32 <= ord(char) < 127 else 'special'}")
