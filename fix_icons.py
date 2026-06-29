import glob, re

files = glob.glob('src/app/**/*.tsx', recursive=True) + ['src/components/Dashboard.tsx']

needed_icons = ['LayoutDashboard', 'Store', 'Sprout', 'ShoppingBag', 'Truck', 'Package', 'MapIcon', 'BarChart3', 'Settings', 'User', 'ChevronRight']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # find lucide-react import block
    m = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'\"`]lucide-react[\'\"`]', content)
    if not m:
        continue
        
    # extract aliases like "Map as MapIcon"
    # Actually it's easier to just do a naive check: if we need MapIcon, do we have MapIcon?
    # the regex m.group(1) is the inner part. 
    imports_str = m.group(1)
    
    missing = []
    
    for icon in needed_icons:
        # Check if icon is used in the file
        # We also want to make sure it's not already in the import string
        # Careful with 'Map as MapIcon'
        if icon in content:
            if icon == 'MapIcon':
                if 'MapIcon' not in imports_str:
                    missing.append('Map as MapIcon')
            else:
                if icon not in imports_str:
                    missing.append(icon)
    
    if missing:
        print(f'{f} is missing: {missing}')
        
        # We need to insert the missing icons into the import statement
        new_import = m.group(0).replace('}', ', ' + ', '.join(missing) + '\n}')
        new_content = content.replace(m.group(0), new_import)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f'Fixed {f}')
