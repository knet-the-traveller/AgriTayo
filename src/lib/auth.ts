export const getSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const sessionStr = localStorage.getItem('agritayo_session');
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
  } catch (e) {
    return null;
  }
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('agritayo_session');
  document.cookie = 'agritayo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'agritayo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const isSuperadmin = () => {
  const session = getSession();
  return session?.role === 'superadmin';
};

const DUMMY_ACCOUNTS = [
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
};

export const saveUser = (user: any) => {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  users.push(user);
  localStorage.setItem('agritayo_users', JSON.stringify(users));
};

export const updateStoredUser = (updatedUser: any) => {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  const index = users.findIndex((u: any) => u.username === updatedUser.username);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('agritayo_users', JSON.stringify(users));
  }
};

export const login = (user: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('agritayo_session', JSON.stringify(user));
  document.cookie = `agritayo_session=true; path=/; max-age=86400`;
  document.cookie = `agritayo_role=${user.role}; path=/; max-age=86400`;
};

export const getRoleColor = (role: string) => {
  if (!role) return 'bg-slate-100 text-slate-700 border-slate-200';
  switch(role.toLowerCase()) {
    case 'superadmin': return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'seller': return 'bg-green-100 text-green-700 border-green-300';
    case 'buyer': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'driver': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'coop admin': return 'bg-purple-100 text-purple-700 border-purple-300';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
