"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SkeletonCard } from '@/components/Skeleton';
import { useCountUp } from '@/hooks/useCountUp';
import NotificationBell from '../../components/NotificationBell';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Store, Map as MapIcon, BarChart3, Settings, User, 
  Menu, ChevronDown, Bell, LogOut, Loader2, Sprout, ShoppingBag, MapPin, Truck, CheckCircle2, Box, XCircle, Leaf,
  Smartphone, CreditCard, Banknote
, Package
, Inbox} from 'lucide-react';
import { getSession, logout, getRoleColor } from '@/lib/auth';

export default function MyOrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('My Orders');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sellerPendingOrdersCount, setSellerPendingOrdersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);

  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const loadOrders = (user: any) => {
    const allOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    const myOrders = allOrders
      .filter((o: any) => o.buyerId === user.id)
      .sort((a: any, b: any) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    
    setOrders(myOrders);
    
    const pending = myOrders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed');
    setPendingOrdersCount(pending.length);
      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);
  };

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'buyer') {
      window.location.href = '/';
    } else {
      setSession(user);
      setIsAuthLoading(false);

      const _allSellerOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const _pendingSellerOrders = _allSellerOrders.filter((o: any) => (o.sellerId === user.id || o.sellerName === user.name) && o.status === 'pending');
      setSellerPendingOrdersCount(_pendingSellerOrders.length);
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

  const handleCancelOrder = (orderId: string) => {
    const allOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
    const updatedOrders = allOrders.map((o: any) => {
      if (o.id === orderId && o.buyerId === session.id) {
        return { ...o, status: 'cancelled' };
      }
      return o;
    });
    localStorage.setItem('agritayo_orders', JSON.stringify(updatedOrders));
    loadOrders(session);
    setToastMessage('Order cancelled');
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
    return false;
  });

  const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalOrders = orders.length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderStepper = (status: string) => {
    if (status === 'cancelled') {
      return (
        <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-sm mt-4 mx-6 p-3 bg-rose-50 rounded-xl border border-rose-100">
          <XCircle className="w-5 h-5" />
          Order Cancelled
        </div>
      );
    }

    const steps = [
      { key: 'pending', label: 'Placed' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'in_transit', label: 'In Transit' },
      { key: 'delivered', label: 'Delivered' }
    ];

    const currentIndex = steps.findIndex(s => s.key === status) === -1 ? 0 : steps.findIndex(s => s.key === status);

    return (
      <div className="flex items-center justify-between mt-6 relative z-0 mx-6">
        <div className="absolute left-4 right-4 top-2.5 h-0.5 bg-slate-200 -z-10" />
        <div className="absolute left-4 top-2.5 h-0.5 bg-emerald-500 transition-all duration-500 -z-10" style={{ width: `calc(${(currentIndex / 3) * 100}% - 32px)` }} />
        
        {steps.map((step, idx) => (
          <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${idx <= currentIndex ? 'border-emerald-500 bg-emerald-500 shadow-sm' : 'border-slate-300 bg-white'}`}>
              {idx <= currentIndex && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${idx <= currentIndex ? 'text-emerald-700' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    );
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

        {/* Global Top Header */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">My Orders</h2>
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
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
                <p className="text-slate-500 mt-2 font-medium">Track all your harvest purchases.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-w-[140px]">
                  <p className="text-xs uppercase font-bold text-slate-400 mb-1">Total Orders</p>
                  <p className="text-2xl font-black text-slate-800">{totalOrders}</p>
                </div>
                <div className="bg-[#1a5c2e] rounded-xl border border-emerald-800 shadow-sm shadow-emerald-900/10 p-4 min-w-[140px] text-white">
                  <p className="text-xs uppercase font-bold text-emerald-300 mb-1">Total Spent</p>
                  <p className="text-2xl font-black">₱{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 mb-6 overflow-x-auto custom-scrollbar">
              {['All', 'Pending', 'Confirmed', 'In Transit', 'Delivered'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${
                    activeTab === tab ? 'text-[#1a5c2e]' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a5c2e] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Order List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 mt-8">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Box className="w-12 h-12 text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">No orders yet</h2>
                <p className="text-slate-500 font-medium max-w-sm mb-8">
                  Browse the market and place your first order!
                </p>
                <button onClick={() => router.push('/market')} className="bg-[#1a5c2e] hover:bg-emerald-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Go to Market
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order, index) => (
                  <div key={order.id} style={{ animationDelay: `${index * 80}ms` }} className="animate-fadeIn bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    
                    {/* Header Row */}
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{order.emoji}</span>
                        <h3 className="font-bold text-lg text-slate-900">{order.crop}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          order.paymentMethod === 'online-payment' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.paymentMethod === 'card-payment' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {order.paymentMethod === 'online-payment' ? 'Online' : order.paymentMethod === 'card-payment' ? 'Card' : 'COD'}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'in_transit' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-700">{order.sellerName}</p>
                            {order.cooperative && <p className="text-slate-500 font-medium">{order.cooperative}</p>}
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-slate-600 font-medium">{order.location}</p>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <Leaf className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-slate-600 font-medium">Harvest: {order.harvestDate}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-500">Quantity</span>
                          <span className="font-bold text-slate-800">{order.quantity} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-500">Price</span>
                          <span className="font-bold text-slate-800">₱{order.pricePerKg} / kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-500">Pickup</span>
                          <span className="font-bold text-slate-800">{order.pickupMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-slate-500">Payment</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            {order.paymentMethod === 'online-payment' ? <Smartphone className="w-4 h-4 text-slate-400" /> : 
                             order.paymentMethod === 'card-payment' ? <CreditCard className="w-4 h-4 text-slate-400" /> : 
                             <Banknote className="w-4 h-4 text-slate-400" />}
                            {order.paymentLabel || 'Cash on Delivery'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                          <span className="font-semibold text-slate-500">Placed</span>
                          <span className="font-bold text-slate-800">{formatDate(order.placedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {order.deliveryAddress && order.deliveryAddress.fullAddress && (
                      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">Deliver to: {order.deliveryAddress.fullAddress}, {order.deliveryAddress.city}, {order.deliveryAddress.province} {order.deliveryAddress.zipCode}</p>
                          {order.deliveryAddress.instructions && (
                            <p className="text-xs text-slate-500 mt-1 italic">Note: {order.deliveryAddress.instructions}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-2">
                      {order.buyerNote && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm mb-4">
                          <span className="font-bold text-slate-500 block mb-1">Your note:</span>
                          <span className="font-medium text-slate-700 italic">{order.buyerNote}</span>
                        </div>
                      )}
                      
                      <div className="bg-[#1a5c2e] text-white rounded-xl p-4 flex justify-between items-center mt-2 shadow-sm">
                        <span className="font-bold text-emerald-100 uppercase tracking-wider text-xs">Total Amount</span>
                        <span className="text-2xl font-black">₱{order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {renderStepper(order.status)}

                    <div className="px-6 py-4 border-t border-slate-100 mt-6 flex items-center justify-between bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID: {order.id}</span>
                      
                      {order.status === 'pending' && (
                        <button onClick={() => handleCancelOrder(order.id)} className="text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors">
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button onClick={() => router.push('/market')} className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors">
                          Order Again
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Global Toast Notification */}
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
