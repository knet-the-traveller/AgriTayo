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
  Activity,
  Truck,
  AlertTriangle,
  ArrowRight,
  Leaf,
  User,
  MapPin,
  Clock,
  MoreVertical,
  CheckCircle2,
  LogOut,
  Loader2,
  Sprout,
  ShoppingBag
, Package
} from 'lucide-react';
import { getSession, logout, getRoleColor } from '../../lib/auth';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';

const DISPATCHES = [
  { id: "DSP-101", crop: "Tomatoes", emoji: "🍅", driver: "Mang Boyet Reyes", truck: "ABC-1234", origin: "Cabanatuan City, Nueva Ecija", destination: "Divisoria Market, Manila", originCoords: { lat: 15.4867, lng: 120.9664 }, destCoords: { lat: 14.5990, lng: 120.9672 }, status: "In Transit", eta: "2:30 PM today", progress: 65, volumeKg: 300 },
  { id: "DSP-102", crop: "Kamote", emoji: "🍠", driver: "Ka Rodel Santos", truck: "XYZ-5678", origin: "La Trinidad, Benguet", destination: "Balintawak Market, QC", originCoords: { lat: 16.4623, lng: 120.5874 }, destCoords: { lat: 14.6570, lng: 121.0180 }, status: "Delivered", eta: "Arrived 11:45 AM", progress: 100, volumeKg: 500 },
  { id: "DSP-103", crop: "Pechay", emoji: "🥬", driver: "Aling Cely Delos Reyes", truck: "DEF-9999", origin: "Los Baños, Laguna", destination: "Guadalupe Market, Makati", originCoords: { lat: 14.1667, lng: 121.2333 }, destCoords: { lat: 14.5547, lng: 121.0244 }, status: "Picked Up", eta: "4:00 PM today", progress: 30, volumeKg: 150 },
  { id: "DSP-104", crop: "Mais", emoji: "🌽", driver: "Mang Totoy Villanueva", truck: "GHI-3456", origin: "Cauayan, Isabela", destination: "Farmers Market, Cubao", originCoords: { lat: 16.9333, lng: 121.7667 }, destCoords: { lat: 14.6196, lng: 121.0571 }, status: "In Transit", eta: "6:00 PM today (delayed)", progress: 45, volumeKg: 800 },
  { id: "DSP-105", crop: "Ampalaya", emoji: "🥒", driver: "Ka Jun Mercado", truck: "JKL-7890", origin: "Lipa City, Batangas", destination: "Pasay Mega Market", originCoords: { lat: 13.9411, lng: 121.1631 }, destCoords: { lat: 14.5378, lng: 120.9933 }, status: "Harvest Ready", eta: "Pickup at 3:00 PM", progress: 0, volumeKg: 200 },
];

const ALERTS = [
  { id: 1, type: "WARNING", text: "Heavy rain on Route 4, Dispatch #104 delayed 2 hours", time: "1 hr ago" },
  { id: 2, type: "INFO", text: "Dispatch #102 arrived at Balintawak Market ahead of schedule", time: "2 hrs ago" },
  { id: 3, type: "URGENT", text: "Dispatch #106 truck breakdown near NLEX — rerouting", time: "30 mins ago" },
];

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

export default function LiveTrackingPage() {
  const [activeNav, setActiveNav] = useState('Live Tracking');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

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
    }
  }, []);

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Harvest Ready': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Picked Up': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Transit': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAlertColor = (type: string) => {
    switch(type) {
      case 'URGENT': return 'bg-rose-100/80 text-rose-700 border-rose-200/50 marker:bg-rose-500';
      case 'WARNING': return 'bg-amber-100/80 text-amber-700 border-amber-200/50 marker:bg-amber-500';
      case 'INFO': return 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50 marker:bg-emerald-500';
      default: return 'bg-slate-100 text-slate-700';
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
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Logistics Command</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-all duration-300"
                placeholder="Search dispatches, drivers..."
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
          <div className="max-w-[1600px] mx-auto space-y-8 flex flex-col min-h-full">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
              {[
                { label: 'Active Dispatches', value: '4', icon: <Truck className="w-5 h-5 text-emerald-600" /> },
                { label: 'Volume In Transit', value: '1,450 kg', icon: <Activity className="w-5 h-5 text-emerald-600" /> },
                { label: 'On-Time Rate', value: '87%', icon: <Clock className="w-5 h-5 text-emerald-600" /> },
                { label: 'Delivered Today', value: '1', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
              ].map((stat, i) => (
                <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200/60 transition-all duration-300 flex flex-col justify-between cursor-default">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-semibold text-slate-500 tracking-wide">{stat.label}</span>
                    <div className="bg-emerald-50/80 p-2.5 rounded-xl group-hover:bg-emerald-100/80 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-950 transition-colors">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Split View (70/30) */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
              
              {/* Left Column (70%) - Map */}
              <div className="flex-[7] bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm shrink-0 z-10 shadow-sm">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2.5">
                    <MapIcon className="w-5 h-5 text-emerald-600" />
                    Live Fleet Tracking
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100/50">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live Sync</span>
                  </div>
                </div>
                
                <div className="flex-1 relative overflow-hidden bg-slate-100">
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
                    <GoogleMap
                      defaultCenter={{ lat: 12.8797, lng: 121.7740 }}
                      defaultZoom={7}
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      mapId="DEMO_MAP_ID"
                      className="w-full h-full"
                    >
                      {DISPATCHES.map((dispatch) => (
                        <React.Fragment key={dispatch.id}>
                          <RouteLine origin={dispatch.originCoords} destination={dispatch.destCoords} />
                          
                          <AdvancedMarker 
                            position={dispatch.originCoords}
                            onClick={() => setSelectedMarker(dispatch.id)}
                          >
                            <Pin background={'#10b981'} glyphColor={'#fff'} borderColor={'#047857'} />
                          </AdvancedMarker>

                          <AdvancedMarker position={dispatch.destCoords}>
                            <Pin background={'#94a3b8'} glyphColor={'#fff'} borderColor={'#64748b'} scale={0.8} />
                          </AdvancedMarker>

                          {selectedMarker === dispatch.id && (
                            <InfoWindow 
                              position={dispatch.originCoords} 
                              onCloseClick={() => setSelectedMarker(null)}
                            >
                              <div className="min-w-[200px] p-1 font-sans">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                                  <span className="text-3xl bg-slate-50 p-2 rounded-lg border border-slate-100">{dispatch.emoji}</span>
                                  <div>
                                    <h4 className="font-bold text-base text-slate-900 mb-1">{dispatch.crop}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(dispatch.status)}`}>
                                      {dispatch.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2 text-xs text-slate-600">
                                  <p className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> <strong className="text-slate-800">{dispatch.driver}</strong></p>
                                  <p className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" /> {dispatch.truck}</p>
                                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> ETA: {dispatch.eta}</p>
                                </div>
                              </div>
                            </InfoWindow>
                          )}
                        </React.Fragment>
                      ))}
                    </GoogleMap>
                  </APIProvider>
                  
                </div>
              </div>

              {/* Right Column (30%) - Lists */}
              <div className="flex-[3] flex flex-col gap-6">
                
                {/* Active Dispatches */}
                <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col h-[400px]">
                  <div className="px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-sm shrink-0 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-emerald-600" />
                      Active Dispatches
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {DISPATCHES.map((dispatch) => (
                      <div key={dispatch.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-100 hover:shadow-sm transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-white shadow-sm rounded-lg p-2 border border-slate-100">{dispatch.emoji}</span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{dispatch.crop}</h4>
                              <p className="text-xs text-slate-400 font-medium">{dispatch.id}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(dispatch.status)}`}>
                            {dispatch.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {dispatch.driver} <span className="text-slate-400 font-normal">({dispatch.truck})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate max-w-[80px]" title={dispatch.origin}>{dispatch.origin.split(',')[0]}</span>
                              <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                              <span className="truncate max-w-[80px]" title={dispatch.destination}>{dispatch.destination.split(',')[0]}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ETA: <span className="font-semibold">{dispatch.eta}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${dispatch.progress === 100 ? 'bg-emerald-500' : dispatch.progress > 0 ? 'bg-amber-400' : 'bg-slate-300'}`} 
                            style={{ width: `${Math.max(dispatch.progress, 5)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Route Alerts */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500 overflow-hidden flex flex-col shrink-0">
                  <div className="px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-sm shrink-0 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Route Alerts
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {ALERTS.map((alert) => (
                      <div key={alert.id} className="p-3 rounded-xl border border-slate-100/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300 group flex flex-col gap-2 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${alert.type === 'URGENT' ? 'bg-rose-500' : alert.type === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getAlertColor(alert.type)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                            {alert.type}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                          {alert.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

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
