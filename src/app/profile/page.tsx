"use client";

import React, { useState, useEffect } from 'react';
import NotificationBell from '../../components/NotificationBell';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, EyeOff, Lock, LogOut, ShieldCheck, Check, LayoutDashboard, Store, Map as MapIcon, BarChart3, Settings, User, Menu, ChevronDown, Bell, Search, Loader2, Sprout, ShoppingBag, MapPin, Package , Truck
, Inbox} from 'lucide-react';
import { getSession, logout, getRoleColor, updateStoredUser } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  
  // Layout States
  const [activeNav, setActiveNav] = useState('Profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sellerPendingOrdersCount, setSellerPendingOrdersCount] = useState(0);
  
  // Profile Form States
  const [formData, setFormData] = useState<any>({});
  
  // Password States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passError, setPassError] = useState('');

  // Delivery Address State
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullAddress: '',
    city: '',
    province: '',
    zipCode: '',
    instructions: ''
  });

  useEffect(() => {
    const user = getSession();
    if (!user) {
      window.location.href = '/login';
    } else if (user.role === 'superadmin') {
      window.location.href = '/';
    } else {
      setSession(user);
      setFormData(user);
      setLoading(false);
      
      if (user.deliveryAddress) {
        setDeliveryAddress(user.deliveryAddress);
      } else if (user.province) {
        setDeliveryAddress(prev => ({ ...prev, province: user.province }));
      }
      
      const orders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const pending = orders.filter((o: any) => o.buyerId === user.id && (o.status === 'pending' || o.status === 'confirmed'));
      setPendingOrdersCount(pending.length);
      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoredUser(formData);
    localStorage.setItem('agritayo_session', JSON.stringify(formData));
    setSession(formData);
    showToast('Profile updated!');
  };

  const handleAddressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...session, deliveryAddress };
    updateStoredUser(updatedUser);
    localStorage.setItem('agritayo_session', JSON.stringify(updatedUser));
    setSession(updatedUser);
    showToast('Delivery address saved!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (passwords.current !== session.password) {
      setPassError('Current password is incorrect');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassError('Passwords do not match');
      return;
    }
    
    const updatedUser = { ...session, password: passwords.new };
    updateStoredUser(updatedUser);
    localStorage.setItem('agritayo_session', JSON.stringify(updatedUser));
    setSession(updatedUser);
    setPasswords({ current: '', new: '', confirm: '' });
    showToast('Password updated successfully');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#1a5c2e] animate-spin mb-4" />
        <div className="text-[#1a5c2e] font-bold text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

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
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">My Profile</h2>
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

        {/* Profile Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative z-0">
          
          <div className="max-w-[680px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-50 to-white pointer-events-none" />
              
              <div className="w-20 h-20 bg-[#1a5c2e] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4 relative z-10">
                {getInitials(session.name)}
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{session.name}</h2>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleColor(session.role)}`}>
                {session.role?.toLowerCase() === 'seller' ? 'Farmer' : session.role}
              </span>
              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-slate-500">@{session.username}</span>
                <span className="text-xs font-bold text-slate-400">Member since {session.joined || 'Today'}</span>
              </div>
            </div>

            {/* Editable Info Form */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Edit your information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Province</label>
                    <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                </div>
                
                {session.role === 'seller' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Cooperative / Farm Name</label>
                    <input type="text" value={formData.cooperative} onChange={e => setFormData({...formData, cooperative: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                )}
                
                {session.role === 'driver' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Truck Plate Number</label>
                    <input type="text" value={formData.plateNumber} onChange={e => setFormData({...formData, plateNumber: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  </div>
                )}

                <div className="relative group">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
                  <div className="relative">
                    <input type="text" value={formData.username} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-slate-100 text-slate-500 cursor-not-allowed font-medium" title="Username cannot be changed" />
                    <Lock className="absolute right-4 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#1a5c2e] hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-200 mt-4">
                  Save Changes
                </button>
              </form>
            </div>

            {/* Delivery Address Card (Buyers Only) */}
            {session.role === 'buyer' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#1a5c2e]" /> Delivery Address
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">This address will be pre-filled when you place orders on the market.</p>
                </div>
                
                <form onSubmit={handleAddressUpdate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Delivery Address</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. 123 Rizal Street, Barangay Poblacion" 
                      value={deliveryAddress.fullAddress} 
                      onChange={e => setDeliveryAddress({...deliveryAddress, fullAddress: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white resize-none" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Municipality / City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cabanatuan City"
                        value={deliveryAddress.city} 
                        onChange={e => setDeliveryAddress({...deliveryAddress, city: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Province</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Nueva Ecija"
                        value={deliveryAddress.province} 
                        onChange={e => setDeliveryAddress({...deliveryAddress, province: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">ZIP Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3100"
                      value={deliveryAddress.zipCode} 
                      onChange={e => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Delivery Instructions (optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Leave at the gate, call before delivery, landmark: near 7-Eleven" 
                      value={deliveryAddress.instructions} 
                      onChange={e => setDeliveryAddress({...deliveryAddress, instructions: e.target.value})} 
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white resize-none" 
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#1a5c2e] hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-200 mt-4">
                    Save Address
                  </button>
                </form>
              </div>
            )}

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1a5c2e]" /> Change Password
              </h3>
              
              {passError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-xl text-center">
                  {passError}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="relative">
                  <input type={showPass.current ? "text" : "password"} placeholder="Current Password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  <button type="button" onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-4 top-3 text-slate-400 hover:text-slate-600">
                    {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showPass.new ? "text" : "password"} placeholder="New Password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-4 top-3 text-slate-400 hover:text-slate-600">
                    {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showPass.confirm ? "text" : "password"} placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white" />
                  <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-4 top-3 text-slate-400 hover:text-slate-600">
                    {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-all duration-200 mt-2">
                  Update Password
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8">
              <h3 className="text-lg font-bold text-rose-900 mb-4">Account</h3>
              <button 
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }} 
                className="w-full flex items-center justify-center gap-2 border-2 border-rose-600 text-rose-600 hover:bg-rose-50 py-3 rounded-xl font-bold transition-all duration-200"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>

          </div>

          {/* Global Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
