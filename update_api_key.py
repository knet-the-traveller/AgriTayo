import os
import re

files_to_update = [
    'src/app/live-tracking/page.tsx',
    'src/components/Dashboard.tsx'
]

key_search = r'apiKey="AIzaSyDRsOS4RXA2d0l8foUmFykK0L4-o7iOfd8"'
key_replace = r'apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}'

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = re.sub(key_search, key_replace, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Replaced hardcoded API key!")
