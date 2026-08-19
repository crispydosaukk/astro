'use client';

import { useActionState, useState } from 'react';
import { loginAdmin } from '../actions';
import AppLogo from '@/components/ui/AppLogo';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const initialState = {
  error: '',
};

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFDFC] rounded-3xl shadow-2xl overflow-hidden border border-[#E5D9C8]">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <div className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] shadow-sm mb-4">
              <AppLogo src="/AstroParihar_Logo.png" size={54} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full inline-flex items-center gap-1 mb-2">
              <ShieldCheck size={13} /> Administrative Portal
            </span>
            <h2 className="text-2xl font-bold text-[#292522]">Admin Sign In</h2>
            <p className="text-[#6B5E55] text-xs sm:text-sm mt-1">Sign in to manage AstroParihar operations</p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm text-center border border-red-200 font-medium">
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-[#292522] block">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B5E55]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="pl-10 w-full rounded-xl border border-[#E5D9C8] px-4 py-3 focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none transition-all text-[#292522] bg-[#FFFDFC] text-sm shadow-sm"
                  placeholder="admin@astroparihar.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-[#292522] block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B5E55]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className="pl-10 pr-10 w-full rounded-xl border border-[#E5D9C8] py-3 focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none transition-all text-[#292522] bg-[#FFFDFC] text-sm shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B5E55] hover:text-[#292522] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-6 py-3.5 rounded-xl gold-gradient-bg text-white font-bold hover:opacity-95 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4" />}
              {isPending ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>
        </div>
        <div className="bg-[#F8F3EA] px-8 py-4 border-t border-[#E5D9C8] text-center">
          <p className="text-xs text-[#6B5E55]">
            Secure restricted access for authorized AstroParihar personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
