with open('site/work-dhbw.html', 'rb') as f:
    content = f.read()
    # Find the lines with quote characters
    lines = content.decode('utf-8').split('\n')
    for i, line in enumerate(lines[58:71], start=59):
        if 'Präzision' in line or 'Euer' in line or 'Barrierefreiheit' in line:
            print(f'Line {i}: {repr(line)}')
