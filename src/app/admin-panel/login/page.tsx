'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { loginAdmin } from '../actions';
import AppLogo from '@/components/ui/AppLogo';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';

const initialState = {
  error: '',
};

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522] flex items-center justify-center p-4 relative">
      {/* Back to Home Floating Navigation Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDFC]/95 backdrop-blur-md border border-[#E5D9C8] text-xs sm:text-sm font-bold text-[#713B32] hover:bg-[#EDE4D5] hover:text-[#552B24] transition-all shadow-md group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform text-[#B88A44]"
        />
        <span>Back to Home</span>
      </Link>

      <div className="max-w-md w-full bg-[#FFFDFC] rounded-3xl shadow-2xl overflow-hidden border border-[#E5D9C8] mt-12 sm:mt-0">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                <AppLogo src="/astrologo.png" size={85} />
              </Link>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#713B32] bg-[#EDE4D5] px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 border border-[#E5D9C8]">
              <ShieldCheck size={13} className="text-[#B88A44]" /> Administrative Portal
            </span>
            <h2 className="text-2xl font-bold text-[#292522]">Admin Sign In</h2>
            <p className="text-[#6B5E55] text-xs sm:text-sm mt-1">
              Sign in to manage AstroParihar operations
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="bg-rose-50 text-[#713B32] p-3.5 rounded-xl text-xs sm:text-sm text-center border border-rose-200 font-medium">
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
              className="w-full mt-6 py-3.5 rounded-xl gold-gradient-bg text-[#292522] font-extrabold hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4 text-[#292522]" />}
              <span>{isPending ? 'Authenticating...' : 'Sign In as Administrator'}</span>
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
