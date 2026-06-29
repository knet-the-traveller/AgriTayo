"use client";

import React, { useState } from 'react';
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
  LineChart
} from 'lucide-react';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

import { METRICS, AI_LIVE_FEED, ANALYTICS_DATA } from '../data/mockData';

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard Overview', icon: LayoutDashboard },
    { name: 'Live Tracking', icon: MapIcon },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'System Settings', icon: Settings },
  ];

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

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
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
                  <span className="relative z-10 whitespace-nowrap">{item.name}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 flex flex-col gap-2">
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${isSidebarCollapsed ? '' : 'hidden'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button className={`w-full flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white p-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0 ${isSidebarCollapsed ? 'px-0' : 'gap-2 px-4'}`}>
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap">New Incident</span>}
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

            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
                src="https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff"
                alt="User avatar"
              />
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-700 leading-tight">Mark Baguisi</span>
                <span className="text-[11px] font-medium text-slate-500">Superadmin</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
            </button>
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
                {METRICS.map((metric) => (
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
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className={`
                          ${metric.trend === 'up' || metric.trend === 'down' ? 'text-emerald-600' : 'text-slate-500'}
                        `}>
                          {metric.trendValue}
                        </span>
                      </div>
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
                  <APIProvider apiKey="YOUR_GOOGLE_MAPS_API_KEY">
                    <GoogleMap
                      defaultCenter={{ lat: 14.5995, lng: 120.9842 }} // Default to Manila
                      defaultZoom={11}
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      mapId="DEMO_MAP_ID"
                      className="w-full h-full"
                    />
                  </APIProvider>
                  
                  {/* Fallback Overlay to instruct user if map fails or key is missing */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/50 shadow-lg text-center flex flex-col items-center">
                      <MapIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Google Map Loaded</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[250px]">Replace 'YOUR_GOOGLE_MAPS_API_KEY' in the codebase to fully activate mapping features.</p>
                    </div>
                  </div>
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
                  {AI_LIVE_FEED.map((item) => (
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

            {/* Bottom Section - Analytics & Trends */}
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
