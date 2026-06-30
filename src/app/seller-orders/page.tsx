"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SkeletonCard } from '@/components/Skeleton';
import { useCountUp } from '@/hooks/useCountUp';
import NotificationBell from '../../components/NotificationBell';
import { useRouter } from 'next/navigation';
import { AlertTriangle,  
  LayoutDashboard, Store, Map as MapIcon, BarChart3, Settings, User, 
  Menu, ChevronDown, Bell, LogOut, Loader2, Sprout, ShoppingBag, MapPin, Truck, CheckCircle2, Box, XCircle, Leaf,
  Smartphone, CreditCard, Banknote, Package, Inbox, CalendarClock
} from 'lucide-react';
import { getSession, logout, getRoleColor } from '@/lib/auth';

export default function SellerOrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('Orders');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Sidebar states
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);

  // Seller orders state
  const [sellerPendingOrdersCount, setSellerPendingOrdersCount] = useState(0);
  
  const [activeTab, setActiveTab] = useState('Pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'decline' | null>(null);
  const [declineReason, setDeclineReason] = useState('Out of stock');

  const loadOrders = (user: any) => {
    let allOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    const allListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
    
    let hasMigrated = false;
    allOrders = allOrders.map((o: any) => {
      if ((o.sellerId === user.id || o.sellerName === user.name) && (!o.listingId || !allListings.find((l:any) => l.id === o.listingId))) {
        const fallback = allListings.find((l: any) => l.crop === o.crop && l.sellerId === user.id);
        if (fallback) {
          hasMigrated = true;
          return { ...o, listingId: fallback.id };
        }
      }
      return o;
    });

    if (hasMigrated) {
      localStorage.setItem('agritayo_orders', JSON.stringify(allOrders));
    }

    const myOrders = allOrders
      .filter((o: any) => o.sellerId === user.id || o.sellerName === user.name)
      .sort((a: any, b: any) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    
    setOrders(myOrders);
    
    const pending = myOrders.filter((o: any) => o.status === 'pending');
    setSellerPendingOrdersCount(pending.length);
  };

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'seller') {
      window.location.href = '/';
    } else {
      setSession(user);
      setIsAuthLoading(false);
      const timer = setTimeout(() => {
        try {
          loadOrders(user);
        } catch (error) {
          console.error('Failed to load orders:', error);
          setOrders([]);
        } finally {
          setIsOrdersLoading(false);
        }
      }, 300);
    }
  }, []);

  const handleDeclineOrder = (orderId: string, reason: string = 'Other') => {
    const allOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    const updatedOrders = allOrders.map((o: any) => {
      if (o.id === orderId) {
        return { ...o, status: 'declined', declineReason: reason };
      }
      return o;
    });
    localStorage.setItem('agritayo_orders', JSON.stringify(updatedOrders));
    loadOrders(session);
    setConfirmingOrderId(null);
    setConfirmAction(null);
    showToast('Order declined');
  };

  const handleAcceptOrder = (order: any) => {
    {
      
      // 1. Find matching listing in agritayo_listings
      const allListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
      let remaining = 0;
      let listingHitZero = false;
      
      const targetListing = allListings.find((l: any) => l.id === order.listingId) || allListings.find((l: any) => l.crop === order.crop && l.sellerId === session?.id);
      
      const updatedListings = allListings.map((l: any) => {
        if (targetListing && l.id === targetListing.id) {
          remaining = l.volume - order.quantity;
          if (remaining <= 0) {
            remaining = 0;
            listingHitZero = true;
          }
          return { ...l, volume: remaining, status: remaining <= 0 ? 'Sold Out' : 'Active' };
        }
        return l;
      });
      localStorage.setItem('agritayo_listings', JSON.stringify(updatedListings));

      // 2. Update order status
      const allOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const updatedOrders = allOrders.map((o: any) => {
        if (o.id === order.id) {
          return { ...o, status: 'confirmed', confirmedAt: new Date().toISOString() };
        }
        return o;
      });
      localStorage.setItem('agritayo_orders', JSON.stringify(updatedOrders));
      
      // 3. Re-render
      loadOrders(session);
      showToast(`Order accepted! ${order.quantity}kg deducted from your listing. ${remaining}kg remaining.`);
      
      if (listingHitZero) {
        setTimeout(() => {
          showToast(`Your ${order.crop} listing is now sold out and removed from active browsing.`);
        }, 3000);
      }
      setConfirmingOrderId(null);
      setConfirmAction(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending' && o.status === 'pending') return true;
    if (activeTab === 'Confirmed' && o.status === 'confirmed') return true;
    if (activeTab === 'In Transit' && o.status === 'in_transit') return true;
    if (activeTab === 'Delivered' && o.status === 'delivered') return true;
    if (activeTab === 'Declined' && o.status === 'declined') return true;
    return false;
  });

  const confirmedOrDelivered = orders.filter(o => o.status === 'confirmed' || o.status === 'in_transit' || o.status === 'delivered');
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = confirmedOrDelivered.length;
  const totalRevenue = confirmedOrDelivered.reduce((sum, o) => sum + o.total, 0);
  const totalVolumeSold = confirmedOrDelivered.reduce((sum, o) => sum + o.quantity, 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    if (!name) return 'UN';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
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
                onClick={() => { setActiveNav(item.name); router.push(item.href); }}
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

      {/* Main Content Area */}
      <main className="animate-fadeIn flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
        
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders for Your Harvest</h1>
              <p className="text-sm font-medium text-slate-500">Review and manage buyer orders</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationBell role={session?.role} />
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Pending Orders</div>
                  <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Confirmed Orders</div>
                  <div className="text-2xl font-black text-slate-900">{confirmedCount}</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Total Revenue</div>
                  <div className="text-2xl font-black text-slate-900">₱{totalRevenue.toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Box className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Volume Sold</div>
                  <div className="text-2xl font-black text-slate-900">{totalVolumeSold} kg</div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200/60 flex items-center justify-start overflow-x-auto custom-scrollbar">
              {['All', 'Pending', 'Confirmed', 'In Transit', 'Delivered', 'Declined'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {tab}
                  {tab === 'Pending' && pendingCount > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4 pb-12">
{filteredOrders.length === 0 && !isOrdersLoading ? (
                <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-4xl">📭</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
                  <p className="text-slate-500 max-w-sm">Orders from buyers will appear here once they purchase your harvest.</p>
                </div>
              ) : isOrdersLoading ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />) : filteredOrders.map((order, index) => {
                  
                  // Get live volume if pending to show warning
                  let currentListingVolume = 0;
                  if (order.status === 'pending') {
                    const allListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
                    const matchedListing = allListings.find((l: any) => l.id === order.listingId) || allListings.find((l: any) => l.crop === order.crop && l.sellerId === session?.id);
                    if (matchedListing) currentListingVolume = matchedListing.volume;
                  }

                  return (
                    <div key={order.id} style={{ animationDelay: `${index * 80}ms` }} className="animate-fadeIn bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      {/* Card Header */}
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 bg-white rounded-xl shadow-sm border border-slate-100">{order.emoji}</span>
                          <div>
                            <div className="font-black text-slate-900 text-lg">{order.crop}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{order.id}</div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm
                          ${order.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            order.status === 'in_transit' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'}
                        `}>
                          {order.status === 'pending' ? <CalendarClock className="w-4 h-4" /> :
                           order.status === 'confirmed' ? <CheckCircle2 className="w-4 h-4" /> :
                           order.status === 'in_transit' ? <Truck className="w-4 h-4" /> :
                           order.status === 'delivered' ? <Box className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {order.status === 'pending' ? 'Pending — Action Needed' : order.status.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Buyer Info */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Buyer Info</h4>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {getInitials(order.buyerName)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{order.buyerName}</div>
                              <div className="text-sm text-slate-500">📞 Not provided</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-slate-700">
                              {order.pickupMethod === 'farm-pickup' ? (
                                <span className="font-medium text-emerald-600">Farm pickup arranged</span>
                              ) : order.deliveryAddress ? (
                                <span>{order.deliveryAddress.fullAddress}, {order.deliveryAddress.city}, {order.deliveryAddress.province}</span>
                              ) : 'Address pending'}
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</div>
                              <div className="font-bold text-slate-900">{order.quantity} kg</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price per kg</div>
                              <div className="font-bold text-slate-900">₱{order.pricePerKg}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Total</div>
                              <div className="font-black text-emerald-600 text-lg">₱{order.total.toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</div>
                              <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                                {order.paymentMethod === 'cash-on-delivery' ? <Banknote className="w-4 h-4 text-emerald-500" /> : <CreditCard className="w-4 h-4 text-blue-500" />}
                                {order.paymentLabel}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pickup Method</div>
                              <div className="font-medium text-slate-900 text-sm capitalize">{order.pickupMethod.replace('-', ' ')}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Placed</div>
                              <div className="font-medium text-slate-900 text-sm">{formatDate(order.placedAt)}</div>
                            </div>
                          </div>
                        </div>
                        
                      </div>

                      {/* Notes & Actions Footer */}
                      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        {order.buyerNote && (
                          <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 shadow-sm flex items-start gap-3">
                            <span className="text-lg leading-none">💬</span>
                            <div><strong className="text-slate-900">Buyer's note:</strong> {order.buyerNote}</div>
                          </div>
                        )}
                        
                        {order.status === 'pending' && (
                          confirmingOrderId === order.id ? (
                            <div className={`p-5 rounded-xl border animate-in fade-in zoom-in duration-200 ${confirmAction === 'accept' ? 'bg-[#e8f5ec] border-[#c6e9d4]' : 'bg-[#fdecec] border-[#f5c2c2]'}`}>
                              
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${confirmAction === 'accept' ? 'bg-[#1a5c2e]' : 'bg-rose-600'}`}>
                                  {confirmAction === 'accept' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                </div>
                                <h4 className={`font-black text-lg ${confirmAction === 'accept' ? 'text-[#1a5c2e]' : 'text-rose-900'}`}>
                                  {confirmAction === 'accept' ? 'Confirm this order?' : 'Decline this order?'}
                                </h4>
                              </div>

                              <div className="bg-white rounded-lg p-4 border border-slate-100/50 shadow-sm mb-4">
                                <div className="flex items-center justify-between font-bold text-slate-800 text-sm mb-1">
                                  <span>{order.emoji} {order.quantity}kg {order.crop} for {order.buyerName}</span>
                                  <span className={confirmAction === 'accept' ? 'text-[#1a5c2e] text-lg' : ''}>₱{order.total.toLocaleString()}</span>
                                </div>
                                {confirmAction === 'accept' && (
                                  <div className="text-xs font-bold text-slate-500">
                                    Remaining stock after accepting: <span className={currentListingVolume - order.quantity === 0 ? 'text-amber-500' : 'text-slate-800'}>{currentListingVolume - order.quantity}kg</span>
                                  </div>
                                )}
                              </div>

                              {confirmAction === 'decline' && (
                                <div className="mb-5">
                                  <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">Select a reason (optional)</label>
                                  <select 
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    className="w-full sm:w-auto bg-white border border-rose-200 text-rose-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2.5 outline-none font-medium shadow-sm"
                                  >
                                    <option value="Out of stock">Out of stock</option>
                                    <option value="Price dispute">Price dispute</option>
                                    <option value="Unable to deliver">Unable to deliver</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                              )}

                              <div className="flex items-center justify-end gap-3 pt-2">
                                <button 
                                  onClick={() => { setConfirmingOrderId(null); setConfirmAction(null); }}
                                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                {confirmAction === 'accept' ? (
                                  <button 
                                    onClick={() => handleAcceptOrder(order)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1a5c2e] hover:bg-emerald-800 shadow-md shadow-emerald-500/20 transition-colors"
                                  >
                                    Yes, Accept Order
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleDeclineOrder(order.id, declineReason)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-colors"
                                  >
                                    Yes, Decline Order
                                  </button>
                                )}
                              </div>

                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              
                              <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 inline-flex shadow-sm">
                                  <span>Your current stock: <strong>{currentListingVolume} kg</strong> available</span>
                                </div>
                                {order.quantity > currentListingVolume && (
                                  <div className="mt-2 text-sm font-bold text-rose-600 flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4" />
                                    ⚠ This order exceeds your remaining stock!
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                                <button 
                                  onClick={() => { setConfirmingOrderId(order.id); setConfirmAction('decline'); }}
                                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-rose-600 bg-white border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                                >
                                  Decline Order
                                </button>
                                <button 
                                  onClick={() => { setConfirmingOrderId(order.id); setConfirmAction('accept'); }}
                                  disabled={order.quantity > currentListingVolume}
                                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Accept Order
                                </button>
                              </div>
                            </div>
                          )
                        )}

                        {order.status === 'confirmed' && (
                          <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700">Waiting for a driver to pick up this order</span>
                            <span>You'll be notified once a driver accepts the delivery</span>
                          </div>
                        )}

                        {order.status === 'in_transit' && (
                          <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                            <span className="font-bold text-purple-700">🚚 Your harvest is on its way to the buyer</span>
                            {order.driverName && <span>Driver: {order.driverName}</span>}
                          </div>
                        )}

                        {order.status === 'delivered' && (
                          <div className="flex items-center justify-between text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Delivered on {formatDate(order.deliveredAt)}</span>
                            <span>You earned ₱{order.total.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {order.status === 'declined' && (
                          <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700">Declined: {order.declineReason || 'No reason provided'}</span>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
            </div>

          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium text-sm">{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}
