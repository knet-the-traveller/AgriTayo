with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\\'", "'")

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done fixing quotes!")
