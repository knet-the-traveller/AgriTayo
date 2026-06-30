"use client";

import React, { useState, useEffect } from 'react';
import NotificationBell from '../../components/NotificationBell';
import { useRouter } from 'next/navigation';
import { 
  Leaf, LogOut, LayoutDashboard, Store, Map as MapIcon, BarChart3, Settings, User, 
  Menu, ChevronDown, Bell, Sprout, CheckCircle2, Loader2, AlertCircle, MapPin, ShoppingBag
, Truck, Package
, Inbox} from 'lucide-react';
import { getSession, logout, getRoleColor } from '@/lib/auth';

const EMOJI_LIST = ['🌾', '🍅', '🍠', '🥬', '🌽', '🥒', '🫘', '🌿', '🍌', '🧅', '🧄', '🥕', '🍆', '🫑', '🥦', '🍋', '🥭', '🍍'];

const CATEGORIES = ['Vegetable', 'Root Crop', 'Fruit', 'Grain', 'Herb', 'Other'];
const CERTIFICATIONS_LIST = ['Organic', 'Pesticide-Free', 'DA Certified', 'Fair Trade', 'Non-GMO', 'Naturally Grown'];

const getFairPriceFloor = (category: string) => {
  switch (category) {
    case 'Vegetable': return [28, 45];
    case 'Root Crop': return [18, 30];
    case 'Fruit': return [15, 25];
    case 'Grain': return [12, 20];
    case 'Herb': return [40, 60];
    default: return [20, 40]; // Other
  }
};


const EditListingForm = ({ listing, onSave, onCancel }: { listing: any, onSave: (updated: any) => void, onCancel: () => void }) => {
  const [cropName, setCropName] = useState(listing.crop || '');
  const [category, setCategory] = useState(listing.category || 'Vegetable');
  const [emoji, setEmoji] = useState(listing.emoji || '🌾');
  const [volume, setVolume] = useState(listing.volume?.toString() || '');
  const [price, setPrice] = useState(listing.price?.toString() || '');
  const [minOrder, setMinOrder] = useState(listing.minimumOrder?.toString() || '');
  const [harvestDate, setHarvestDate] = useState(listing.harvestDate || '');
  const [availableUntil, setAvailableUntil] = useState(listing.availableUntil || '');
  const [cooperative, setCooperative] = useState(listing.coop || '');
  const [municipality, setMunicipality] = useState(listing.location?.split(',')[0]?.trim() || '');
  const [province, setProvince] = useState(listing.location?.split(',')[1]?.trim() || '');
  const [pickupMethod, setPickupMethod] = useState(listing.pickupMethod || 'Farm pickup');
  const [notes, setNotes] = useState(listing.notes || '');
  const [certifications, setCertifications] = useState<string[]>(listing.certifications || []);
  const [contact, setContact] = useState(listing.contact || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!cropName.trim()) newErrors.cropName = 'Required';
    if (!volume || Number(volume) <= 0) newErrors.volume = 'Must be > 0';
    if (!price || Number(price) <= 0) newErrors.price = 'Must be > 0';
    if (!harvestDate) newErrors.harvestDate = 'Required';
    if (!municipality.trim()) newErrors.municipality = 'Required';
    if (!province.trim()) newErrors.province = 'Required';
    if (!contact.trim()) newErrors.contact = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    const isSoldOut = listing.volume <= 0 || listing.status === 'Sold Out';
    const newVolume = Number(volume);
    
    const updated = {
      ...listing,
      crop: cropName,
      category,
      emoji,
      volume: newVolume,
      price: Number(price),
      minimumOrder: minOrder ? Number(minOrder) : null,
      harvestDate,
      availableUntil: availableUntil || null,
      coop: cooperative,
      location: `${municipality}, ${province}`,
      pickupMethod,
      notes,
      certifications,
      contact,
      status: (isSoldOut && newVolume > 0) ? 'Active' : listing.status
    };
    onSave(updated);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-[#c6e9d4] shadow-md flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-[#e8f5ec] p-4 border-b border-[#c6e9d4] flex justify-between items-start">
        <div>
          <div className="text-[10px] font-bold text-[#1a5c2e] uppercase tracking-wider mb-1">Editing Listing: {listing.id}</div>
          <div className="text-xs text-slate-600 font-medium">Posted on: {formatDate(listing.postedAt)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {listing.volume <= 0 || listing.status === 'Sold Out' ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-600">Sold Out</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">Active</span>
          )}
        </div>
      </div>
      
      {(listing.volume <= 0 || listing.status === 'Sold Out') && (
        <div className="bg-amber-50 text-amber-800 text-xs font-bold p-3 border-b border-amber-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          This listing sold out. Increase volume to relist it as Active.
        </div>
      )}

      <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
            <input type="text" value={cropName} onChange={e => setCropName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a5c2e]" />
            {errors.cropName && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.cropName}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a5c2e]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Volume (kg)</label>
            <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a5c2e]" />
            {errors.volume && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.volume}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Price (₱/kg)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a5c2e]" />
            {errors.price && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Date</label>
            <input type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a5c2e]" />
            {errors.harvestDate && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.harvestDate}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact</label>
            <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a5c2e]" />
            {errors.contact && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.contact}</p>}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 text-sm transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} className="px-5 py-2 rounded-lg font-bold text-white bg-[#1a5c2e] hover:bg-emerald-800 shadow-sm text-sm transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default function PostHarvestPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('Post Harvest');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sellerPendingOrdersCount, setSellerPendingOrdersCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Form States
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState('Vegetable');
  const [emoji, setEmoji] = useState('🌾');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [minOrder, setMinOrder] = useState('');
  
  const [harvestDate, setHarvestDate] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  
  const [cooperative, setCooperative] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [province, setProvince] = useState('');
  const [pickupMethod, setPickupMethod] = useState('Farm pickup');
  
  const [notes, setNotes] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [contact, setContact] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPriceWarning, setShowPriceWarning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isAiPriceLoading, setIsAiPriceLoading] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState<any>(null);

  const fetchAiPriceSuggestion = async () => {
    if (isAiPriceLoading) return;
    if (!cropName || !category) {
      setErrors({ ...errors, price: 'Enter crop name and category first to get AI suggestion' });
      return;
    }
    
    setIsAiPriceLoading(true);
    setAiPriceSuggestion(null);
    try {
      const response = await fetch('/api/ai-price-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropName, category, province })
      });
      const data = await response.json();
      setAiPriceSuggestion(data);
    } catch (err) {
      setAiPriceSuggestion({
        minPrice: null,
        maxPrice: null,
        reasoning: "Unable to fetch AI suggestion right now. Use your own judgment or check the Market page for similar listings.",
        fallback: true
      });
    } finally {
      setIsAiPriceLoading(false);
    }
  };

  
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [availableDeliveriesCount, setAvailableDeliveriesCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);

  useEffect(() => {
    const user = getSession();
    if (!user || user.role !== 'seller') {
      window.location.href = '/';
    } else {
      setSession(user);
      setIsAuthLoading(false);

      const _allSellerOrders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const _pendingSellerOrders = _allSellerOrders.filter((o: any) => (o.sellerId === user.id || o.sellerName === user.name) && o.status === 'pending');
      setSellerPendingOrdersCount(_pendingSellerOrders.length);
      setCooperative(user.cooperative || '');
      setProvince(user.province || '');
      setContact(user.phone || '');
      loadActiveListings(user);
      
      const orders = JSON.parse(localStorage.getItem('agritayo_orders') || '[]');
      const pending = orders.filter((o: any) => o.buyerId === user.id && (o.status === 'pending' || o.status === 'confirmed'));
      setPendingOrdersCount(pending.length);
      const available = orders.filter((o: any) => o.status === 'pending' && !o.driverId);
      setAvailableDeliveriesCount(available.length);
      
      const activeForDriver = orders.filter((o: any) => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
      setActiveDeliveriesCount(activeForDriver.length);
    }
  }, []);

  const loadActiveListings = (user: any) => {
    const stored = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
    const myStored = stored.filter((l: any) => l.sellerId === user.id || l.sellerName === user.name);
    setActiveListings(myStored);
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

  const getUrgencyBadge = (dateStr: string) => {
    if (!dateStr) return { text: 'Fresh', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 2) return { text: 'Urgent', class: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Urgent — buyers will be alerted immediately' };
    if (diffDays <= 5) return { text: 'Soon', class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Soon — high visibility listing' };
    return { text: 'Fresh', class: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Fresh — scheduled listing' };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!cropName.trim()) newErrors.cropName = 'Crop name is required';
    if (!volume) newErrors.volume = 'Volume is required';
    if (!price) newErrors.price = 'Price is required';
    if (!harvestDate) newErrors.harvestDate = 'Harvest date is required';
    else {
      const selected = new Date(harvestDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected < today) newErrors.harvestDate = 'Harvest date cannot be in the past';
    }
    if (!municipality.trim()) newErrors.municipality = 'Municipality is required';
    if (!province.trim()) newErrors.province = 'Province is required';
    if (!contact.trim()) newErrors.contact = 'Contact number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitListing = () => {
    const newListing = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      sellerId: session.id,
      sellerName: session.name,
      farmer: session.name,
      cooperative: cooperative,
      coop: cooperative,
      crop: cropName,
      emoji: emoji,
      category: category,
      volume: Number(volume),
      price: Number(price),
      minimumOrder: minOrder ? Number(minOrder) : null,
      harvestDate: harvestDate,
      availableUntil: availableUntil || null,
      location: `${municipality}, ${province}`,
      pickupMethod: pickupMethod,
      notes: notes,
      certifications: certifications,
      contact: contact,
      status: "Active",
      postedAt: new Date().toISOString(),
      daysLeft: Math.ceil((new Date(harvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
    
    const storedListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
    storedListings.push(newListing);
    localStorage.setItem('agritayo_listings', JSON.stringify(storedListings));
    
    setIsSubmitted(true);
    loadActiveListings(session);
  };

  const handlePostMarket = () => {
    if (!validateForm()) return;
    
    const floor = getFairPriceFloor(category)[0];
    if (Number(price) < floor && !showPriceWarning) {
      setShowPriceWarning(true);
      return;
    }
    
    submitListing();
  };

  const updateListing = (updatedListing: any) => {
    const storedListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
    const newArray = storedListings.map((l: any) => l.id === updatedListing.id ? updatedListing : l);
    localStorage.setItem('agritayo_listings', JSON.stringify(newArray));
    setExpandedListingId(null);
    setToastMessage('Listing updated!');
    setTimeout(() => setToastMessage(''), 3000);
    loadActiveListings(session);
  };

  const removeListing = (id: string) => {
    const storedListings = JSON.parse(localStorage.getItem('agritayo_listings') || '[]');
    const filtered = storedListings.filter((l: any) => l.id !== id);
    localStorage.setItem('agritayo_listings', JSON.stringify(filtered));
    setToastMessage('Listing removed');
    setTimeout(() => setToastMessage(''), 3000);
    loadActiveListings(session);
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
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const urgencyInfo = getUrgencyBadge(harvestDate);

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
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Post Harvest</h2>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative z-0 scroll-smooth" id="main-scroll">
          
          <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post Your Harvest</h1>
              <p className="text-slate-500 mt-2 font-medium">List your produce directly on the AgriTayo market — no middlemen.</p>
              <div className="mt-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-xl shadow-sm text-sm font-semibold flex gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p>Your listing will be visible to all buyers and cooperatives on the Market page once submitted.</p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-[0_0_0_8px_rgba(16,185,129,0.1)]">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Your harvest is now live!</h2>
                <p className="text-slate-600 font-medium text-lg max-w-md">
                  {cropName} — {volume}kg @ ₱{price}/kg has been posted to the market.
                </p>
                <div className="flex items-center gap-4 mt-8">
                  <button onClick={() => router.push('/market')} className="bg-[#1a5c2e] hover:bg-emerald-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                    View on Market
                  </button>
                  <button onClick={() => {
                    setIsSubmitted(false);
                    setCropName(''); setVolume(''); setPrice('');
                  }} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl font-bold shadow-sm transition-all active:scale-95">
                    Post Another Harvest
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column - Form */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                      <h3 className="font-bold text-slate-800 text-lg">Harvest Details</h3>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-10">
                      
                      {/* Section 1 */}
                      <section>
                        <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-700 mb-4 border-b border-emerald-100 pb-2">Crop Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Crop Name *</label>
                            <input type="text" placeholder="e.g. Tomatoes, Kamote, Pechay" value={cropName} onChange={e => setCropName(e.target.value)} className={`w-full border ${errors.cropName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'} rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white transition-colors`} />
                            {errors.cropName && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.cropName}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Category *</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white transition-colors appearance-none">
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Crop Emoji</label>
                          <div className="flex flex-wrap gap-2">
                            {EMOJI_LIST.map(e => (
                              <button key={e} type="button" onClick={() => setEmoji(e)} className={`w-12 h-12 text-2xl flex items-center justify-center rounded-xl transition-all ${emoji === e ? 'bg-emerald-100 border-2 border-emerald-500 scale-110 shadow-sm z-10' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:scale-105'}`}>
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Section 2 */}
                      <section>
                        <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-700 mb-4 border-b border-emerald-100 pb-2">Quantity & Pricing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Volume Available *</label>
                            <div className="relative">
                              <input type="number" min="1" placeholder="e.g. 500" value={volume} onChange={e => setVolume(e.target.value)} className={`w-full border ${errors.volume ? 'border-rose-400' : 'border-slate-300'} rounded-xl pl-4 pr-12 py-3 text-sm outline-none bg-slate-50 focus:bg-white`} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
                            </div>
                            {errors.volume && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.volume}</p>}
                          </div>
                          <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-bold text-slate-700">Price per kg *</label>
                                <button 
                                  type="button"
                                  onClick={fetchAiPriceSuggestion}
                                  disabled={isAiPriceLoading}
                                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  {isAiPriceLoading ? 'Thinking...' : '✨ Get AI price suggestion'}
                                </button>
                              </div>
                              {aiPriceSuggestion && (
                                <div className="mb-3 p-3 bg-white border border-emerald-200 rounded-xl shadow-sm relative animate-in fade-in slide-in-from-top-2">
                                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-emerald-200 rotate-45"></div>
                                  <div className="relative z-10">
                                    {aiPriceSuggestion.minPrice && aiPriceSuggestion.maxPrice ? (
                                      <>
                                        <div className="text-sm font-bold text-emerald-800 mb-1">
                                          Suggested: ₱{aiPriceSuggestion.minPrice}–₱{aiPriceSuggestion.maxPrice}/kg
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">{aiPriceSuggestion.reasoning}</p>
                                        <div className="flex gap-2">
                                          <button type="button" onClick={() => setPrice(aiPriceSuggestion.minPrice.toString())} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-1.5 rounded-lg border border-emerald-200 transition-colors">Use ₱{aiPriceSuggestion.minPrice}</button>
                                          <button type="button" onClick={() => setPrice(aiPriceSuggestion.maxPrice.toString())} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-1.5 rounded-lg border border-emerald-200 transition-colors">Use ₱{aiPriceSuggestion.maxPrice}</button>
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-xs text-slate-600 leading-relaxed">{aiPriceSuggestion.reasoning}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₱</span>
                              <input type="number" min="1" placeholder="e.g. 35" value={price} onChange={e => setPrice(e.target.value)} className={`w-full border ${errors.price ? 'border-rose-400' : 'border-slate-300'} rounded-xl pl-8 pr-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white`} />
                            </div>
                            {errors.price && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.price}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Min Order (optional)</label>
                            <div className="relative">
                              <input type="number" min="1" placeholder="e.g. 50" value={minOrder} onChange={e => setMinOrder(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-3 text-sm outline-none bg-slate-50 focus:bg-white" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
                            </div>
                          </div>
                        </div>
                        
                      </section>

                      {/* Section 3 */}
                      <section>
                        <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-700 mb-4 border-b border-emerald-100 pb-2">Harvest Schedule</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Harvest Date *</label>
                            <input type="date" value={harvestDate} min={new Date().toISOString().split('T')[0]} onChange={e => setHarvestDate(e.target.value)} className={`w-full border ${errors.harvestDate ? 'border-rose-400' : 'border-slate-300'} rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white font-medium`} />
                            {errors.harvestDate && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.harvestDate}</p>}
                            {harvestDate && !errors.harvestDate && (
                              <p className={`text-xs font-bold mt-2 px-2 py-1 rounded w-fit ${urgencyInfo.class}`}>
                                {urgencyInfo.label}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-0.5">Available Until (optional)</label>
                            <p className="text-xs text-slate-500 mb-1.5">Last date buyers can place orders</p>
                            <input type="date" value={availableUntil} min={harvestDate || new Date().toISOString().split('T')[0]} onChange={e => setAvailableUntil(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white font-medium" />
                          </div>
                        </div>
                      </section>

                      {/* Section 4 */}
                      <section>
                        <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-700 mb-4 border-b border-emerald-100 pb-2">Location & Pickup</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Farm / Cooperative Name *</label>
                            <input type="text" placeholder="e.g. Nueva Ecija Farmers Coop" value={cooperative} onChange={e => setCooperative(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Municipality / City *</label>
                            <input type="text" placeholder="e.g. Cabanatuan City" value={municipality} onChange={e => setMunicipality(e.target.value)} className={`w-full border ${errors.municipality ? 'border-rose-400' : 'border-slate-300'} rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white`} />
                            {errors.municipality && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.municipality}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Province *</label>
                            <input type="text" placeholder="e.g. Nueva Ecija" value={province} onChange={e => setProvince(e.target.value)} className={`w-full border ${errors.province ? 'border-rose-400' : 'border-slate-300'} rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white`} />
                            {errors.province && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.province}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3">Pickup Method *</label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            {['Farm pickup', 'Delivery available', 'Both available'].map(m => (
                              <label key={m} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${pickupMethod === m ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <input 
                                  type="radio" 
                                  value={m}
                                  checked={pickupMethod === m}
                                  onChange={() => setPickupMethod(m)}
                                  className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${pickupMethod === m ? 'border-emerald-600' : 'border-slate-300'}`}>
                                  {pickupMethod === m && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{m}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </section>

                      {/* Section 5 */}
                      <section>
                        <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-700 mb-4 border-b border-emerald-100 pb-2">Additional Details</h4>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Description / Notes (optional)</label>
                            <textarea rows={3} maxLength={300} placeholder="e.g. Organically grown, no pesticides. Ready for bulk orders." value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white resize-none" />
                            <div className="text-right text-xs font-bold text-slate-400 mt-1">{notes.length}/300</div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Certifications (optional)</label>
                            <div className="flex flex-wrap gap-2">
                              {CERTIFICATIONS_LIST.map(cert => {
                                const isSelected = certifications.includes(cert);
                                return (
                                  <button
                                    key={cert} type="button"
                                    onClick={() => {
                                      if (isSelected) setCertifications(certifications.filter(c => c !== cert));
                                      else setCertifications([...certifications, cert]);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                  >
                                    {cert}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Contact Number for this listing *</label>
                            <input type="text" placeholder="09XX-XXX-XXXX" value={contact} onChange={e => setContact(e.target.value)} className={`w-full md:w-1/2 border ${errors.contact ? 'border-rose-400' : 'border-slate-300'} rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 focus:bg-white`} />
                            {errors.contact && <p className="text-rose-500 text-xs font-bold mt-1.5">{errors.contact}</p>}
                          </div>
                        </div>
                      </section>

                    </div>

                    {/* Form Actions */}
                    <div className="bg-slate-50 border-t border-slate-100 p-6 md:px-8">
                      {showPriceWarning && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-amber-900 mb-2">Your price is below the suggested fair floor. Are you sure?</p>
                            <div className="flex gap-3">
                              <button onClick={() => { setShowPriceWarning(false); submitListing(); }} className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg transition-colors">Yes, Confirm Price</button>
                              <button onClick={() => setShowPriceWarning(false)} className="text-xs font-bold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-lg transition-colors">Adjust Price</button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button 
                          onClick={() => {
                            const scrollable = document.getElementById('main-scroll');
                            scrollable?.scrollTo({ top: 0, behavior: 'smooth' });
                          }} 
                          className="w-full sm:w-auto flex-1 bg-white text-[#1a5c2e] hover:bg-emerald-50 border-2 border-[#1a5c2e] py-3.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"
                        >
                          Preview Listing
                        </button>
                        <button 
                          onClick={handlePostMarket}
                          className="w-full sm:w-auto flex-1 bg-[#1a5c2e] hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          Post to Market
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview & Listings */}
                <div className="lg:col-span-4 space-y-8">
                  
                  {/* Preview Card */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 ml-1">Listing preview</h3>
                    <div className="bg-slate-800 text-xs font-bold text-white text-center py-1.5 rounded-t-xl mx-2 shadow-sm relative z-10 -mb-1">
                      This is how buyers will see your listing
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden flex flex-col relative z-0">
                      
                      <div className="px-5 pt-5 flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-900 truncate pr-2">{cropName || <span className="text-slate-300">Your crop name</span>}</h3>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${urgencyInfo.class}`}>
                          {urgencyInfo.text}
                        </div>
                      </div>

                      <div className="py-6 flex justify-center items-center bg-gradient-to-b from-white to-slate-50/50">
                        <span className="text-6xl drop-shadow-sm">{emoji}</span>
                      </div>

                      <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <User className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{session?.name} {cooperative && <span className="text-slate-400 font-normal">({cooperative})</span>}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{municipality && province ? `${municipality}, ${province}` : <span className="text-slate-300">Location</span>}</span>
                        </div>

                        <div className="bg-emerald-50/50 rounded-xl p-3 mt-2 grid grid-cols-2 gap-2 border border-emerald-100/50">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Volume</p>
                            <p className="font-semibold text-slate-800">{volume ? `${volume} kg` : '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                            <p className="font-semibold text-slate-800 truncate">{category}</p>
                          </div>
                        </div>
                        
                        {certifications.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {certifications.map(c => <span key={c} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{c}</span>)}
                          </div>
                        )}

                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Price / kg</p>
                            <p className="text-xl font-black text-emerald-700">₱{price || '0'}</p>
                          </div>
                          <button className="bg-emerald-600/50 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed">
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Listings */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-4">Your active listings</h3>
                    {activeListings.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-8 flex flex-col items-center text-center text-slate-500">
                        <Sprout className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-sm font-medium">You haven't posted any harvests yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeListings.map(listing => {
                          const isSoldOut = listing.volume <= 0 || listing.status === 'Sold Out';
                          const isExpanded = expandedListingId === listing.id;

                          if (isExpanded) {
                            return <EditListingForm key={listing.id} listing={listing} onSave={updateListing} onCancel={() => setExpandedListingId(null)} />;
                          }

                          return (
                          <div key={listing.id} onClick={() => setExpandedListingId(listing.id)} className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3 group cursor-pointer transition-all ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : 'hover:border-emerald-300 hover:shadow-md'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{listing.emoji}</span>
                                <div>
                                  <h4 className="font-bold text-slate-900 leading-tight">{listing.crop}</h4>
                                  <p className="text-xs font-semibold text-slate-500">{isSoldOut ? 0 : listing.volume}kg @ ₱{listing.price}/kg</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSoldOut ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-500">Sold Out</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700">Active</span>
                                )}
                                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="text-xs font-medium text-slate-500">
                                Harvest: <span className="font-bold text-slate-700">{listing.harvestDate}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); removeListing(listing.id); }} className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline">
                                Remove
                              </button>
                            </div>
                          </div>
                        )})}
                      </div>
                    )}
                  </div>

                </div>
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
