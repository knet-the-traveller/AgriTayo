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
  Activity,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Users,
  LogOut,
  Loader2,
  User,
  Sprout,
  ShoppingBag
, Truck, Package
, Inbox} from 'lucide-react';
import { getSession, logout, getRoleColor } from '../../lib/auth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const PRICE_COMPARISON = [
  { crop: "Tomatoes", agriTayo: 38, middleman: 22 },
  { crop: "Kamote",   agriTayo: 22, middleman: 12 },
  { crop: "Pechay",   agriTayo: 30, middleman: 18 },
  { crop: "Ampalaya", agriTayo: 45, middleman: 28 },
  { crop: "Mais",     agriTayo: 15, middleman: 9  },
  { crop: "Sitaw",    agriTayo: 55, middleman: 32 },
  { crop: "Gabi",     agriTayo: 28, middleman: 16 },
  { crop: "Saging",   agriTayo: 18, middleman: 10 },
];

const DEMAND_LEVELS = [
  { crop: "Tomatoes",  demand: 95, category: "Vegetable" },
  { crop: "Saging",    demand: 91, category: "Fruit"     },
  { crop: "Kamote",    demand: 88, category: "Root"      },
  { crop: "Mais",      demand: 80, category: "Grain"     },
  { crop: "Pechay",    demand: 72, category: "Vegetable" },
  { crop: "Ampalaya",  demand: 65, category: "Vegetable" },
  { crop: "Sitaw",     demand: 58, category: "Vegetable" },
  { crop: "Gabi",      demand: 45, category: "Root"      },
];

const WEEKLY_VOLUME = [
  { day: "Mon", kg: 980,  value: 32400 },
  { day: "Tue", kg: 1240, value: 41800 },
  { day: "Wed", kg: 860,  value: 28900 },
  { day: "Thu", kg: 1580, value: 53200 },
  { day: "Fri", kg: 2100, value: 70500 },
  { day: "Sat", kg: 1920, value: 64800 },
  { day: "Sun", kg: 1160, value: 39100 },
];

const COOP_RANKINGS = [
  { rank:1, name:"Nueva Ecija Farmers Coop", province:"Nueva Ecija", kg:3200, revenue:121600 },
  { rank:2, name:"Benguet Highland Coop",    province:"Benguet",     kg:2800, revenue:61600  },
  { rank:3, name:"Isabela Corn Alliance",    province:"Isabela",     kg:2100, revenue:31500  },
  { rank:4, name:"Batangas Organic Growers", province:"Batangas",    kg:1650, revenue:74250  },
  { rank:5, name:"Laguna Lowland Growers",   province:"Laguna",      kg:1090, revenue:32700  },
];

const PROVINCE_SUPPLY = [
  { province: "Nueva Ecija", coops: 2, crops: "Tomatoes, Kamatis, Sitaw", volume: "3,800", price: "₱41", status: "Active" },
  { province: "Benguet", coops: 1, crops: "Kamote, Pechay, Broccoli", volume: "2,900", price: "₱34", status: "Active" },
  { province: "Isabela", coops: 1, crops: "Mais, Saging", volume: "2,100", price: "₱17", status: "Active" },
  { province: "Batangas", coops: 1, crops: "Ampalaya, Gabi, Kangkong", volume: "1,650", price: "₱40", status: "Active" },
  { province: "Laguna", coops: 1, crops: "Pechay, Sitaw, Kangkong", volume: "1,090", price: "₱33", status: "Active" },
  { province: "Cavite", coops: 1, crops: "Sitaw, Kamatis", volume: "710", price: "₱48", status: "Low stock" },
];

import { useCountUp } from '../../hooks/useCountUp';

const AnimatedMetric = ({ valueStr }: { valueStr: any }) => {
  if (valueStr === undefined || valueStr === null) return <span>0</span>;
  const safeValueStr = String(valueStr ?? '');
  const numMatch = safeValueStr.replace(/,/g, '').match(/[\d.]+/);
  const num = numMatch ? parseFloat(numMatch[0]) : 0;
  const animatedValue = useCountUp(num, 1000);
  const isFloat = safeValueStr.includes('.');
  const formattedNum = isFloat ? animatedValue.toFixed(1) : animatedValue.toLocaleString();
  return <>{safeValueStr.replace(/[\d.,]+/, formattedNum)}</>;
};

const SkeletonChart = () => (
  <div className="w-full h-[300px] animate-shimmer rounded-xl bg-slate-100" />
);

export default function AnalyticsPage() {
  const [activeNav, setActiveNav] = useState('Analytics');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sellerPendingOrdersCount, setSellerPendingOrdersCount] = useState(0);

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

      const _allSellerOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const _pendingSellerOrders = _allSellerOrders.filter((o: any) => (o.sellerId === user.id || o.sellerName === user.name) && o.status === 'pending');
      setSellerPendingOrdersCount(_pendingSellerOrders.length);
      
      const orders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const pending = orders.filter((o: any) => o.buyerId === user.id && (o.status === 'pending' || o.status === 'confirmed'));
      setPendingOrdersCount(pending.length);
      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);
      setTimeout(() => setIsDataLoading(false), 400);
    }
  }, []);

    const navItems = [
    { name: 'Dashboard Overview', icon: LayoutDashboard, href: '/' },
    ...(session?.role !== 'driver' ? [{ name: 'Market', icon: Store, href: '/market' }] : []),
    ...(session?.role === 'seller' ? [{ name: 'Post Harvest', icon: Sprout, href: '/post-harvest' }] : []),
    ...(session?.role === 'seller' ? [{ name: 'Orders', icon: Inbox, href: '/seller-orders' }] : []),
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

  const handleNavClick = (item: any) => {
    setActiveNav(item.name);
    if (item.href && item.href !== '#') {
      window.location.href = item.href;
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
      
      {/* Sidebar - Copied exactly to match existing layout without refactoring files */}
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
                {session.role?.toLowerCase() === 'seller' ? 'Farmer' : session.role}
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
                                                            {item.name === 'Orders' && sellerPendingOrdersCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {sellerPendingOrdersCount}
                      </span>
                    )}
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
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Data & Analytics</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all duration-300"
                placeholder="Search metrics, reports..."
              />
            </div>
            <NotificationBell role={session?.role} />
            <div className="h-8 w-px bg-slate-200" />
            {session && (
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="h-9 w-9 bg-[#1a5c2e] rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                  {session.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{session.name}</span>
                  <span className="text-[11px] font-medium text-slate-500 capitalize">{session.role?.toLowerCase() === 'seller' ? 'Farmer' : session.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </header>

        <main className="animate-fadeIn flex-1 overflow-y-auto custom-scrollbar p-8 z-0">
          <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
            
            {/* Section 1: Summary KPI bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                { title: 'Total Transactions', value: '₱284,500', sub: '+18% vs last month', subColor: 'text-emerald-600', icon: <Activity className="w-5 h-5 text-emerald-600" /> },
                { title: 'Harvest Sold (kg)', value: '12,840 kg', sub: 'of 14,250 kg listed', subColor: 'text-slate-500', icon: <Leaf className="w-5 h-5 text-emerald-600" /> },
                { title: 'Waste Prevented', value: '1,410 kg', sub: 'worth ₱42,300 saved', subColor: 'text-emerald-600', icon: <TrendingUp className="w-5 h-5 text-emerald-600" /> },
                { title: 'Active Cooperatives', value: '7', sub: 'across 5 provinces', subColor: 'text-slate-500', icon: <Users className="w-5 h-5 text-emerald-600" /> },
                { title: 'Avg. Price vs Middleman', value: '+24%', sub: 'farmers earning more', subColor: 'text-emerald-600', icon: <BarChart3 className="w-5 h-5 text-emerald-600" /> },
                { title: 'Orders Fulfilled', value: '94.2%', sub: 'on-time delivery rate', subColor: 'text-emerald-600', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
              ].map((stat, i) => (
                <div key={i} style={{ animationDelay: `${i * 80}ms` }} className="animate-fadeIn group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200/60 transition-all duration-300 flex flex-col justify-between cursor-default hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-semibold text-slate-500 tracking-wide">{stat.title}</span>
                    <div className="bg-emerald-50/80 p-2.5 rounded-xl group-hover:bg-emerald-100/80 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-950 transition-colors"><AnimatedMetric valueStr={stat.value} /></div>
                    <div className={`text-xs font-bold mt-2 ${stat.subColor}`}>{stat.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2: Price Fairness Chart & Heatmap */}
            <div className="flex flex-col xl:flex-row gap-6">
              
              {/* Price Fairness Chart */}
              <div className="flex-[6] bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">Farm gate price vs. middleman price per crop</h3>
                <div className="flex-1 h-[300px]">
                  {isDataLoading ? <SkeletonChart /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PRICE_COMPARISON} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="crop" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₱${value}`} />
                      <RechartsTooltip 
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const agri = payload[0].value as number;
                            const mid = payload[1].value as number;
                            const diff = Math.round(((agri - mid) / mid) * 100);
                            return (
                              <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
                                <p className="font-bold mb-2">{label}</p>
                                <p className="text-emerald-700 font-medium">AgriTayo: ₱{agri}</p>
                                <p className="text-orange-500 font-medium mb-2">Middleman: ₱{mid}</p>
                                <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold inline-block">+{diff}% more</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Bar dataKey="agriTayo" name="AgriTayo (₱/kg)" fill="#1a5c2e" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="middleman" name="Middleman (₱/kg)" fill="#f97316" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Crop Demand Heatmap */}
              <div className="flex-[4] bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">Demand level by crop category</h3>
                <div className="flex-1 grid grid-cols-2 gap-3 min-h-[300px]">
                  {DEMAND_LEVELS.map((item, i) => {
                    const bgClass = item.demand > 90 ? 'bg-[#1a5c2e] text-white' : 
                                    item.demand > 75 ? 'bg-emerald-600 text-white' : 
                                    item.demand > 60 ? 'bg-emerald-500 text-white' : 
                                    'bg-emerald-200 text-emerald-900';
                    return (
                      <div key={i} className={`${bgClass} rounded-xl p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-default shadow-sm hover:shadow-md`}>
                        <div className="flex justify-between items-start">
                          <span className="font-bold">{item.crop}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 border border-current rounded-full px-2 py-0.5">{item.category}</span>
                        </div>
                        <div>
                          <p className="text-3xl font-black">{item.demand}</p>
                          <p className="text-xs font-medium opacity-90">Demand Score</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Weekly Transaction Volume */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">Harvest sold per day — last 7 days</h3>
              <div className="h-[300px]">
                {isDataLoading ? <SkeletonChart /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WEEKLY_VOLUME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a5c2e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1a5c2e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₱${val/1000}k`} />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-sm">
                              <p className="font-bold mb-2">{label}</p>
                              <p className="text-[#1a5c2e] font-bold">Volume: {(payload[0].value as number).toLocaleString()} kg</p>
                              <p className="text-slate-600 font-medium mt-1">Value: ₱{(payload[1]?.value as number)?.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="kg" name="Volume Sold (kg)" stroke="#1a5c2e" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" />
                    <Area yAxisId="right" type="monotone" dataKey="value" name="Total Value (₱)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} fill="none" />
                  </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-center text-sm font-semibold text-slate-500 mt-4 bg-slate-50 py-2 rounded-lg inline-block px-4 mx-auto w-max">
                Peak day: Friday &middot; 2,100 kg &middot; ₱70,500
              </p>
            </div>

            {/* Section 4: Coop Leaderboard & Waste Tracker */}
            <div className="flex flex-col xl:flex-row gap-6">
              
              {/* Leaderboard */}
              <div className="flex-[55%] bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">Top cooperatives by volume sold</h3>
                <div className="space-y-4">
                  {COOP_RANKINGS.map((coop) => (
                    <div key={coop.rank} className="flex items-center gap-4 group hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0 group-hover:bg-[#1a5c2e] group-hover:text-white transition-colors">
                        {coop.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{coop.name}</h4>
                          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">₱{coop.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium w-20 truncate">{coop.province}</span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1a5c2e] rounded-full" style={{ width: `${(coop.kg / 3200) * 100}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[#1a5c2e] w-12 text-right">{coop.kg.toLocaleString()}kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waste Tracker Ring */}
              <div className="flex-[45%] bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col items-center">
                <h3 className="font-bold text-slate-900 mb-6 text-lg w-full text-left">Post-harvest waste prevented</h3>
                
                {/* SVG Circular Progress Ring */}
                <div className="relative w-48 h-48 mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1a5c2e" strokeWidth="12" strokeDasharray={`${251.2 * 0.901} 251.2`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">1,410 kg</span>
                    <span className="text-[10px] font-bold uppercase text-[#1a5c2e] tracking-wider mt-0.5">Saved</span>
                  </div>
                </div>

                <div className="space-y-1 mb-6 text-center">
                  <p className="text-sm font-semibold text-slate-500">out of 14,250 kg total listed</p>
                  <p className="text-lg font-bold text-[#1a5c2e]">90.1% sold before expiry</p>
                </div>

                <div className="w-full space-y-2 text-sm font-medium">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#1a5c2e]"></div> Produce sold on time</span>
                    <span className="font-bold text-slate-900">12,840 kg</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Sold near expiry (urgent)</span>
                    <span className="font-bold text-slate-900">1,650 kg</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Unsold / wasted</span>
                    <span className="font-bold text-slate-900">410 kg</span>
                  </div>
                </div>
                
                <p className="mt-5 text-xs font-bold text-[#1a5c2e] bg-emerald-50 px-4 py-2.5 rounded-full w-full text-center">
                  ₱42,300 worth of food waste prevented this month
                </p>
              </div>

            </div>

            {/* Section 5: Province Supply Map Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg">Supply coverage by province</h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-bold">Province</th>
                      <th className="px-6 py-4 font-bold">Active Coops</th>
                      <th className="px-6 py-4 font-bold">Crops Listed</th>
                      <th className="px-6 py-4 font-bold">Volume (kg)</th>
                      <th className="px-6 py-4 font-bold">Avg Price/kg</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PROVINCE_SUPPLY.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{row.province}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{row.coops}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{row.crops}</td>
                        <td className="px-6 py-4 font-bold text-[#1a5c2e]">{row.volume}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{row.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            row.status === 'Low stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}} />
    </div>
  );
}
