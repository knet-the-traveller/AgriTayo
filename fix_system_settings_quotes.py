with open('src/app/system-settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\\'", "'")

with open('src/app/system-settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing quotes!")
