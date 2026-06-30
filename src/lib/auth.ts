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
  { id: "DA-6", username: "ana.corpuz", name: "Ana Liza Corpuz", role: "Seller", coopName: "Nueva Ecija Rice Traders", status: "Active", createdAt: "2026-04-05T00:00:00Z" },
  { id: "DA-7", username: "roberto.aquino", name: "Roberto Aquino", role: "Seller", coopName: "Pangasinan Rice Farmers Coop", status: "Active", createdAt: "2026-03-02T00:00:00Z" },
  { id: "DA-8", username: "liza.domingo", name: "Liza Domingo", role: "Buyer", coopName: "SM Supermarket", status: "Active", createdAt: "2026-03-10T00:00:00Z" },
  { id: "DA-9", username: "edgar.pascual", name: "Edgar Pascual", role: "Driver", coopName: "Swift Agri Logistics", status: "Active", createdAt: "2026-03-18T00:00:00Z" },
  { id: "DA-10", username: "cynthia.manalo", name: "Cynthia Manalo", role: "Seller", coopName: "Cavite Vegetable Growers", status: "Active", createdAt: "2026-03-25T00:00:00Z" },
  { id: "DA-11", username: "vicente.ramos", name: "Vicente Ramos", role: "Coop Admin", coopName: "Pampanga Farmers Alliance", status: "Active", createdAt: "2026-04-01T00:00:00Z" },
  { id: "DA-12", username: "teresa.bautista", name: "Teresa Bautista", role: "Buyer", coopName: "Robinsons Supermarket", status: "Active", createdAt: "2026-04-08T00:00:00Z" },
  { id: "DA-13", username: "arnel.castro", name: "Arnel Castro", role: "Driver", coopName: "AgriTayo Logistics", status: "Active", createdAt: "2026-04-15T00:00:00Z" },
  { id: "DA-14", username: "josefina.lim", name: "Josefina Lim", role: "Seller", coopName: "Batangas Fruit Growers Coop", status: "Active", createdAt: "2026-04-20T00:00:00Z" },
  { id: "DA-15", username: "renato.garcia", name: "Renato Garcia", role: "Buyer", coopName: "Puregold Price Club", status: "Pending", createdAt: "2026-04-28T00:00:00Z" },
  { id: "DA-16", username: "marivic.torres", name: "Marivic Torres", role: "Seller", coopName: "Ilocos Garlic Farmers Coop", status: "Active", createdAt: "2026-05-03T00:00:00Z" },
  { id: "DA-17", username: "boyet.fernandez", name: "Boyet Fernandez", role: "Driver", coopName: "LBC Agri Logistics", status: "Active", createdAt: "2026-05-10T00:00:00Z" },
  { id: "DA-18", username: "grace.villareal", name: "Grace Villareal", role: "Buyer", coopName: "Landmark Supermarket", status: "Active", createdAt: "2026-05-15T00:00:00Z" },
  { id: "DA-19", username: "danilo.ocampo", name: "Danilo Ocampo", role: "Seller", coopName: "Laguna Rice Traders", status: "Inactive", createdAt: "2026-05-20T00:00:00Z" },
  { id: "DA-20", username: "susan.mercado", name: "Susan Mercado", role: "Coop Admin", coopName: "Bicol Farmers Cooperative", status: "Active", createdAt: "2026-05-25T00:00:00Z" },
  { id: "DA-21", username: "felipe.navarro", name: "Felipe Navarro", role: "Driver", coopName: "Swift Agri Logistics", status: "Active", createdAt: "2026-06-01T00:00:00Z" },
  { id: "DA-22", username: "imelda.cruz", name: "Imelda Cruz", role: "Buyer", coopName: "SM Supermarket", status: "Pending", createdAt: "2026-06-08T00:00:00Z" },
  { id: "DA-23", username: "ramon.espiritu", name: "Ramon Espiritu", role: "Seller", coopName: "Davao Banana Growers Coop", status: "Active", createdAt: "2026-06-14T00:00:00Z" },
  { id: "DA-24", username: "cristina.salazar", name: "Cristina Salazar", role: "Buyer", coopName: "Robinsons Supermarket", status: "Active", createdAt: "2026-06-20T00:00:00Z" },
  { id: "DA-25", username: "joel.mariano", name: "Joel Mariano", role: "Driver", coopName: "AgriTayo Logistics", status: "Active", createdAt: "2026-06-26T00:00:00Z" }
];

export const getUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const usersStr = localStorage.getItem('agritayo_users');
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    // Check if latest dummies exist
    const hasLatestDummies = users.some((u: any) => u.id === 'DA-25');
    if (!hasLatestDummies) {
      // Remove old dummies
      users = users.filter((u: any) => !u.id || !u.id.startsWith('DA-'));
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
