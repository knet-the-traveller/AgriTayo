"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SkeletonCard } from '@/components/Skeleton';
import { useCountUp } from '@/hooks/useCountUp';
import NotificationBell from '../../components/NotificationBell';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Map as MapIcon, BarChart3, User, 
  Menu, ChevronDown, Bell, LogOut, Loader2, Truck, Leaf, 
  ChevronRight, Package, MapPin, Clock, CheckCircle2, ChevronUp
, ShoppingBag, Sprout
, Store, Settings
, Inbox} from 'lucide-react';
import { getSession, logout, getRoleColor } from '@/lib/auth';

const MOCK_DELIVERY_JOBS = [
  {
    id: "ORD-MOCK-001",
    crop: "Tomatoes",
    emoji: "🍅",
    sellerName: "Mang Ramon Dela Cruz",
    cooperative: "Nueva Ecija Farmers Coop",
    pickupLocation: "Cabanatuan City, Nueva Ecija",
    pickupCoords: { lat: 15.4867, lng: 120.9664 },
    deliveryLocation: "Divisoria Market, Manila",
    deliveryCoords: { lat: 14.5990, lng: 120.9672 },
    quantity: 300,
    pricePerKg: 38,
    total: 11400,
    estimatedDistance: "142 km",
    estimatedDuration: "3 hrs 20 mins",
    driverPayout: 450,
    paymentMethod: "Cash on Delivery",
    harvestDate: "Jun 30, 2026",
    status: "pending",
    driverId: null,
    placedAt: new Date().toISOString(),
  },
  {
    id: "ORD-MOCK-002",
    crop: "Kamote",
    emoji: "🍠",
    sellerName: "Aling Marta Reyes",
    cooperative: "Benguet Highland Coop",
    pickupLocation: "La Trinidad, Benguet",
    pickupCoords: { lat: 16.4623, lng: 120.5874 },
    deliveryLocation: "Balintawak Market, QC",
    deliveryCoords: { lat: 14.6570, lng: 121.0180 },
    quantity: 500,
    pricePerKg: 22,
    total: 11000,
    estimatedDistance: "256 km",
    estimatedDuration: "5 hrs 45 mins",
    driverPayout: 380,
    paymentMethod: "Online Payment",
    harvestDate: "Jun 28, 2026",
    status: "pending",
    driverId: null,
    placedAt: new Date().toISOString(),
  },
  {
    id: "ORD-MOCK-003",
    crop: "Pechay",
    emoji: "🥬",
    sellerName: "Ka Jose Santos",
    cooperative: "Laguna Lowland Growers",
    pickupLocation: "Los Baños, Laguna",
    pickupCoords: { lat: 14.1667, lng: 121.2333 },
    deliveryLocation: "Guadalupe Market, Makati",
    deliveryCoords: { lat: 14.5547, lng: 121.0244 },
    quantity: 150,
    pricePerKg: 30,
    total: 4500,
    estimatedDistance: "67 km",
    estimatedDuration: "1 hr 40 mins",
    driverPayout: 280,
    paymentMethod: "Cash on Delivery",
    harvestDate: "Jun 29, 2026",
    status: "pending",
    driverId: null,
    placedAt: new Date().toISOString(),
  },
  {
    id: "ORD-MOCK-004",
    crop: "Mais",
    emoji: "🌽",
    sellerName: "Mang Pedro Ramos",
    cooperative: "Isabela Corn Alliance",
    pickupLocation: "Cauayan, Isabela",
    pickupCoords: { lat: 16.9333, lng: 121.7667 },
    deliveryLocation: "Farmers Market, Cubao",
    deliveryCoords: { lat: 14.6196, lng: 121.0571 },
    quantity: 800,
    pricePerKg: 15,
    total: 12000,
    estimatedDistance: "318 km",
    estimatedDuration: "6 hrs 10 mins",
    driverPayout: 520,
    paymentMethod: "Cash on Delivery",
    harvestDate: "Jul 1, 2026",
    status: "pending",
    driverId: null,
    placedAt: new Date().toISOString(),
  },
  {
    id: "ORD-MOCK-005",
    crop: "Ampalaya",
    emoji: "🥒",
    sellerName: "Ka Maria Flores",
    cooperative: "Batangas Organic Growers",
    pickupLocation: "Lipa City, Batangas",
    pickupCoords: { lat: 13.9411, lng: 121.1631 },
    deliveryLocation: "Pasay Mega Market",
    deliveryCoords: { lat: 14.5378, lng: 120.9933 },
    quantity: 200,
    pricePerKg: 45,
    total: 9000,
    estimatedDistance: "89 km",
    estimatedDuration: "2 hrs 15 mins",
    driverPayout: 320,
    paymentMethod: "Card Payment",
    harvestDate: "Jun 30, 2026",
    status: "pending",
    driverId: null,
    placedAt: new Date().toISOString(),
  },
];

export default function AvailableDeliveriesPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('Available Deliveries');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sellerPendingOrdersCount, setSellerPendingOrdersCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [toastMessage, setToastMessage] = useState('');
  
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'driver') {
      window.location.href = '/login';
    } else {
      setSession(user);
      setIsAuthLoading(false);

      const _allSellerOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const _pendingSellerOrders = _allSellerOrders.filter((o: any) => (o.sellerId === user.id || o.sellerName === user.name) && o.status === 'pending');
      setSellerPendingOrdersCount(_pendingSellerOrders.length);
      
      loadOrders(user.id);
    }
  }, []);

  const loadOrders = (driverId: string) => {
    const storedOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    
    // Active deliveries for badge
    const active = storedOrders.filter((o: any) => o.driverId === driverId && o.status !== 'delivered' && o.status !== 'cancelled');
    setActiveDeliveriesCount(active.length);
    
    // Available deliveries (pending, no driver)
    const realAvailable = storedOrders.filter((o: any) => o.status === 'pending' && !o.driverId);
    
    // Add real orders to mock orders, ensuring unique IDs
    const mockIds = MOCK_DELIVERY_JOBS.map(m => m.id);
    const existingMocksInStorage = storedOrders.filter((o: any) => mockIds.includes(o.id));
    
    // Only show mocks that haven't been accepted yet
    const availableMocks = MOCK_DELIVERY_JOBS.filter(m => !existingMocksInStorage.find((sm: any) => sm.id === m.id));
    
    // Calculate mock payouts for real orders
    const mappedRealAvailable = realAvailable.map((o: any) => ({
      ...o,
      pickupLocation: o.location || "Farm location",
      deliveryLocation: o.deliveryAddress?.fullAddress ? `${o.deliveryAddress.city}` : "Market address",
      estimatedDistance: o.estimatedDistance || "45 km",
      estimatedDuration: o.estimatedDuration || "1 hr 15 mins",
      driverPayout: o.driverPayout || Math.floor(Math.random() * 200 + 150),
    }));

    setAvailableOrders([...mappedRealAvailable, ...availableMocks]);
  };

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAcceptDelivery = (job: any) => {
    const storedOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    
    const existingIndex = storedOrders.findIndex((o: any) => o.id === job.id);
    
    const updatedJob = {
      ...job,
      driverId: session.id,
      driverName: session.name,
      driverPhone: session.phone || "",
      truckPlate: session.truckPlate || "",
      status: "confirmed",
      acceptedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      storedOrders[existingIndex] = updatedJob;
    } else {
      storedOrders.push(updatedJob);
    }
    
    localStorage.setItem('agritayo_orders', JSON.stringify(storedOrders));
    
    setConfirmingOrderId(null);
    setExpandedOrderId(null);
    
    // Re-load
    loadOrders(session.id);
    
    showToast(`Delivery accepted! ${job.emoji} ${job.crop} — ${job.pickupLocation} → ${job.deliveryLocation}`);
    
    setTimeout(() => {
      router.push('/my-deliveries');
    }, 2000);
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#1a5c2e] animate-spin mb-4" />
        <div className="text-[#1a5c2e] font-bold text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
  };

  const getUrgency = (dateStr: string) => {
    const today = new Date('2026-06-29'); // Mock current date
    const harvestDate = new Date(dateStr);
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) return { text: 'Urgent', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (diffDays <= 5) return { text: 'Soon', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'Fresh', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const filteredOrders = availableOrders.filter(job => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Nearby') {
      const dist = parseInt(job.estimatedDistance) || 0;
      return dist <= 100;
    }
    if (activeFilter === 'High Payout') {
      return job.driverPayout >= 400;
    }
    if (activeFilter === 'Urgent') {
      const urgency = getUrgency(job.harvestDate);
      return urgency.text === 'Urgent';
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.placedAt || 0).getTime() - new Date(b.placedAt || 0).getTime();
    }
    if (sortBy === 'highest_payout') {
      return b.driverPayout - a.driverPayout;
    }
    if (sortBy === 'nearest') {
      const distA = parseInt(a.estimatedDistance) || 0;
      const distB = parseInt(b.estimatedDistance) || 0;
      return distA - distB;
    }
    return 0;
  });

  return (
    <div className="flex h-screen w-full bg-slate-50/50 text-slate-900 font-sans overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Sidebar Layout */}
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
                {getInitials(session.name)}
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
                onClick={() => {
                  setActiveNav(item.name);
                  if (item.href) window.location.href = item.href;
                }}
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
                    {item.name === 'Available Deliveries' && availableOrders.length > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {availableOrders.length}
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
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Available Deliveries</h2>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell role={session?.role} />
            <div className="h-8 w-px bg-slate-200" />
            {session && (
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="h-9 w-9 bg-[#1a5c2e] rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
                  {getInitials(session.name)}
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

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative z-0 scroll-smooth">
          
          <div className="max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Deliveries</h1>
                <p className="text-slate-500 mt-2 font-medium">Pick up a delivery job near you</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-w-[130px]">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Available Jobs</p>
                  <p className="text-2xl font-black text-slate-800">{availableOrders.length}</p>
                </div>
                <div className="bg-[#1a5c2e] rounded-xl border border-emerald-800 shadow-sm shadow-emerald-900/10 p-4 min-w-[130px] text-white">
                  <p className="text-xs uppercase font-bold text-emerald-300 mb-1">Avg. Payout</p>
                  <p className="text-2xl font-black">₱350</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-w-[130px] hidden sm:block">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Nearest Pickup</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">12 km away</p>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-8">
                {['All', 'Nearby', 'High Payout', 'Urgent'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${
                      activeFilter === tab ? 'text-[#1a5c2e]' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                    {activeFilter === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a5c2e] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pb-4 hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium relative">
                Sort by: 
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold cursor-pointer outline-none appearance-none pr-6 z-10"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest_payout">Highest Payout</option>
                  <option value="nearest">Nearest</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 -mt-2 pointer-events-none text-slate-800" />
              </div>
            </div>

            {/* Delivery Jobs List */}
            <div className="space-y-6 pb-20">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm p-12 flex flex-col items-center text-center">
                  <Truck className="w-12 h-12 text-slate-300 mb-4" />
                  <h2 className="text-2xl font-black text-slate-900 mb-2">No deliveries found</h2>
                  <p className="text-slate-500 font-medium">Try changing your filters to see more available jobs.</p>
                </div>
              ) : (
                filteredOrders.map((job) => {
                  const urgency = getUrgency(job.harvestDate);
                  const isExpanded = expandedOrderId === job.id;
                  const isConfirming = confirmingOrderId === job.id;

                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      
                      {/* Top Row */}
                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{job.emoji}</span>
                          <h3 className="font-bold text-lg text-slate-900">{job.crop}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${urgency.color}`}>
                            {urgency.text}
                          </div>
                          <div className="px-3 py-1 bg-[#1a5c2e] rounded-full text-white text-xs font-bold shadow-sm">
                            ₱{job.driverPayout}
                          </div>
                        </div>
                      </div>

                      {/* Route Row */}
                      <div className="p-6 pb-4 border-b border-slate-50 border-dashed">
                        <div className="flex items-center justify-between w-full relative mb-4">
                          {/* Route Line */}
                          <div className="absolute top-1/2 left-8 right-8 h-0.5 border-t-2 border-dashed border-slate-200 -z-10" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-slate-300 -z-10">
                            <ChevronRight className="w-4 h-4" />
                          </div>

                          <div className="flex flex-col max-w-[45%] bg-white pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup</span>
                            </div>
                            <span className="font-bold text-slate-800 text-sm">{job.pickupLocation}</span>
                          </div>

                          <div className="flex flex-col items-end text-right max-w-[45%] bg-white pl-4">
                            <div className="flex items-center gap-2 mb-1 justify-end">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deliver to</span>
                              <Truck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm">{job.deliveryLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-500 bg-slate-50 py-2 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <MapIcon className="w-4 h-4 text-slate-400" /> {job.estimatedDistance}
                          </div>
                          <div className="w-1 h-1 bg-slate-300 rounded-full" />
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" /> {job.estimatedDuration}
                          </div>
                        </div>
                      </div>

                      {/* Cargo Info Row */}
                      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 mb-0.5">Crop</p>
                          <p className="font-bold text-slate-800">{job.emoji} {job.crop}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Quantity</p>
                          <p className="font-bold text-slate-800">{job.quantity} kg</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Order Value</p>
                          <p className="font-bold text-slate-800">₱{job.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Payment</p>
                          <p className="font-bold text-slate-800">{job.paymentMethod}</p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 text-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="font-bold text-slate-800 mb-2">Farmer Information</p>
                              <p className="text-slate-600"><span className="font-medium text-slate-500">Farmer:</span> {job.sellerName}</p>
                              {job.cooperative && <p className="text-slate-600"><span className="font-medium text-slate-500">Cooperative:</span> {job.cooperative}</p>}
                              <p className="text-slate-600"><span className="font-medium text-slate-500">Harvest Date:</span> {job.harvestDate}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 mb-2">Full Delivery Address</p>
                              <p className="text-slate-600">{job.deliveryAddress?.fullAddress || job.deliveryLocation}</p>
                              {job.buyerNote && (
                                <p className="mt-2 text-slate-600 italic"><span className="font-medium not-italic text-slate-500">Note:</span> {job.buyerNote}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="font-bold text-slate-600">📍 {job.pickupLocation.split(',')[0]} &rarr; 🏪 {job.deliveryLocation.split(',')[0]}</span>
                            <a href="#" className="text-emerald-600 font-bold text-xs hover:underline">Open in Google Maps &rarr;</a>
                          </div>
                        </div>
                      )}

                      {/* Inline Confirmation */}
                      {isConfirming && (
                        <div className="px-6 py-5 bg-emerald-50 border-t border-emerald-100 animate-in zoom-in-95 duration-200">
                          <h4 className="font-black text-emerald-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Accept this delivery job?
                          </h4>
                          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Cargo</p>
                                <p className="font-bold text-slate-800">{job.quantity}kg {job.crop}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Your Payout</p>
                                <p className="font-bold text-emerald-700 text-lg leading-tight">₱{job.driverPayout}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleAcceptDelivery(job)}
                              className="flex-1 bg-[#1a5c2e] hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
                            >
                              Confirm Accept
                            </button>
                            <button 
                              onClick={() => setConfirmingOrderId(null)}
                              className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition-all"
                            >
                              Go Back
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Row */}
                      {!isConfirming && (
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                          <button 
                            onClick={() => setExpandedOrderId(isExpanded ? null : job.id)}
                            className="flex-1 py-2.5 rounded-xl font-bold text-[#1a5c2e] border-2 border-[#1a5c2e] hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                          >
                            View Details {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => {
                              setExpandedOrderId(null);
                              setConfirmingOrderId(job.id);
                            }}
                            className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#1a5c2e] hover:bg-emerald-800 shadow-sm transition-colors"
                          >
                            Accept Delivery
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
