import os
import glob
import re

# 1. Update getRoleColor in auth.ts
with open('src/lib/auth.ts', 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_search = r'''export const getRoleColor = \(role: string\) => \{
  if \(!role\) return 'bg-slate-100 text-slate-700 border-slate-200';
  switch\(role\.toLowerCase\(\)\) \{
.*?
  \}
\};'''

auth_replace = r'''export const getRoleColor = (role: string) => {
  if (!role) return 'bg-slate-100 text-slate-700 border-slate-200';
  switch(role.toLowerCase()) {
    case 'superadmin': return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'seller': return 'bg-green-100 text-green-700 border-green-300';
    case 'buyer': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'driver': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'coop admin': return 'bg-purple-100 text-purple-700 border-purple-300';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};'''

auth_content = re.sub(auth_search, auth_replace, auth_content, flags=re.DOTALL)
with open('src/lib/auth.ts', 'w', encoding='utf-8') as f:
    f.write(auth_content)


# 2. Update System Settings label to User Management
files_to_check = glob.glob('src/app/**/*.tsx', recursive=True) + glob.glob('src/components/**/*.tsx', recursive=True)

for file_path in files_to_check:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("{ name: 'System Settings'", "{ name: 'User Management'")
    new_content = new_content.replace("useState('System Settings')", "useState('User Management')")
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

# 3. Update summary card counts in system-settings/page.tsx
with open('src/app/system-settings/page.tsx', 'r', encoding='utf-8') as f:
    sys_content = f.read()

count_search1 = r'<span className="text-3xl font-extrabold text-slate-900">142</span>'
count_replace1 = r'<span className="text-3xl font-extrabold text-slate-900">{users.length}</span>'
sys_content = re.sub(count_search1, count_replace1, sys_content)

count_search2 = r'<span className="text-3xl font-extrabold text-amber-600">5</span>'
count_replace2 = r'<span className="text-3xl font-extrabold text-amber-600">{users.filter((u: any) => u.status?.toLowerCase() === \'pending\').length}</span>'
sys_content = re.sub(count_search2, count_replace2, sys_content)

with open('src/app/system-settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(sys_content)

print("Polish updates applied successfully!")
