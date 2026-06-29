"use client";

import React, { useState, useEffect } from 'react';
import NotificationBell from '../../components/NotificationBell';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
  Map as MapIcon,
  Search,
  Bell,
  ChevronDown,
  Menu,
  Store,
  Leaf,
  Users,
  Wheat,
  Sliders,
  BellRing,
  Database,
  ShieldCheck,
  MoreVertical,
  Check,
  X,
  Edit2,
  Download,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  RefreshCw,
  LogOut,
  Loader2,
  User,
  Sprout,
  ShoppingBag
, Truck, Package
} from 'lucide-react';
import { getSession, logout, getUsers } from '../../lib/auth';

const COOPS = [
  { id: 1, name:"Nueva Ecija Farmers Coop", location:"Cabanatuan City, Nueva Ecija", contact:"Ramon Dela Cruz", listings:5, verified:"Verified" },
  { id: 2, name:"Benguet Highland Coop", location:"La Trinidad, Benguet", contact:"Marta Reyes", listings:4, verified:"Verified" },
  { id: 3, name:"Laguna Lowland Growers", location:"Los Baños, Laguna", contact:"Jose Santos", listings:3, verified:"Verified" },
  { id: 4, name:"Batangas Organic Growers", location:"Lipa City, Batangas", contact:"Maria Flores", listings:4, verified:"Verified" },
  { id: 5, name:"Isabela Corn Alliance", location:"Cauayan, Isabela", contact:"Pedro Ramos", listings:2, verified:"Verified" },
  { id: 6, name:"Quezon Root Crop Assoc.", location:"Lucena City, Quezon", contact:"Ernesto Cruz", listings:2, verified:"Pending" },
  { id: 7, name:"Cavite Valley Growers", location:"Tagaytay, Cavite", contact:"Gloria Mendoza", listings:1, verified:"Pending" },
];

const INITIAL_RULES = [
  { id: 1, type: 'Urgent Harvest Alert', condition: 'Days to harvest ≤ 2', channel: 'In-app + SMS', active: true },
  { id: 2, type: 'AI Match Found', condition: 'Score ≥ 85%', channel: 'In-app', active: true },
  { id: 3, type: 'Dispatch Delayed', condition: 'ETA exceeded by 1hr', channel: 'In-app + Email', active: true },
  { id: 4, type: 'Low Stock Warning', condition: 'Volume < 100kg', channel: 'In-app', active: true },
  { id: 5, type: 'New Coop Registration', condition: 'On submission', channel: 'Email to admin', active: true },
  { id: 6, type: 'Price Floor Breach Attempt', condition: 'On listing submit', channel: 'In-app', active: true },
];

const SESSIONS = [
  { id: 1, user:"Mark Baguisi", device:"Chrome / Windows", location:"Pasig City, NCR", lastActive:"Just now", current:true },
  { id: 2, user:"Ramon Dela Cruz", device:"Safari / iPhone", location:"Cabanatuan City", lastActive:"12 mins ago", current:false },
  { id: 3, user:"Juan Mercado", device:"Chrome / Android", location:"Manila", lastActive:"1 hr ago", current:false },
  { id: 4, user:"Boyet Reyes", device:"Chrome / Windows", location:"Quezon City", lastActive:"3 hrs ago", current:false },
];

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${checked ? 'bg-[#1a5c2e]' : 'bg-slate-300'}`}
  >
    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export default function SystemSettingsPage() {
  const [activeNav, setActiveNav] = useState('User Management');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [toastMessage, setToastMessage] = useState('');

  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);

  useEffect(() => {
    const user = getSession();
    if (!user) {
      window.location.href = '/login';
    } else {
      setSession(user);
      setIsAuthLoading(false);
      
      const orders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const pending = orders.filter((o: any) => o.buyerId === user.id && (o.status === 'pending' || o.status === 'confirmed'));
      setPendingOrdersCount(pending.length);
      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);
      
      const storedUsers = getUsers();
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
  }, []);

  // Tab 1 States
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const filteredUsers = users.filter((u: any) => userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase());
  
  // Tab 3 States
  const [config, setConfig] = useState({
    matchSensitivity: 'Medium', forecastWindow: '7 days', autoAlert: true,
    priceFloor: true, floorCalcMethod: 'BigQuery 30-day avg', manualOverrideBuffer: 15,
    urgentDays: 2, soonDays: 5,
    platformName: 'Agri Tayo', lat: 12.8797, lng: 121.7740, zoom: 7, currency: '₱', dateFormat: 'MMM DD YYYY'
  });

  // Tab 4 States
  const [rules, setRules] = useState(INITIAL_RULES);
  const [inAppActive, setInAppActive] = useState(true);
  const [emailActive, setEmailActive] = useState(true);
  const [smsActive, setSmsActive] = useState(false);

  // Tab 5 States
  const [confirmAction, setConfirmAction] = useState<null | 'cleanup' | 'reset'>(null);

  // Tab 6 States
  const [showMapKey, setShowMapKey] = useState(false);
  const [showVertexKey, setShowVertexKey] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

    const navItems = [
    { name: 'Dashboard Overview', icon: LayoutDashboard, href: '/' },
    ...(session?.role !== 'driver' ? [{ name: 'Market', icon: Store, href: '/market' }] : []),
    ...(session?.role === 'seller' ? [{ name: 'Post Harvest', icon: Sprout, href: '/post-harvest' }] : []),
    ...(session?.role === 'buyer' ? [{ name: 'My Orders', icon: ShoppingBag, href: '/my-orders' }] : []),
    ...(session?.role === 'driver' ? [
      { name: 'Available Deliveries', icon: Truck, href: '/available-deliveries' },
      { name: 'My Deliveries', icon: Package, href: '/my-deliveries' }
    ] : []),
    { name: 'Live Tracking', icon: MapIcon, href: '/live-tracking' },
    { name: 'Analytics', icon: BarChart3, href: '/analytics' },
    ...(session?.role === 'superadmin' ? [{ name: 'User Management', icon: Settings, href: '/system-settings' }] : []),
    ...(session && session.role !== 'superadmin' ? [{ name: 'Profile', icon: User, href: '/profile' }] : []),
  ];

  const SETTINGS_TABS = [
    { id: 'users', name: 'User Management', icon: <Users className="w-5 h-5" /> },
    { id: 'coops', name: 'Cooperative Registry', icon: <Wheat className="w-5 h-5" /> },
    { id: 'config', name: 'Platform Configuration', icon: <Sliders className="w-5 h-5" /> },
    { id: 'alerts', name: 'Notifications & Alerts', icon: <BellRing className="w-5 h-5" /> },
    { id: 'data', name: 'Data & Export', icon: <Database className="w-5 h-5" /> },
    { id: 'security', name: 'Security & Access', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleNavClick = (item: any) => {
    setActiveNav(item.name);
    if (item.href && item.href !== '#') {
      window.location.href = item.href;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'Superadmin': return 'bg-[#1a5c2e]/10 text-[#1a5c2e] border-[#1a5c2e]/20';
      case 'Coop Admin': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Buyer': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Driver': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suspended': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#1a5c2e] animate-spin mb-4" />
        <div className="text-[#1a5c2e] font-bold text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50/50 text-slate-900 font-sans overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-100 justify-between">
            <div className={`flex items-center gap-3 cursor-pointer group ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl shadow-sm group-hover:shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300 shrink-0">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="whitespace-nowrap overflow-hidden transition-all duration-300">
                  <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">Agri Tayo</h1>
                </div>
              )}
            </div>
          </div>

          {session && !isSidebarCollapsed && (
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col items-center text-center bg-slate-50/50">
              <div className="w-12 h-12 bg-[#1a5c2e] rounded-full flex items-center justify-center text-white text-lg font-black shadow-sm mb-3">
                {session.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{session.name}</h3>
              <span className={`mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(session.role)}`}>
                {session.role}
              </span>
            </div>
          )}

          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                title={isSidebarCollapsed ? item.name : undefined}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                  activeNav === item.name
                    ? 'text-emerald-700 bg-emerald-50/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                {activeNav === item.name && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-500 rounded-r-full" />
                )}
                
                <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                  activeNav === item.name 
                    ? 'text-emerald-600' 
                    : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-600'
                }`} />
                {!isSidebarCollapsed && (
                  <div className="relative z-10 flex flex-1 items-center justify-between">
                    <span className="whitespace-nowrap">{item.name}</span>
                                        {item.name === 'My Orders' && pendingOrdersCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {pendingOrdersCount}
                      </span>
                    )}
                    {item.name === 'Available Deliveries' && availableDeliveriesCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {availableDeliveriesCount}
                      </span>
                    )}
                    {item.name === 'My Deliveries' && activeDeliveriesCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {activeDeliveriesCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${isSidebarCollapsed ? '' : 'hidden'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className={`w-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-3 rounded-xl text-sm font-bold transition-all duration-300 ${isSidebarCollapsed ? 'px-0' : 'gap-2 px-4'}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />

        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">System Administration</h2>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell role={session?.role} />
            <div className="h-8 w-px bg-slate-200" />
            {session && (
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="h-9 w-9 bg-[#1a5c2e] rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                  {session.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{session.name}</span>
                  <span className="text-[11px] font-medium text-slate-500 capitalize">{session.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 z-0">
          <div className="max-w-[1400px] mx-auto pb-10 min-h-full">
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {SETTINGS_TABS.find(t => t.id === activeTab)?.name}
                </h2>
              </div>

              {/* TAB 1: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                      <span className="text-sm font-semibold text-slate-500 mb-2">Total Users</span>
                      <span className="text-3xl font-extrabold text-slate-900">{users.length}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                      <span className="text-sm font-semibold text-slate-500 mb-2">Active This Week</span>
                      <span className="text-3xl font-extrabold text-slate-900">38</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                      <span className="text-sm font-semibold text-slate-500 mb-2">Pending Approval</span>
                      <span className="text-3xl font-extrabold text-amber-600">{users.filter((u: any) => u.status?.toLowerCase() === 'pending').length}</span>
                    </div>
                  </div>

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

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 font-bold">Name</th>
                            <th className="px-6 py-4 font-bold">Role</th>
                            <th className="px-6 py-4 font-bold">Cooperative / Org</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Joined</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(user.role)}`}>{user.role}</span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-600">{user.org}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(user.status)}`}>{user.status}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{user.joined}</td>
                              <td className="px-6 py-4 flex justify-end gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button 
                                  onClick={() => {
                                    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
                                    setUsers(users.map(u => u.id === user.id ? {...u, status: nextStatus} : u));
                                    showToast(`User ${nextStatus.toLowerCase()}`);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${user.status === 'Active' ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                >
                                  {user.status === 'Active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COOPERATIVE REGISTRY */}
              {activeTab === 'coops' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                      <span className="text-sm font-semibold text-slate-500 mb-2">Registered Coops</span>
                      <span className="text-3xl font-extrabold text-slate-900">7</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                      <span className="text-sm font-semibold text-slate-500 mb-2">Verified</span>
                      <span className="text-3xl font-extrabold text-emerald-600">5</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
                      <span className="text-sm font-semibold text-slate-500 mb-2">Pending Verification</span>
                      <span className="text-3xl font-extrabold text-amber-600">2</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 bg-[#1a5c2e] hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                      <Plus className="w-4 h-4" /> Register Cooperative
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {COOPS.map(coop => (
                      <div key={coop.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-lg text-slate-900">{coop.name}</h4>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            coop.verified === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {coop.verified === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {coop.verified}
                          </span>
                        </div>
                        <div className="space-y-2 mb-6 text-sm text-slate-600 font-medium">
                          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {coop.location}</p>
                          <p className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> {coop.contact} <span className="text-slate-400 font-normal">(+63 912 345 6789)</span></p>
                          <p className="flex items-center gap-2"><Store className="w-4 h-4 text-slate-400" /> {coop.listings} active listings</p>
                        </div>
                        <div className="flex gap-3 border-t border-slate-100 pt-4">
                          <button className="flex-1 text-center py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-sm font-bold transition-colors">
                            View Listings
                          </button>
                          <button className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold transition-colors">
                            Edit Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PLATFORM CONFIGURATION */}
              {activeTab === 'config' && (
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">AI Matching Engine</h3>
                    <p className="text-sm text-slate-500">Configure parameters for the AI demand/supply match algorithm.</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Match Sensitivity</label>
                      <p className="text-xs text-slate-500 mb-3">Higher sensitivity surfaces more matches but may reduce precision</p>
                      <input type="range" min="1" max="3" value={config.matchSensitivity === 'Low' ? 1 : config.matchSensitivity === 'Medium' ? 2 : 3} 
                        onChange={(e) => setConfig({...config, matchSensitivity: e.target.value === '1' ? 'Low' : e.target.value === '2' ? 'Medium' : 'High'})}
                        className="w-full max-w-sm accent-[#1a5c2e]" />
                      <div className="w-full max-w-sm flex justify-between text-xs font-bold text-slate-400 mt-2">
                        <span className={config.matchSensitivity === 'Low' ? 'text-[#1a5c2e]' : ''}>Low</span>
                        <span className={config.matchSensitivity === 'Medium' ? 'text-[#1a5c2e]' : ''}>Medium</span>
                        <span className={config.matchSensitivity === 'High' ? 'text-[#1a5c2e]' : ''}>High</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Forecast Window</label>
                      <p className="text-xs text-slate-500 mb-2">How far ahead the AI looks for demand supply matches</p>
                      <select 
                        value={config.forecastWindow} onChange={(e) => setConfig({...config, forecastWindow: e.target.value})}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none min-w-[200px]"
                      >
                        <option>3 days</option>
                        <option>7 days</option>
                        <option>14 days</option>
                        <option>30 days</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Auto-Alert Threshold</label>
                        <p className="text-xs text-slate-500">Automatically notify cooperatives when a high-confidence match is found</p>
                      </div>
                      <div className="ml-auto">
                        <Toggle checked={config.autoAlert} onChange={(v) => setConfig({...config, autoAlert: v})} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-y border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Fair Price Floor</h3>
                    <p className="text-sm text-slate-500 mb-6">Protections to ensure farmers receive above-middleman rates.</p>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Enable Price Floor Protection</label>
                          <p className="text-xs text-slate-500">Prevents listings below the computed fair price floor</p>
                        </div>
                        <div className="ml-auto">
                          <Toggle checked={config.priceFloor} onChange={(v) => setConfig({...config, priceFloor: v})} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Floor Calculation Method</label>
                        <select 
                          value={config.floorCalcMethod} onChange={(e) => setConfig({...config, floorCalcMethod: e.target.value})}
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none min-w-[250px]"
                        >
                          <option>BigQuery 30-day avg</option>
                          <option>Manual override</option>
                          <option>DA Published Rate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Manual Override Buffer (%)</label>
                        <p className="text-xs text-slate-500 mb-2">Minimum % above middleman rate to set as floor</p>
                        <input type="number" value={config.manualOverrideBuffer} onChange={(e) => setConfig({...config, manualOverrideBuffer: Number(e.target.value)})}
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none w-24" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">Harvest Urgency Thresholds</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <label className="block text-sm font-bold text-rose-800 mb-2">Urgent (Days ≤)</label>
                        <input type="number" value={config.urgentDays} onChange={(e) => setConfig({...config, urgentDays: Number(e.target.value)})}
                          className="w-full border border-rose-200 rounded-lg px-3 py-2 text-sm focus:border-rose-500 outline-none bg-white text-rose-900 font-bold" />
                      </div>
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <label className="block text-sm font-bold text-amber-800 mb-2">Soon (Days ≤)</label>
                        <input type="number" value={config.soonDays} onChange={(e) => setConfig({...config, soonDays: Number(e.target.value)})}
                          className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:border-amber-500 outline-none bg-white text-amber-900 font-bold" />
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 opacity-80 cursor-not-allowed">
                        <label className="block text-sm font-bold text-emerald-800 mb-2">Fresh (Days &gt;)</label>
                        <input type="number" value={config.soonDays} readOnly
                          className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm outline-none bg-emerald-100 text-emerald-900 font-bold cursor-not-allowed" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4">Platform Core</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Platform Name</label>
                        <input type="text" value={config.platformName} onChange={(e) => setConfig({...config, platformName: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Currency Symbol</label>
                        <input type="text" value={config.currency} onChange={(e) => setConfig({...config, currency: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-700 mb-1">Map Lat</label>
                          <input type="number" value={config.lat} onChange={(e) => setConfig({...config, lat: Number(e.target.value)})} step="0.0001"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-700 mb-1">Map Lng</label>
                          <input type="number" value={config.lng} onChange={(e) => setConfig({...config, lng: Number(e.target.value)})} step="0.0001"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Map Zoom</label>
                        <input type="number" value={config.zoom} onChange={(e) => setConfig({...config, zoom: Number(e.target.value)})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                    <button 
                      onClick={() => showToast('Configuration saved successfully')}
                      className="w-full bg-[#1a5c2e] hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold shadow-md transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS & ALERTS */}
              {activeTab === 'alerts' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">In-App Notifications</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Top nav bell icon</p>
                      </div>
                      <Toggle checked={inAppActive} onChange={setInAppActive} />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">Email Alerts</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Digest and urgent</p>
                      </div>
                      <Toggle checked={emailActive} onChange={setEmailActive} />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between opacity-70">
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">SMS (USSD) <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">Coming Soon</span></h4>
                        <p className="text-xs text-slate-500 mt-0.5">For offline farmers</p>
                      </div>
                      <Toggle checked={smsActive} onChange={setSmsActive} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">Alert Rules Engine</h3>
                      <button className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                        <Plus className="w-4 h-4" /> Add Alert Rule
                      </button>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 font-bold">Alert Type</th>
                            <th className="px-6 py-4 font-bold">Trigger Condition</th>
                            <th className="px-6 py-4 font-bold">Channel</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rules.map((rule) => (
                            <tr key={rule.id} className={`transition-colors ${rule.active ? 'hover:bg-slate-50/50' : 'bg-slate-50/30 opacity-70'}`}>
                              <td className="px-6 py-4 font-bold text-slate-900">{rule.type}</td>
                              <td className="px-6 py-4 font-medium text-slate-600">{rule.condition}</td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">{rule.channel}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rule.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                  {rule.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 flex justify-end">
                                <Toggle checked={rule.active} onChange={(v) => {
                                  setRules(rules.map(r => r.id === rule.id ? {...r, active: v} : r));
                                  showToast(`Rule ${v ? 'activated' : 'deactivated'}`);
                                }} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DATA & EXPORT */}
              {activeTab === 'data' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-6">Export Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Export All Listings (CSV)', sub: 'All active and past harvest listings', icon: <Download className="w-5 h-5" /> },
                        { title: 'Export Orders Report (CSV)', sub: 'All completed and pending orders', icon: <Download className="w-5 h-5" /> },
                        { title: 'Export Cooperative Data (CSV)', sub: 'Registered coops and contact info', icon: <Download className="w-5 h-5" /> },
                        { title: 'Export Analytics Summary (PDF)', sub: 'Full analytics report for the month', icon: <FileText className="w-5 h-5" /> },
                      ].map((btn, i) => (
                        <button 
                          key={i}
                          onClick={() => showToast(`Preparing ${btn.title.split(' ')[1]} export...`)}
                          className="flex items-center justify-between p-4 rounded-xl border border-[#1a5c2e]/20 bg-emerald-50/20 hover:bg-emerald-50/50 hover:border-[#1a5c2e]/40 transition-all text-left group"
                        >
                          <div>
                            <h4 className="font-bold text-[#1a5c2e] mb-1">{btn.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">{btn.sub}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-100 text-[#1a5c2e] group-hover:scale-110 transition-transform">
                            {btn.icon}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-rose-200/80 rounded-2xl shadow-sm p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-rose-50 rounded-bl-[100%] pointer-events-none" />
                    <h3 className="font-bold text-rose-900 text-lg mb-6 relative z-10 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Data Management
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                      {/* Clear Listings */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-rose-200 bg-white">
                        <div className="mb-4 sm:mb-0">
                          <h4 className="font-bold text-slate-900 mb-1">Clear Expired Listings</h4>
                          <p className="text-xs text-slate-500 font-medium">Remove all listings past their harvest date</p>
                        </div>
                        {confirmAction === 'cleanup' ? (
                          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-xs font-bold text-rose-600 mr-2">Are you sure? This cannot be undone.</span>
                            <button onClick={() => setConfirmAction(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                            <button onClick={() => { setConfirmAction(null); showToast('Cleanup successful'); }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm">Confirm</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmAction('cleanup')} className="border border-rose-600 text-rose-600 hover:bg-rose-50 px-5 py-2 rounded-xl text-sm font-bold transition-colors">
                            Run Cleanup
                          </button>
                        )}
                      </div>

                      {/* Reset Data */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-rose-200 bg-white">
                        <div className="mb-4 sm:mb-0">
                          <h4 className="font-bold text-slate-900 mb-1">Reset Demo Data</h4>
                          <p className="text-xs text-slate-500 font-medium">Restore all mock data to defaults (demo mode only)</p>
                        </div>
                        {confirmAction === 'reset' ? (
                          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-xs font-bold text-rose-600 mr-2">Are you sure? This cannot be undone.</span>
                            <button onClick={() => setConfirmAction(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                            <button onClick={() => { setConfirmAction(null); showToast('Data reset to defaults'); }} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm">Confirm</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmAction('reset')} className="border border-rose-600 text-rose-600 hover:bg-rose-50 px-5 py-2 rounded-xl text-sm font-bold transition-colors">
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY & ACCESS */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Sessions */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-slate-900">Logged-in sessions</h3>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 font-bold">User</th>
                            <th className="px-6 py-4 font-bold">Device</th>
                            <th className="px-6 py-4 font-bold">Location</th>
                            <th className="px-6 py-4 font-bold">Last Active</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {SESSIONS.map((session) => (
                            <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                                {session.user}
                                {session.current && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">Current</span>}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-600">{session.device}</td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{session.location}</td>
                              <td className="px-6 py-4 text-slate-500 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{session.lastActive}</td>
                              <td className="px-6 py-4 flex justify-end">
                                {!session.current && (
                                  <button onClick={() => showToast('Session revoked')} className="text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                                    Revoke
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-6">API Keys</h3>
                    
                    <div className="space-y-4 mb-4">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-900">Google Maps Platform Key</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-sm text-slate-600 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                            {showMapKey ? "AIzaSyDRsOS4RXA2d0l8foUmFykK0L4-o7iOfd8" : "AIza••••••••••••••••••••XyZ"}
                            <button onClick={() => setShowMapKey(!showMapKey)} className="text-slate-400 hover:text-slate-600 p-1">
                              {showMapKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <button onClick={() => showToast('Key regenerated')} className="shrink-0 flex items-center gap-2 text-xs font-bold border border-amber-500 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-900">Vertex AI Service Key</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-sm text-slate-600 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                            {showVertexKey ? "vert-3847f9a8b2c4e5d6f7a8b9c0d1e2f3a4b5c6" : "vert-••••••••••••••••••••AbC"}
                            <button onClick={() => setShowVertexKey(!showVertexKey)} className="text-slate-400 hover:text-slate-600 p-1">
                              {showVertexKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <button onClick={() => showToast('Key regenerated')} className="shrink-0 flex items-center gap-2 text-xs font-bold border border-amber-500 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2.5 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Never share API keys. Regenerating a key will invalidate the old one immediately.
                    </p>
                  </div>

                  {/* Password & 2FA */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
                      <h3 className="font-bold text-slate-900 text-lg mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <input type="password" placeholder="Current password" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                        <input type="password" placeholder="New password" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                        <input type="password" placeholder="Confirm new password" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                        <button onClick={() => showToast('Password updated successfully')} className="w-full bg-[#1a5c2e] hover:bg-emerald-800 text-white py-2 rounded-xl font-bold transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">Two-Factor Authentication</h3>
                          <Toggle checked={twoFactor} onChange={setTwoFactor} />
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-6">Add an extra layer of security to your account.</p>
                      </div>
                      
                      {twoFactor && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center animate-in fade-in duration-300">
                          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">2FA setup flow coming soon</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}} />
    </div>
  );
}
