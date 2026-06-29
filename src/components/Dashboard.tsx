"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Settings,
  Plus,
  Map as MapIcon,
  Clock,
  Leaf,
  Search,
  Bell,
  ChevronDown,
  Menu,
  MoreVertical,
  LineChart,
  Store,
  User,
  LogOut,
  Loader2,
  Sprout,
  ShoppingBag
, Truck, Package, CheckCircle2, MapPin, AlertTriangle
} from 'lucide-react';
import { getSession, logout, getRoleColor, getUsers } from '../lib/auth';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

import { METRICS, AI_LIVE_FEED, ANALYTICS_DATA } from '../data/mockData';
import NotificationBell from './NotificationBell';

const RouteLine = ({ origin, destination }: { origin: any, destination: any }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !(window as any).google) return;
    const polyline = new (window as any).google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });
    polyline.setMap(map);
    return () => polyline.setMap(null);
  }, [map, origin, destination]);
  return null;
};

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [completedRoutesCount, setCompletedRoutesCount] = useState(0);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [totalRegisteredUsers, setTotalRegisteredUsers] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [activeCooperatives, setActiveCooperatives] = useState(0);
  const [platformActiveDispatches, setPlatformActiveDispatches] = useState(0);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [platformRoutes, setPlatformRoutes] = useState<any[]>([]);

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
      setActiveDeliveries(activeForDriver);

      const completedForDriver = orders.filter((o: any) => o.driverId === user.id && o.status === 'delivered');
      setCompletedRoutesCount(completedForDriver.length);

      if (activeForDriver.length > 0) {
        setActiveRoute({
          origin: { lat: 15.4867, lng: 120.9664 },
          destination: { lat: 14.5990, lng: 120.9672 },
          isDelayed: Math.random() > 0.5
        });
      }

      if (user.role === 'superadmin') {
         const sysUsers = getUsers();
         if (sysUsers.length === 0) {
           // Fallback if auth.ts hasn't seeded yet
           setTotalRegisteredUsers(6);
         } else {
           setTotalRegisteredUsers(sysUsers.length);
           setPendingApprovals(sysUsers.filter((u: any) => u.status === 'Pending').length);
           setRecentSignups([...sysUsers].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
           const orgs = new Set(sysUsers.map((u:any) => u.coopName).filter(Boolean));
           setActiveCooperatives(orgs.size);
         }
         
         const allDispatches = orders.filter((o:any) => o.status === 'confirmed' || o.status === 'in-transit');
         setPlatformActiveDispatches(allDispatches.length);
         
         const routes = allDispatches.map((d: any) => ({
            origin: d.pickupCoords || { lat: 15.4867, lng: 120.9664 },
            destination: d.deliveryCoords || { lat: 14.5990, lng: 120.9672 },
         }));
         setPlatformRoutes(routes.length > 0 ? routes : [{ origin: { lat: 15.4867, lng: 120.9664 }, destination: { lat: 14.5990, lng: 120.9672 } }]);
      }
    }
  }, []);

  const driverCards = [
    { id: 'dc1', label: 'Assigned Tasks', value: activeDeliveriesCount, icon: <Package className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'dc2', label: 'Completed Routes', value: completedRoutesCount, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'dc3', label: 'Active ETA Status', value: activeRoute ? (activeRoute.isDelayed ? 'Delayed' : 'On Time') : 'No Active Route', trend: activeRoute?.isDelayed ? 'down' : 'up', trendValue: activeRoute?.isDelayed ? 'Check feed' : 'All good', icon: <Clock className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> }
  ];

  const superadminCards = [
    { id: 'sa1', label: 'Total Registered Users', value: totalRegisteredUsers, icon: <User className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'sa2', label: 'Pending Approvals', value: pendingApprovals, icon: <AlertTriangle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'sa3', label: 'Active Cooperatives', value: activeCooperatives, icon: <Store className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> },
    { id: 'sa4', label: 'Active Dispatches', value: platformActiveDispatches, icon: <Truck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" /> }
  ];

  const feedItems = session?.role === 'driver' 
    ? AI_LIVE_FEED.filter(item => /logistic|route|dispatch|delay|weather/i.test(item.message))
    : AI_LIVE_FEED;
  const driverAlerts = feedItems
    .filter(item => item.severity === 'high' || item.severity === 'medium')
    .slice(0, 5);

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
      
      {/* Sidebar - Now with Collapsible State */}
      <aside className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div>
          {/* Branding Header */}
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

          {/* Navigation */}
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
                {/* Active Indicator Line */}
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
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Global Top Header */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between shrink-0 z-10 sticky top-0">
          
          {/* Sidebar Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Command Center</h2>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all duration-300"
                placeholder="Search incidents, sectors, users..."
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

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 z-0">
          
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Top Summary Strip */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">At-a-Glance</h2>
                <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View full report <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {(session?.role === 'driver' ? driverCards : session?.role === 'superadmin' ? superadminCards : METRICS).map((metric: any) => (
                  <div 
                    key={metric.id} 
                    className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200/60 transition-all duration-300 flex flex-col justify-between cursor-default hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-semibold text-slate-500 tracking-wide">{metric.label}</span>
                      <div className="bg-emerald-50/80 p-2.5 rounded-xl group-hover:bg-emerald-100/80 transition-colors duration-300">
                        {metric.icon}
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-emerald-950 transition-colors">{metric.value}</div>
                      {metric.trend && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className={`
                            ${metric.trend === 'up' || metric.trend === 'down' ? 'text-emerald-600' : 'text-slate-500'}
                          `}>
                            {metric.trendValue}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split View (70/30) */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
              
              {/* Left Column (70%) - Live Tracking Interface with Google Maps */}
              <div className="flex-[7] bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col group/map min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm shrink-0 z-10 shadow-sm">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2.5">
                    <MapIcon className="w-5 h-5 text-emerald-600 group-hover/map:animate-bounce-subtle" />
                    Live Sector Map (Google Maps Platform)
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100/50">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live Sync</span>
                  </div>
                </div>
                
                {/* Google Maps Container */}
                <div className="flex-1 relative overflow-hidden bg-slate-100">
                  {/* SPARKFEST COMPLIANCE: Google Maps Platform Integration */}
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
                    <GoogleMap
                      defaultCenter={{ lat: 14.5995, lng: 120.9842 }} // Default to Manila
                      defaultZoom={11}
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      mapId="DEMO_MAP_ID"
                      className="w-full h-full"
                    >
                      {session?.role === 'driver' && activeRoute && (
                        <>
                          <RouteLine origin={activeRoute.origin} destination={activeRoute.destination} />
                          <AdvancedMarker position={activeRoute.origin}>
                            <Pin background={'#10b981'} glyphColor={'#fff'} borderColor={'#064e3b'} />
                          </AdvancedMarker>
                          <AdvancedMarker position={activeRoute.destination}>
                            <Pin background={'#ef4444'} glyphColor={'#fff'} borderColor={'#7f1d1d'} />
                          </AdvancedMarker>
                        </>
                      )}
                    </GoogleMap>
                  </APIProvider>
                  
                  {session?.role === 'driver' && !activeRoute && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
                      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm text-center">
                        <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active route</h3>
                        <p className="text-slate-500 text-center">Accept a new delivery dispatch from the Available Deliveries page to view live routing.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (30%) - AI-Categorized Live Feed */}
              <div className="flex-[3] bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col h-[500px] lg:h-auto">
                <div className="px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-sm shrink-0 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2.5">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Activity Feed
                  </h3>
                  <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {feedItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-xl border border-slate-100/80 bg-slate-50/50 hover:bg-white hover:border-emerald-100 hover:shadow-[0_4px_20px_rgba(16,185,129,0.05)] transition-all duration-300 group cursor-default relative overflow-hidden flex flex-col gap-2"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        ${item.severity === 'high' ? 'bg-rose-500' : 
                          item.severity === 'medium' ? 'bg-amber-500' : 
                          'bg-emerald-500'
                        }
                      `} />

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${item.severity === 'high' ? 'bg-rose-100/80 text-rose-700 border border-rose-200/50' : 
                            item.severity === 'medium' ? 'bg-amber-100/80 text-amber-700 border border-amber-200/50' : 
                            'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
                          }
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full 
                            ${item.severity === 'high' ? 'bg-rose-500 animate-pulse' : 
                              item.severity === 'medium' ? 'bg-amber-500' : 
                              'bg-emerald-500'
                            }
                          `}></span>
                          {item.severity === 'high' ? 'Urgent' : item.severity === 'medium' ? 'Warning' : 'Info'}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold shrink-0 group-hover:text-slate-500 transition-colors">
                          <Clock className="w-3.5 h-3.5" />
                          {item.timestamp}
                        </div>
                      </div>
                      
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed group-hover:text-emerald-900 transition-colors duration-200">
                        "{item.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

                        {/* Bottom Section - Role Based */}
            {session?.role === 'driver' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                
                {/* Driver Panel 1: My Active Deliveries */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-600" />
                      My Active Deliveries
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {activeDeliveries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Truck className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No active deliveries</p>
                      </div>
                    ) : (
                      activeDeliveries.map((delivery) => (
                        <div key={delivery.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-800 text-sm">{delivery.crop} <span className="text-slate-500 font-normal">({delivery.quantity}kg)</span></div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                              {delivery.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="truncate max-w-[120px]">{delivery.pickupLocation || 'Farm'}</span>
                            <span className="text-slate-300 mx-1">→</span>
                            <span className="truncate max-w-[120px]">{delivery.deliveryLocation || 'Market'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Driver Panel 2: Recent Logistics Alerts */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-emerald-600" />
                      Recent Logistics Alerts
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {driverAlerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50 text-emerald-400" />
                        <p className="text-sm font-medium">No recent alerts</p>
                      </div>
                    ) : (
                      driverAlerts.map((alert) => (
                        <div key={alert.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              alert.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {alert.severity === 'high' ? 'URGENT' : 'WARNING'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{alert.timestamp}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

              
              {/* Chart Placeholder 1 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-emerald-600" />
                    Yield Prediction vs Actual (kg)
                  </h3>
                  <select className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none focus:border-emerald-500">
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>Year to Date</option>
                  </select>
                </div>
                
                <div className="flex-1 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50/50 transition-colors group-hover:border-emerald-100 relative">
                  <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2 text-slate-400">
                    <div className="w-full flex justify-between text-xs mb-2">
                      {ANALYTICS_DATA.map((data, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="h-24 w-8 bg-emerald-100 rounded-sm relative flex items-end">
                             {/* Simple visual mock based on predicted/actual */}
                             <div className="w-full bg-emerald-400 rounded-sm" style={{height: `${(data.actual / 5000) * 100}%`}}></div>
                          </div>
                          <span className="mt-2 font-medium">{data.period}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-sm font-medium">Recharts Integration Ready</p>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder 2 */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 flex flex-col h-72 group">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Market Price Volatility
                  </h3>
                  <select className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none focus:border-emerald-500">
                    <option>This Week</option>
                    <option>Last Week</option>
                  </select>
                </div>
                <div className="flex-1 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50/50 transition-colors group-hover:border-emerald-100 relative">
                   <div className="absolute inset-0 p-4 flex items-center justify-center text-slate-400">
                     <p className="text-sm font-medium">Recharts Integration Ready</p>
                   </div>
                 </div>
              </div>
            </div>
          )}

          </div>
        </main>

      </div>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
