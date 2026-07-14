'use client';

import { useActionState, useState } from 'react';
import { loginAdmin } from '../actions';
import AppLogo from '@/components/ui/AppLogo';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const initialState = {
  error: ''
};

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <AppLogo src="/AstroParihar_Logo.png" size={60} />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Admin Panel</h2>
          <p className="text-center text-slate-500 mb-8 text-sm">Sign in to manage AstroParihar</p>
          
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {state.error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  required 
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900 bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required 
                  className="pl-10 pr-10 w-full rounded-xl border border-slate-200 py-2.5 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-slate-900 bg-white"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full mt-6 py-2.5 rounded-xl gold-gradient-bg text-white font-semibold hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4" />}
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">Secure access restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
}
