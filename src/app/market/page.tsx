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
  MapPin,
  User,
  Leaf,
  X,
  LogOut,
  Loader2,
  Sprout,
  ShoppingBag,
  Truck,
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle2
, Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSession, logout, getRoleColor } from '../../lib/auth';

const LISTINGS = [
  { id:1, crop:"Tomatoes", emoji:"🍅", category:"Vegetable", farmer:"Mang Ramon Dela Cruz", coop:"Nueva Ecija Farmers Coop", location:"Cabanatuan City", volume:600, price:38, harvestDate:"Jun 28, 2026", daysLeft:2 },
  { id:2, crop:"Kamote", emoji:"🍠", category:"Root", farmer:"Aling Marta Reyes", coop:"Benguet Highland Coop", location:"La Trinidad, Benguet", volume:1200, price:22, harvestDate:"Jun 25, 2026", daysLeft:5 },
  { id:3, crop:"Pechay", emoji:"🥬", category:"Vegetable", farmer:"Ka Jose Santos", coop:"Laguna Lowland Growers", location:"Los Baños, Laguna", volume:300, price:30, harvestDate:"Jun 29, 2026", daysLeft:1 },
  { id:4, crop:"Saging", emoji:"🍌", category:"Fruit", farmer:"Aling Nena Bautista", coop:"Davao Fruit Collective", location:"Tagum, Davao del Norte", volume:2000, price:18, harvestDate:"Jul 3, 2026", daysLeft:7 },
  { id:5, crop:"Mais", emoji:"🌽", category:"Grain", farmer:"Mang Pedro Ramos", coop:"Isabela Corn Alliance", location:"Cauayan, Isabela", volume:1500, price:15, harvestDate:"Jul 1, 2026", daysLeft:5 },
  { id:6, crop:"Ampalaya", emoji:"🥒", category:"Vegetable", farmer:"Ka Maria Flores", coop:"Batangas Organic Growers", location:"Lipa City, Batangas", volume:250, price:45, harvestDate:"Jun 30, 2026", daysLeft:3 },
  { id:7, crop:"Gabi", emoji:"🌿", category:"Root", farmer:"Mang Ernesto Cruz", coop:"Quezon Root Crop Assoc.", location:"Lucena City, Quezon", volume:800, price:28, harvestDate:"Jul 5, 2026", daysLeft:9 },
  { id:8, crop:"Sitaw", emoji:"🫘", category:"Vegetable", farmer:"Aling Gloria Mendoza", coop:"Cavite Valley Growers", location:"Tagaytay, Cavite", volume:180, price:55, harvestDate:"Jun 28, 2026", daysLeft:1 },
];

export default function MarketPage() {
  const [activeNav, setActiveNav] = useState('Market');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setActiveFilter('All');
    setFilterLocation('All Locations');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterPriceMin('');
    setFilterPriceMax('');
    setSearchQuery('');
  };
  
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [orderQty, setOrderQty] = useState<number>(1);
  const [buyerNote, setBuyerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [toastMessage, setToastMessage] = useState('');
  
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const router = useRouter();

  const [allListings, setAllListings] = useState<any[]>(LISTINGS);

  useEffect(() => {
    const user = getSession();
    if (!user) {
      window.location.href = '/login';
    } else {
      setSession(user);
      setIsAuthLoading(false);
      
      const storedListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
      setAllListings([...LISTINGS, ...storedListings]);
      
      const orders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const pending = orders.filter((o: any) => o.buyerId === user.id && (o.status === 'pending' || o.status === 'confirmed'));
      setPendingOrdersCount(pending.length);
      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);
    }
  }, []);

  useEffect(() => {
    if (selectedListing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedListing]);

  const filters = ['All', 'Vegetables', 'Root Crops', 'Fruits', 'Grains'];

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

  const handleNavClick = (item: any) => {
    setActiveNav(item.name);
    if (item.href && item.href !== '#') {
      window.location.href = item.href;
    }
  };

  const handleOrderClick = (listing: any) => {
    setSelectedListing(listing);
    setOrderQty(listing.minimumOrder || 1);
    setBuyerNote('');
    setPaymentMethod('cash-on-delivery');
  };

  const handleConfirmOrder = () => {
    const minOrder = selectedListing.minimumOrder || 1;
    if (orderQty < minOrder || orderQty > selectedListing.volume) return;

    const paymentLabel = 
      paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 
      paymentMethod === 'online-payment' ? 'Online Payment' : 'Card Payment';

    const newOrder = {
      id: "ORD-" + Date.now(),
      buyerId: session.id,
      buyerName: session.name,
      sellerId: selectedListing.sellerId || "mock",
      sellerName: selectedListing.farmer || selectedListing.sellerName || "Independent Farmer",
      cooperative: selectedListing.coop || selectedListing.cooperative || "",
      crop: selectedListing.crop,
      emoji: selectedListing.emoji,
      category: selectedListing.category || "",
      quantity: orderQty,
      pricePerKg: selectedListing.price,
      total: orderQty * selectedListing.price,
      location: selectedListing.location,
      pickupMethod: selectedListing.pickupMethod || "farm-pickup",
      buyerNote: buyerNote,
      paymentMethod: paymentMethod,
      paymentLabel: paymentLabel,
      deliveryAddress: session.deliveryAddress || null,
      harvestDate: selectedListing.harvestDate || selectedListing.harvest,
      status: "pending",
      placedAt: new Date().toISOString(),
    };

    const storedOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    storedOrders.push(newOrder);
    localStorage.setItem('agritayo_orders', JSON.stringify(storedOrders));

    setToastMessage(`Order placed! ${selectedListing.emoji} ${selectedListing.crop} — ${orderQty}kg · ${paymentLabel}`);
    setSelectedListing(null);
    
    setTimeout(() => {
      setToastMessage('');
      router.push('/my-orders');
    }, 1500);
  };

  const filteredListings = allListings.filter(item => {
    // Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = item.crop?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query);
      const matchFarmer = item.farmer?.toLowerCase().includes(query) || item.sellerName?.toLowerCase().includes(query);
      const matchCoop = item.coop?.toLowerCase().includes(query) || item.cooperative?.toLowerCase().includes(query);
      if (!matchName && !matchFarmer && !matchCoop) return false;
    }

    // Category
    if (activeFilter !== 'All') {
      if (activeFilter === 'Vegetables' && item.category !== 'Vegetable') return false;
      if (activeFilter === 'Root Crops' && item.category !== 'Root') return false;
      if (activeFilter === 'Fruits' && item.category !== 'Fruit') return false;
      if (activeFilter === 'Grains' && item.category !== 'Grain') return false;
    }

    // Location
    if (filterLocation !== 'All Locations' && item.location !== filterLocation) return false;

    // Date
    if (filterDateFrom || filterDateTo) {
      const itemDate = new Date(item.harvestDate || item.harvest);
      if (filterDateFrom && itemDate < new Date(filterDateFrom)) return false;
      if (filterDateTo && itemDate > new Date(filterDateTo)) return false;
    }

    // Price
    if (filterPriceMin && item.price < parseFloat(filterPriceMin)) return false;
    if (filterPriceMax && item.price > parseFloat(filterPriceMax)) return false;

    return true;
  });

  const uniqueLocations = ['All Locations', ...Array.from(new Set(allListings.map(l => l.location).filter(Boolean)))];

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
      
      {/* Sidebar - Copied exactly to match without refactoring existing layout */}
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
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Market Place</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all duration-300"
                placeholder="Search crops, farmers..."
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
                  <span className="text-[11px] font-medium text-slate-500 capitalize">{session.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 z-0">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* AI Match Banner */}
            <div className="bg-[#1a5c2e] rounded-2xl p-6 shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-white">
                <div className="bg-white/20 p-3 rounded-full">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">AI Match Alert</h3>
                  <p className="text-emerald-100/90 text-sm font-medium">Root crops are in high demand near your area.</p>
                </div>
              </div>
              <button className="whitespace-nowrap bg-[#c9a227] hover:bg-[#b08e22] text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md active:scale-95">
                View Matches
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === filter
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4 mb-2">
              {/* Search Bar */}
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search crops, farmers, cooperatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-slate-50 hover:bg-white transition-all shadow-inner"
                />
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-wrap gap-4 items-end">
              {/* Location */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <select 
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none bg-slate-50 hover:bg-white transition-colors"
                  >
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Harvest Date */}
              <div className="flex-1 min-w-[280px]">
                <label className="block text-xs font-bold text-slate-600 mb-1">Harvest Date</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors text-slate-600"
                  />
                  <span className="text-slate-400 font-bold text-sm">to</span>
                  <input 
                    type="date" 
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors text-slate-600"
                  />
                </div>
              </div>

              {/* Price / kg */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-600 mb-1">Price per kg (₱)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={filterPriceMin}
                    onChange={(e) => setFilterPriceMin(e.target.value)}
                    className="flex-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors"
                  />
                  <span className="text-slate-400 font-bold text-sm">-</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={filterPriceMax}
                    onChange={(e) => setFilterPriceMax(e.target.value)}
                    className="flex-1 w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button 
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors h-[38px] border border-transparent hover:border-rose-200"
              >
                Clear Filters
              </button>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
                  
                  {/* Top Row: Name + Badge */}
                  <div className="px-6 pt-6 flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">{item.crop}</h3>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      item.daysLeft <= 2 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      item.daysLeft <= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.daysLeft <= 2 ? 'Urgent' : item.daysLeft <= 5 ? 'Soon' : 'Fresh'}
                    </div>
                  </div>

                  {/* Emoji Center */}
                  <div className="py-8 flex justify-center items-center">
                    <span className="text-7xl drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                  </div>

                  {/* Details */}
                  <div className="px-6 pb-6 flex-1 flex flex-col gap-3">
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <User className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {item.farmer || item.sellerName || item.coop || "Independent Farmer"} 
                        {item.coop && <span className="text-slate-400 font-normal"> ({item.coop})</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-3 mt-2 grid grid-cols-2 gap-2 border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Volume</p>
                        <p className="font-semibold text-slate-800">{item.volume} kg</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Harvest Date</p>
                        <p className="font-semibold text-slate-800">{item.harvestDate}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Price / kg</p>
                        <p className="text-xl font-black text-emerald-700">₱{item.price}</p>
                      </div>
                      <button 
                        onClick={() => handleOrderClick(item)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        Order Now
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      {/* Order Modal Overlay */}
      {selectedListing && (
        <div 
          onClick={() => setSelectedListing(null)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[16px] w-full max-w-[520px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-200 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[18px] font-bold text-slate-900">Place Order</h2>
                <button 
                  onClick={() => setSelectedListing(null)}
                  className="p-1.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                <span className="text-3xl bg-white p-2 rounded-lg border border-emerald-50 shadow-sm shrink-0">{selectedListing.emoji}</span>
                <div className="flex flex-col justify-center w-full">
                  <div className="flex justify-between items-start w-full">
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{selectedListing.crop}</h3>
                    <p className="text-emerald-700 font-bold text-base leading-tight">₱{selectedListing.price}<span className="text-xs text-slate-500 font-medium">/kg</span></p>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Seller: {selectedListing.farmer || selectedListing.sellerName || "Independent Farmer"}</p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
              {(selectedListing.minimumOrder && selectedListing.minimumOrder > 0) ? (
                <div className="bg-[#fdf6e3] text-[#8a6e00] text-[13px] font-bold px-[14px] py-[10px] rounded-lg border-l-[3px] border-[#c9a227]">
                  Minimum order: {selectedListing.minimumOrder} kg
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">How many kg do you want to order?</label>
                <input 
                  type="number" 
                  min={selectedListing.minimumOrder || 1} 
                  max={selectedListing.volume}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs font-medium text-slate-500">
                    Max available: {selectedListing.volume} kg
                  </p>
                  {orderQty < (selectedListing.minimumOrder || 1) && (
                    <p className="text-xs font-bold text-rose-500">Min order is {selectedListing.minimumOrder || 1} kg</p>
                  )}
                  {orderQty > selectedListing.volume && (
                    <p className="text-xs font-bold text-rose-500">Exceeds available stock</p>
                  )}
                </div>
              </div>

              <div className="bg-[#f0faf4] border border-[#c6e9d4] rounded-lg px-[16px] py-[12px] text-center">
                <p className="text-[13px] font-medium text-emerald-700 mb-0.5">{orderQty} kg × ₱{selectedListing.price}/kg</p>
                <p className="text-[24px] font-bold text-[#1a5c2e] leading-none">= ₱{(orderQty * selectedListing.price).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[13px] font-bold text-slate-700">
                {(selectedListing.pickupMethod === 'Delivery available' || selectedListing.pickupMethod === 'Both available') ? (
                  <Truck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <MapPin className="w-4 h-4 text-emerald-600" />
                )}
                Pickup: {selectedListing.pickupMethod || "Farm pickup"}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Add a note to the seller (optional)</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Can we arrange pickup on Saturday morning?"
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Delivery Address Preview */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address</label>
                {session?.deliveryAddress?.fullAddress ? (
                  <div className="bg-[#f5f5f3] p-[10px] px-[14px] rounded-lg border border-[#e5e5e3] flex justify-between items-center">
                    <p className="text-[13px] font-medium text-slate-700 truncate mr-2">
                      📍 {session.deliveryAddress.fullAddress}, {session.deliveryAddress.city} {session.deliveryAddress.zipCode}
                    </p>
                    <a href="/profile" className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap shrink-0">Change address</a>
                  </div>
                ) : (
                  <div className="bg-[#f5f5f3] p-[10px] px-[14px] rounded-lg border border-[#e5e5e3] flex justify-between items-center">
                    <p className="text-[13px] font-bold text-slate-600">📍 No delivery address saved.</p>
                    <a href="/profile" className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap shrink-0">Add address &rarr;</a>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'cash-on-delivery', icon: Banknote, title: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                    { id: 'online-payment', icon: Smartphone, title: 'Online Payment', sub: 'GCash, Maya, or bank transfer' },
                    { id: 'card-payment', icon: CreditCard, title: 'Card Payment', sub: 'Visa, Mastercard, or any debit card' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center px-[16px] py-[12px] rounded-[10px] border text-left transition-all duration-200 ${
                        paymentMethod === method.id 
                          ? 'border-emerald-600 border-[1.5px] bg-emerald-50/50' 
                          : 'border-slate-200 bg-white border-[1.5px] hover:border-emerald-300'
                      }`}
                    >
                      <method.icon className={`w-5 h-5 shrink-0 mr-3 ${paymentMethod === method.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <p className={`text-[14px] font-medium leading-tight ${paymentMethod === method.id ? 'text-emerald-900' : 'text-slate-700'}`}>{method.title}</p>
                        <p className={`text-[12px] mt-0.5 leading-tight ${paymentMethod === method.id ? 'text-emerald-700/80' : 'text-slate-500'}`}>{method.sub}</p>
                      </div>
                      {paymentMethod === method.id ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-3" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0 ml-3" />
                      )}
                    </button>
                  ))}
                </div>
                
                {paymentMethod === 'online-payment' && (
                  <div className="mt-2 bg-blue-50 text-blue-800 text-[12px] font-medium p-2.5 rounded-lg border border-blue-200">
                    You will receive payment instructions from the seller after your order is confirmed.
                  </div>
                )}
                
                {paymentMethod === 'card-payment' && (
                  <div className="mt-2 bg-slate-50 text-slate-600 text-[12px] font-medium p-2.5 rounded-lg border border-slate-200">
                    Card details will be collected securely at the time of delivery coordination.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pt-4 pb-5 border-t border-slate-200 bg-white shrink-0">
              <div className="flex gap-3 mb-3">
                <button 
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmOrder}
                  disabled={orderQty < (selectedListing.minimumOrder || 1) || orderQty > selectedListing.volume}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Order
                </button>
              </div>
              <p className="text-center text-[11px] text-slate-400 font-medium">
                By confirming, you agree to the AgriTayo purchase terms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

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
