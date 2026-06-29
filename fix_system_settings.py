import re

# 1. Update auth.ts
with open('src/lib/auth.ts', 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_search = r'''export const getUsers = \(\) => \{
  if \(typeof window === 'undefined'\) return \[\];
  try \{
    const usersStr = localStorage\.getItem\('agritayo_users'\);
    if \(!usersStr \|\| JSON\.parse\(usersStr\)\.length === 0\) \{
      localStorage\.setItem\('agritayo_users', JSON\.stringify\(DUMMY_ACCOUNTS\)\);
      return DUMMY_ACCOUNTS;
    \}
    return JSON\.parse\(usersStr\);
  \} catch \(e\) \{
    return \[\];
  \}
\};'''

auth_replace = r'''export const getUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const usersStr = localStorage.getItem('agritayo_users');
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    // Check if dummies exist
    const hasDummies = users.some((u: any) => u.id === 'DA-1');
    if (!hasDummies) {
      // Set existing users to active
      users = users.map((u: any) => ({
        ...u,
        status: u.status || 'Active'
      }));
      users = [...users, ...DUMMY_ACCOUNTS];
      localStorage.setItem('agritayo_users', JSON.stringify(users));
    }
    
    return users;
  } catch (e) {
    return [];
  }
};'''

auth_content = re.sub(auth_search, auth_replace, auth_content)
with open('src/lib/auth.ts', 'w', encoding='utf-8') as f:
    f.write(auth_content)


# 2. Update Dashboard.tsx
with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    dash_content = f.read()

# We need to ensure that the dashboard pulls the updated users
# auth.ts handles the seeding logic, but dashboard uses localStorage directly in useEffect.
# We should change Dashboard to call getUsers() instead, or call getUsers() then read from localStorage.
# We can just change `JSON.parse(localStorage.getItem('agritayo_users') || '[]')` to `getUsers()`
# But we need to import `getUsers` if it's not imported.
# Let's check imports.
if 'getUsers' not in dash_content:
    dash_content = dash_content.replace('getRoleColor } from \'../lib/auth\';', 'getRoleColor, getUsers } from \'../lib/auth\';')

dash_search = r'const sysUsers = JSON\.parse\(localStorage\.getItem\(\'agritayo_users\'\) \|\| \'\[\]\'\);'
dash_replace = r'const sysUsers = getUsers();'
dash_content = re.sub(dash_search, dash_replace, dash_content)

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dash_content)


# 3. Update system-settings/page.tsx
with open('src/app/system-settings/page.tsx', 'r', encoding='utf-8') as f:
    sys_content = f.read()

# Make sure system-settings uses getUsers() as well so the seed runs
if 'getUsers' not in sys_content:
    sys_content = sys_content.replace('logout } from \'../../lib/auth\';', 'logout, getUsers } from \'../../lib/auth\';')

sys_effect_search = r'const storedUsers = JSON\.parse\(localStorage\.getItem\(\'agritayo_users\'\) \|\| \'\[\]\'\);'
sys_effect_replace = r'const storedUsers = getUsers();'
sys_content = re.sub(sys_effect_search, sys_effect_replace, sys_content)

# Default mapping for pending changed to Pending as before (existing are already active by the seed)
# So mapping stays the same

# Remove Left Sub-Nav
nav_search = r'<div className="max-w-\[1400px\] mx-auto flex flex-col lg:flex-row gap-8 pb-10 min-h-full">(.*?)\{\/\* Right Content \(75\%\) \*\/\}\n            <div className="flex-1">'
nav_replace = r'''<div className="max-w-[1400px] mx-auto pb-10 min-h-full">
            <div className="w-full">'''

sys_content = re.sub(nav_search, nav_replace, sys_content, flags=re.DOTALL)

with open('src/app/system-settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(sys_content)

print("Done with updates!")
