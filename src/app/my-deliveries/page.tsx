"use client";

import React, { useState, useEffect } from 'react';
import NotificationBell from '../../components/NotificationBell';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Map as MapIcon, BarChart3, User, 
  Menu, ChevronDown, Bell, LogOut, Loader2, Truck, Leaf, 
  Package, MapPin, Clock, CheckCircle2
, ShoppingBag, Sprout, ChevronRight
, Store, Settings
} from 'lucide-react';
import { getSession, logout, getRoleColor } from '@/lib/auth';

export default function MyDeliveriesPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('My Deliveries');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Active');
  const [toastMessage, setToastMessage] = useState('');
  
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [availableOrdersCount, setAvailableOrdersCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  
  const [confirmingDeliveryId, setConfirmingDeliveryId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'driver') {
      window.location.href = '/login';
    } else {
      setSession(user);
      setIsAuthLoading(false);
      loadOrders(user.id);
    }
  }, []);

  const loadOrders = (driverId: string) => {
    const storedOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    
    const driverOrders = storedOrders
      .filter((o: any) => o.driverId === driverId)
      .sort((a: any, b: any) => new Date(b.acceptedAt || b.placedAt).getTime() - new Date(a.acceptedAt || a.placedAt).getTime());
    
    // Convert missing fields for backward compatibility with mock structures
    const mappedDriverOrders = driverOrders.map((o: any) => ({
      ...o,
      pickupLocation: o.location || o.pickupLocation || "Farm location",
      deliveryLocation: o.deliveryAddress?.fullAddress ? `${o.deliveryAddress.city}` : (o.deliveryLocation || "Market address"),
      estimatedDistance: o.estimatedDistance || "45 km",
      estimatedDuration: o.estimatedDuration || "1 hr 15 mins",
      driverPayout: o.driverPayout || Math.floor(Math.random() * 200 + 150),
    }));

    setMyDeliveries(mappedDriverOrders);
    
    const active = mappedDriverOrders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled');
    setActiveDeliveriesCount(active.length);
    
    const available = storedOrders.filter((o: any) => o.status === 'pending' && !o.driverId);
    setAvailableOrdersCount(available.length);
  };

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const storedOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    const index = storedOrders.findIndex((o: any) => o.id === orderId);
    
    if (index >= 0) {
      storedOrders[index].status = newStatus;
      if (newStatus === 'delivered') {
        storedOrders[index].deliveredAt = new Date().toISOString();
      }
      localStorage.setItem('agritayo_orders', JSON.stringify(storedOrders));
      loadOrders(session.id);
      
      if (newStatus === 'in_transit') {
        showToast("Marked as picked up! Drive safe 🚚");
      } else if (newStatus === 'delivered') {
        showToast(`Delivery complete! ₱${storedOrders[index].driverPayout || 350} earned 🎉`);
        setConfirmingDeliveryId(null);
      }
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

  const getInitials = (name: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredDeliveries = myDeliveries.filter(d => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return d.status !== 'delivered' && d.status !== 'cancelled';
    if (activeFilter === 'Completed') return d.status === 'delivered';
    if (activeFilter === 'Cancelled') return d.status === 'cancelled';
    return true;
  });

  const completedToday = myDeliveries.filter(d => d.status === 'delivered' && new Date(d.deliveredAt).toDateString() === new Date().toDateString()).length;
  const totalEarnings = myDeliveries.filter(d => d.status === 'delivered').reduce((acc, d) => acc + (d.driverPayout || 0), 0);
  const completedTotal = myDeliveries.filter(d => d.status === 'delivered').length;

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
                {session.role}
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
                    {item.name === 'Available Deliveries' && availableOrdersCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {availableOrdersCount}
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
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">My Deliveries</h2>
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
                  <span className="text-[11px] font-medium text-slate-500 capitalize">{session.role}</span>
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
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Deliveries</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage your active and completed delivery jobs</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-amber-50 text-amber-900 rounded-xl border border-amber-200 shadow-sm p-4 min-w-[130px]">
                  <p className="text-xs uppercase font-bold text-amber-700 mb-1">Active Deliveries</p>
                  <p className="text-2xl font-black">{activeDeliveriesCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-w-[130px]">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Completed Today</p>
                  <p className="text-2xl font-black text-slate-800">{completedToday}</p>
                </div>
                <div className="bg-[#1a5c2e] rounded-xl border border-emerald-800 shadow-sm p-4 min-w-[130px] text-white hidden sm:block">
                  <p className="text-xs uppercase font-bold text-emerald-300 mb-1">Total Earnings</p>
                  <p className="text-xl font-black mt-0.5">₱{totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
              {['All', 'Active', 'Completed', 'Cancelled'].map(tab => (
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

            {/* Delivery Jobs List */}
            <div className="space-y-6 pb-6">
              {filteredDeliveries.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm p-12 flex flex-col items-center text-center">
                  <Truck className="w-12 h-12 text-slate-300 mb-4" />
                  <h2 className="text-2xl font-black text-slate-900 mb-2">No deliveries yet</h2>
                  <p className="text-slate-500 font-medium mb-6">Browse available jobs and accept your first delivery!</p>
                  <button 
                    onClick={() => router.push('/available-deliveries')}
                    className="px-6 py-3 bg-[#1a5c2e] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors"
                  >
                    Find Deliveries &rarr;
                  </button>
                </div>
              ) : (
                filteredDeliveries.map((job) => {
                  const isConfirming = confirmingDeliveryId === job.id;
                  
                  let statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  let statusText = 'Unknown';
                  let stepCount = 1;
                  
                  if (job.status === 'confirmed') {
                    statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    statusText = 'Confirmed';
                    stepCount = 1;
                  } else if (job.status === 'in_transit') {
                    statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    statusText = 'In Transit';
                    stepCount = 3;
                  } else if (job.status === 'delivered') {
                    statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    statusText = 'Delivered';
                    stepCount = 4;
                  } else if (job.status === 'cancelled') {
                    statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    statusText = 'Cancelled';
                    stepCount = 0;
                  }

                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      
                      {/* Top Row */}
                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{job.emoji}</span>
                          <h3 className="font-bold text-lg text-slate-900">{job.crop}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                            {statusText}
                          </div>
                        </div>
                      </div>

                      {/* Route Row */}
                      <div className="p-6 pb-4 border-b border-slate-50 border-dashed">
                        <div className="flex items-center justify-between w-full relative mb-4">
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

                      {/* Cargo + Earnings Row */}
                      <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm border-b border-slate-100">
                        <div>
                          <p className="text-slate-500 mb-1">Cargo Details</p>
                          <p className="font-bold text-slate-800">{job.quantity} kg {job.crop}</p>
                          <p className="text-slate-600 mt-1">Order value: ₱{job.total.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 mb-1">Your Payout</p>
                          <p className="font-bold text-[#1a5c2e] text-lg leading-none">₱{job.driverPayout}</p>
                          <p className="text-slate-500 text-xs mt-1">Payment: {job.paymentMethod}</p>
                          <p className="text-slate-400 text-xs mt-0.5">Accepted: {formatDate(job.acceptedAt)}</p>
                        </div>
                      </div>

                      {/* Stepper */}
                      {job.status !== 'cancelled' ? (
                        <div className="px-8 py-5">
                          <div className="relative flex justify-between items-center mb-2">
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
                            <div 
                              className="absolute left-0 top-1/2 h-0.5 bg-emerald-500 -z-10 -translate-y-1/2 transition-all duration-500" 
                              style={{ width: `${(stepCount - 1) * 33.33}%` }} 
                            />
                            
                            {[
                              { label: 'Accepted', step: 1 },
                              { label: 'Picked Up', step: 2 },
                              { label: 'In Transit', step: 3 },
                              { label: 'Delivered', step: 4 }
                            ].map((s) => (
                              <div key={s.step} className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full border-2 ${stepCount >= s.step ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider absolute top-4 ${stepCount >= s.step ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {s.label}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="h-4" /> {/* Spacer for labels */}
                        </div>
                      ) : (
                        <div className="px-6 py-5 text-center">
                          <p className="text-rose-500 font-bold uppercase tracking-wider text-sm">Delivery Cancelled</p>
                        </div>
                      )}

                      {/* Actions */}
                      {job.status === 'confirmed' && (
                        <div className="px-6 pb-6">
                          <button 
                            onClick={() => updateOrderStatus(job.id, 'in_transit')}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                          >
                            Mark as Picked Up
                          </button>
                        </div>
                      )}

                      {job.status === 'in_transit' && !isConfirming && (
                        <div className="px-6 pb-6">
                          <button 
                            onClick={() => setConfirmingDeliveryId(job.id)}
                            className="w-full py-3 bg-[#1a5c2e] hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-colors"
                          >
                            Mark as Delivered
                          </button>
                        </div>
                      )}

                      {isConfirming && (
                        <div className="px-6 pb-6 pt-2">
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="font-bold text-emerald-900 mb-1 text-center">Confirm delivery complete?</p>
                            <p className="text-sm text-emerald-700 text-center mb-4">{job.quantity}kg {job.crop} delivered to {job.deliveryLocation}</p>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => updateOrderStatus(job.id, 'delivered')}
                                className="flex-1 bg-[#1a5c2e] hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
                              >
                                Confirm Delivered
                              </button>
                              <button 
                                onClick={() => setConfirmingDeliveryId(null)}
                                className="flex-1 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold transition-all"
                              >
                                Not yet
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {job.status === 'delivered' && (
                        <div className="px-6 pb-6">
                          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                              <CheckCircle2 className="w-5 h-5" />
                              Delivered on {formatDate(job.deliveredAt)}
                            </div>
                            <div className="text-emerald-900 font-bold text-sm">
                              Earnings: ₱{job.driverPayout}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* Earnings Summary Card */}
            {myDeliveries.length > 0 && (
              <div className="bg-[#1a5c2e] rounded-2xl p-6 text-white shadow-xl mt-8 animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-bl-full opacity-20" />
                <h3 className="text-emerald-200 font-bold uppercase tracking-wider text-xs mb-1">Total earnings this month</h3>
                <p className="text-4xl font-black mb-6">₱{totalEarnings.toLocaleString()}</p>
                <div className="flex gap-8 border-t border-emerald-800/50 pt-4">
                  <div>
                    <p className="text-emerald-300 text-xs font-bold mb-0.5">Deliveries completed</p>
                    <p className="text-xl font-bold">{completedTotal}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300 text-xs font-bold mb-0.5">Avg. payout per trip</p>
                    <p className="text-xl font-bold">₱{completedTotal > 0 ? Math.round(totalEarnings / completedTotal).toLocaleString() : 0}</p>
                  </div>
                </div>
              </div>
            )}

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
