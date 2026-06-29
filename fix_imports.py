import glob, re

files = glob.glob('src/app/**/*.tsx', recursive=True) + ['src/components/Dashboard.tsx']

needed_icons = ['Truck', 'Package', 'ShoppingBag', 'Sprout', 'ChevronRight']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # find lucide-react import block
    m = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'\"`]lucide-react[\'\"`]', content)
    if not m:
        continue
    imports = [x.strip() for x in m.group(1).split(',')]
    
    missing = []
    
    for icon in needed_icons:
        if icon in content and icon not in imports:
            missing.append(icon)
    
    if missing:
        print(f'{f} is missing: {missing}')
        
        # We need to insert the missing icons into the import statement
        new_import = m.group(0).replace('}', ', ' + ', '.join(missing) + '\n}')
        new_content = content.replace(m.group(0), new_import)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Fixed {f}')
