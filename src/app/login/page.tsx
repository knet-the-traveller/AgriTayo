"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, EyeOff, Tractor, Store, Truck, Check , User
} from 'lucide-react';
import { login, getUsers, saveUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Sign In State
  const [signInData, setSignInData] = useState({ username: '', password: '' });
  
  // Sign Up State
  const [signUpRole, setSignUpRole] = useState<'seller' | 'buyer' | 'driver' | null>(null);
  const [signUpData, setSignUpData] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '', phone: '', province: '',
    cooperative: '', plateNumber: ''
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!signInData.username || !signInData.password) {
      setError('Both fields are required');
      return;
    }

    if (signInData.username === 'admin' && signInData.password === 'admin123') {
      login({
        id: 'admin_001',
        name: 'Mark Baguisi',
        email: 'admin@agritayo.ph',
        role: 'superadmin',
        username: 'admin'
      });
      router.push('/');
      return;
    }

    const users = getUsers();
    const user = users.find((u: any) => 
      (u.username === signInData.username || u.email === signInData.username) && 
      u.password === signInData.password
    );

    if (user) {
      login(user);
      router.push('/');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signUpRole) {
      setError('Please select a role first');
      return;
    }
    
    if (!signUpData.name || !signUpData.email || !signUpData.username || !signUpData.password || !signUpData.phone || !signUpData.province) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (signUpRole === 'seller' && !signUpData.cooperative) {
      setError('Cooperative / Farm Name is required for Sellers');
      return;
    }
    if (signUpRole === 'driver' && !signUpData.plateNumber) {
      setError('Truck Plate Number is required for Drivers');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const users = getUsers();
    if (users.find((u: any) => u.username === signUpData.username)) {
      setError('Username already exists');
      return;
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      role: signUpRole,
      name: signUpData.name,
      email: signUpData.email,
      username: signUpData.username,
      password: signUpData.password,
      phone: signUpData.phone,
      province: signUpData.province,
      ...(signUpRole === 'seller' && { cooperative: signUpData.cooperative }),
      ...(signUpRole === 'driver' && { plateNumber: signUpData.plateNumber }),
    };

    saveUser(newUser);
    login(newUser);
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Left Decorative Panel (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#1a5c2e] flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-md text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl">
              <Leaf className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Agri Tayo</h1>
          </div>
          <h2 className="text-3xl font-bold mb-8 leading-tight text-emerald-50">Agreement in Action,<br/>Agriculture for All</h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-emerald-100/90 font-medium text-lg">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-300">
                <Check className="w-5 h-5" />
              </div>
              Connect directly with farmers
            </div>
            <div className="flex items-center gap-4 text-emerald-100/90 font-medium text-lg">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-300">
                <Check className="w-5 h-5" />
              </div>
              Zero middlemen, fair prices
            </div>
            <div className="flex items-center gap-4 text-emerald-100/90 font-medium text-lg">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-300">
                <Check className="w-5 h-5" />
              </div>
              Real-time harvest tracking
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 my-auto">
          
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="bg-[#1a5c2e] p-2 rounded-xl">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Agri Tayo</h1>
          </div>

          <div className="flex w-full mb-8 border-b border-slate-200">
            <button 
              className={`flex-1 pb-4 text-center font-bold text-sm transition-colors relative ${activeTab === 'signin' ? 'text-[#1a5c2e]' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => { setActiveTab('signin'); setError(''); }}
            >
              Sign In
              {activeTab === 'signin' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a5c2e] rounded-t-full"></span>}
            </button>
            <button 
              className={`flex-1 pb-4 text-center font-bold text-sm transition-colors relative ${activeTab === 'signup' ? 'text-[#1a5c2e]' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => { setActiveTab('signup'); setError(''); }}
            >
              Sign Up
              {activeTab === 'signup' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a5c2e] rounded-t-full"></span>}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold rounded-xl flex items-center justify-center">
              {error}
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Username or Email</label>
                <input 
                  type="text" 
                  value={signInData.username}
                  onChange={e => setSignInData({...signInData, username: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" 
                  placeholder="Enter your username" 
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={signInData.password}
                  onChange={e => setSignInData({...signInData, password: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button type="submit" className="w-full bg-[#1a5c2e] hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-200 mt-2 hover:-translate-y-0.5">
                Sign In
              </button>
              <div className="text-center mt-6">
                <button type="button" onClick={() => { setActiveTab('signup'); setError(''); }} className="text-sm font-bold text-slate-500 hover:text-[#1a5c2e] transition-colors">
                  Don't have an account? Sign up here
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3 text-center">Select your role to continue</label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => setSignUpRole('seller')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${signUpRole === 'seller' ? 'border-[#1a5c2e] bg-emerald-50 text-[#1a5c2e]' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <Tractor className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">Farmer</span>
                  </button>
                  <button type="button" onClick={() => setSignUpRole('buyer')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${signUpRole === 'buyer' ? 'border-[#1a5c2e] bg-emerald-50 text-[#1a5c2e]' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <Store className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">Buyer</span>
                  </button>
                  <button type="button" onClick={() => setSignUpRole('driver')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${signUpRole === 'driver' ? 'border-[#1a5c2e] bg-emerald-50 text-[#1a5c2e]' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <Truck className="w-6 h-6 mb-1.5" />
                    <span className="text-xs font-bold">Driver</span>
                  </button>
                </div>
              </div>

              {signUpRole && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input type="text" value={signUpData.name} onChange={e => setSignUpData({...signUpData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input type="email" value={signUpData.email} onChange={e => setSignUpData({...signUpData, email: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                    <input type="text" value={signUpData.username} onChange={e => setSignUpData({...signUpData, username: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input type="text" value={signUpData.phone} onChange={e => setSignUpData({...signUpData, phone: e.target.value})} placeholder="09XX-XXX-XXXX" className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Province</label>
                      <input type="text" value={signUpData.province} onChange={e => setSignUpData({...signUpData, province: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    </div>
                  </div>

                  {signUpRole === 'seller' && (
                    <div className="animate-in fade-in zoom-in-95">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cooperative / Farm Name</label>
                      <input type="text" value={signUpData.cooperative} onChange={e => setSignUpData({...signUpData, cooperative: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    </div>
                  )}

                  {signUpRole === 'driver' && (
                    <div className="animate-in fade-in zoom-in-95">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Truck Plate Number</label>
                      <input type="text" value={signUpData.plateNumber} onChange={e => setSignUpData({...signUpData, plateNumber: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input type={showPassword ? "text" : "password"} value={signUpData.password} onChange={e => setSignUpData({...signUpData, password: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-7 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                    <input type={showConfirmPassword ? "text" : "password"} value={signUpData.confirmPassword} onChange={e => setSignUpData({...signUpData, confirmPassword: e.target.value})} className="w-full border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-7 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button type="submit" className="w-full bg-[#1a5c2e] hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-md transition-all duration-200 mt-4 hover:-translate-y-0.5">
                    Create Account
                  </button>
                </div>
              )}
              
              <div className="text-center mt-6">
                <button type="button" onClick={() => { setActiveTab('signin'); setError(''); }} className="text-sm font-bold text-slate-500 hover:text-[#1a5c2e] transition-colors">
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
