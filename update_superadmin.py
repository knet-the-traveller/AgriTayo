import re

# 1. Update auth.ts
with open('src/lib/auth.ts', 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_search = r'''export const getUsers = \(\) => \{
  if \(typeof window === 'undefined'\) return \[\];
  try \{
    const usersStr = localStorage\.getItem\('agritayo_users'\);
    if \(!usersStr\) return \[\];
    return JSON\.parse\(usersStr\);
  \} catch \(e\) \{
    return \[\];
  \}
\};'''

auth_replace = r'''const DUMMY_ACCOUNTS = [
  { id: "DA-1", username: "jose.mendoza", name: "Jose Rizal Mendoza", role: "Seller", coopName: "Benguet Vegetable Growers Coop", status: "Active", createdAt: "2026-01-10T00:00:00Z" },
  { id: "DA-2", username: "maria.santos", name: "Maria Clara Santos", role: "Buyer", coopName: "Landmark Supermarket", status: "Active", createdAt: "2026-02-03T00:00:00Z" },
  { id: "DA-3", username: "carlo.reyes", name: "Carlo Reyes", role: "Driver", coopName: "LBC Agri Logistics", status: "Active", createdAt: "2026-02-28T00:00:00Z" },
  { id: "DA-4", username: "ligaya.fuentebella", name: "Ligaya Fuentebella", role: "Coop Admin", coopName: "Quezon Coconut Farmers Coop", status: "Active", createdAt: "2026-03-14T00:00:00Z" },
  { id: "DA-5", username: "dante.villanueva", name: "Dante Villanueva", role: "Buyer", coopName: "Puregold Price Club", status: "Pending", createdAt: "2026-06-20T00:00:00Z" },
  { id: "DA-6", username: "ana.corpuz", name: "Ana Liza Corpuz", role: "Seller", coopName: "Nueva Ecija Rice Traders", status: "Active", createdAt: "2026-04-05T00:00:00Z" }
];

export const getUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const usersStr = localStorage.getItem('agritayo_users');
    if (!usersStr || JSON.parse(usersStr).length === 0) {
      localStorage.setItem('agritayo_users', JSON.stringify(DUMMY_ACCOUNTS));
      return DUMMY_ACCOUNTS;
    }
    return JSON.parse(usersStr);
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

# Add states
states_search = r'  const \[activeRoute, setActiveRoute\] = useState<any>\(null\);'
states_replace = r'''  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [totalRegisteredUsers, setTotalRegisteredUsers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [activeCooperatives, setActiveCooperatives] = useState(0);
  const [platformActiveDispatches, setPlatformActiveDispatches] = useState(0);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [platformRoutes, setPlatformRoutes] = useState<any[]>([]);'''

dash_content = re.sub(states_search, states_replace, dash_content)

# Add useEffect logic
effect_search = r'          isDelayed: Math\.random\(\) > 0\.5\n        \}\);\n      \}\n    \}\n  \}, \[\]\);'
effect_replace = r'''          isDelayed: Math.random() > 0.5
        });
      }

      if (user.role === 'superadmin') {
         const sysUsers = JSON.parse(localStorage.getItem('agritayo_users') || '[]');
         if (sysUsers.length === 0) {
           // Fallback if auth.ts hasn't seeded yet
           setTotalRegisteredUsers(6);
         } else {
           setTotalRegisteredUsers(sysUsers.length);
           setPendingApprovals(sysUsers.filter((u: any) => u.status === 'Pending').length);
           setRecentSignups([...sysUsers].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
           const orgs = new Set(sysUsers.map((u:any) => u.coopName).filter(Boolean));
           setActiveCooperatives(orgs.size);
         }
         
         const allDispatches = orders.filter((o:any) => o.status === 'confirmed' || o.status === 'in-transit');
         setPlatformActiveDispatches(allDispatches.length);
         
         const routes = allDispatches.map((d: any) => ({
            origin: d.pickupCoords || { lat: 15.4867, lng: 120.9664 },
            destination: d.deliveryCoords || { lat: 14.5990, lng: 120.9672 },
         }));
         setPlatformRoutes(routes.length > 0 ? routes : [{ origin: { lat: 15.4867, lng: 120.9664 }, destination: { lat: 14.5990, lng: 120.9672 } }]);
      }
    }
  }, []);'''

dash_content = re.sub(effect_search, effect_replace, dash_content)

# Add superadminCards
cards_search = r'  const driverCards = \[\n    \{ id: \'dc1\'(.*?)\n    \{ id: \'dc3\'(.*?)\n  \];'
cards_replace = r'''  const driverCards = [
    { id: 'dc1'\g<1>
    { id: 'dc3'\g<2>
  ];

  const superadminCards = [
    { id: 'sa1', label: 'Total Registered Users', value: totalRegisteredUsers, icon: <User className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'sa2', label: 'Pending Approvals', value: pendingApprovals, icon: <AlertTriangle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'sa3', label: 'Active Cooperatives', value: activeCooperatives, icon: <Store className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'sa4', label: 'Active Dispatches', value: platformActiveDispatches, icon: <Truck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> }
  ];'''

dash_content = re.sub(cards_search, cards_replace, dash_content, flags=re.DOTALL)

# Map ternary rendering cards
dash_content = re.sub(
    r'\{\(session\?\.role === \'driver\' \? driverCards : METRICS\)\.map',
    r'{(session?.role === \'driver\' ? driverCards : session?.role === \'superadmin\' ? superadminCards : METRICS).map',
    dash_content
)

# Render platformRoutes on map
map_search = r'\{session\?\.role === \'driver\' && activeRoute && \(\n                        <RouteLine origin=\{activeRoute\.origin\} destination=\{activeRoute\.destination\} />\n                      \)\}'
map_replace = r'''{session?.role === 'driver' && activeRoute && (
                        <RouteLine origin={activeRoute.origin} destination={activeRoute.destination} />
                      )}
                      {session?.role === 'superadmin' && platformRoutes.map((route, i) => (
                        <RouteLine key={i} origin={route.origin} destination={route.destination} />
                      ))}'''

dash_content = re.sub(map_search, map_replace, dash_content)

# Bottom layout
bottom_search = r'\{\/\* Left Chart \*\/\}\n              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">'
bottom_replace = r'''{/* Left Chart */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">'''

bottom_full_search = r'            \{session\?\.role === \'driver\' \? \(\n              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">\n                 \{\/\* Driver Active Deliveries Panel \*\/\}(.*?)\n              </div>\n            \) : \(\n              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">\n                \{\/\* Left Chart \*\/\}'

bottom_full_replace = r'''            {session?.role === 'driver' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                 {/* Driver Active Deliveries Panel */}\g<1>
              </div>
            ) : session?.role === 'superadmin' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Recent Sign-ups */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-emerald-600" />
                    Recent Sign-ups
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {recentSignups.map((usr, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{usr.name}</p>
                          <p className="text-xs text-slate-500">{new Date(usr.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(usr.role)}`}>{usr.role}</span>
                      </div>
                    ))}
                    {recentSignups.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No recent sign-ups</p>}
                  </div>
                </div>

                {/* Platform Alerts */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Platform Alerts
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {AI_LIVE_FEED.map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${item.severity === 'URGENT' ? 'bg-rose-500' : item.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.severity === 'URGENT' ? 'text-rose-600' : item.severity === 'WARNING' ? 'text-amber-600' : 'text-blue-600'}`}>
                              {item.severity}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">• {item.time}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-snug">{item.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Left Chart */}'''

dash_content = re.sub(bottom_full_search, bottom_full_replace, dash_content, flags=re.DOTALL)

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dash_content)
print("Done!")
