#!/usr/bin/env python3
with open('site/work-dhbw.html', 'rb') as f:
    content = f.read()

# Find Präzision
idx = content.find(b'Pr\xc3\xa4zision')
if idx >= 0:
    # Get 50 bytes before and after
    segment = content[max(0, idx-20):idx+50]
    print("Raw bytes around 'Präzision':")
    print(repr(segment))
    print("\nHex:")
    print(segment.hex())
