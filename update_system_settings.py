import re

with open('src/app/system-settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove INITIAL_USERS
content = re.sub(
    r'const INITIAL_USERS = \[.*?\];\n\n',
    '',
    content,
    flags=re.DOTALL
)

# 2. Add filteredUsers logic & replace state
state_replace = '''  // Tab 1 States
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const filteredUsers = users.filter((u: any) => userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase());'''

content = re.sub(
    r'  // Tab 1 States\n  const \[users, setUsers\] = useState\(INITIAL_USERS\);\n  const \[showAddUser, setShowAddUser\] = useState\(false\);',
    state_replace,
    content
)

# 3. Add localStorage mapping logic to useEffect
effect_search = r'setActiveDeliveriesCount\(activeForDriver\.length\);\n    \}\n  \}, \[\]\);'
effect_replace = r'''setActiveDeliveriesCount(activeForDriver.length);
      
      const storedUsers = JSON.parse(localStorage.getItem('agritayo_users') || '[]');
      if (storedUsers.length > 0) {
        const formattedUsers = storedUsers.map((u: any, idx: number) => ({
          id: u.id || idx,
          name: u.name || u.username || 'Unknown',
          role: u.role || 'user',
          org: u.coopName || 'Independent',
          status: u.status || 'Pending',
          joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'
        }));
        setUsers(formattedUsers);
      }
    }
  }, []);'''

content = re.sub(effect_search, effect_replace, content)

# 4. Filter tabs & remove Add User
add_user_search = r'                  </div>\n\n                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">\n                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">\n                      <h3 className="font-bold text-slate-900">System Users</h3>\n                      <button \n                        onClick=\{.*?\} Add User\n                      </button>\n                    </div>\n\n                    \{showAddUser && \(.*?\)\}\n\n                    <div className="overflow-x-auto custom-scrollbar">'
add_user_replace = r'''                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-4 border-b border-slate-200 mt-2 mb-2 overflow-x-auto custom-scrollbar">
                    {['All', 'Buyer', 'Seller', 'Driver', 'Coop Admin', 'Superadmin'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setUserRoleFilter(tab)}
                        className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${
                          userRoleFilter === tab ? 'text-[#1a5c2e]' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab}
                        {userRoleFilter === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a5c2e] rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">System Users</h3>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">'''

content = re.sub(add_user_search, add_user_replace, content, flags=re.DOTALL)

# 5. users.map -> filteredUsers.map
content = re.sub(
    r'\{users\.map\(\(user\) => \(',
    r'{filteredUsers.map((user) => (',
    content
)

with open('src/app/system-settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
