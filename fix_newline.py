import os
import glob

files_to_check = glob.glob('src/app/**/*.tsx', recursive=True)

for file_path in files_to_check:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix literal \n
    if r"\nimport NotificationBell" in content:
        content = content.replace(r"\nimport NotificationBell", "\nimport NotificationBell")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Fixed syntax error!")
