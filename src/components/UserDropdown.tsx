'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { auth } from '@/lib/firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/lib/CurrencyContext';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, userData, loading } = useUserData();
  const router = useRouter();
  const { formatPrice, currencyCode, setCurrencyCode } = useCurrency();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      setIsOpen(false);
      setShowLogoutConfirm(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fullName = userData?.name || user?.displayName || user?.email?.split('@')[0] || (loading ? 'Loading...' : 'User');
  const phoneNumber = user?.phoneNumber || userData?.phone || userData?.phoneNumber || (loading ? '...' : '');
  const walletBalance = userData?.walletBalance || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#EDE4D5] hover:bg-[#EDE4D5]/80 transition-colors border border-[#E5D9C8] focus:outline-none shadow-sm"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFFDFC] text-[#713B32]">
          <UserIcon size={16} />
        </div>
        <span className="text-sm font-bold text-[#292522] pr-2 hidden sm:block">My Profile</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-[#FFFDFC] rounded-2xl shadow-2xl border border-[#E5D9C8] z-50 overflow-hidden"
          >
            {/* User Profile Header */}
            <div className="p-5 flex items-center gap-4 border-b border-[#E5D9C8] bg-[#F8F3EA]">
              <div className="w-12 h-12 rounded-full bg-[#EDE4D5] flex items-center justify-center flex-shrink-0 text-[#713B32]">
                <UserIcon size={22} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-base font-bold text-[#292522] truncate">{fullName}</h3>
                {phoneNumber ? (
                  <p className="text-xs font-medium text-[#6B5E55] truncate">{phoneNumber}</p>
                ) : (
                  <p className="text-xs font-medium text-[#6B5E55] truncate">
                    {loading ? 'Loading...' : 'No Phone Added'}
                  </p>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2 flex flex-col">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#292522] hover:bg-[#F8F3EA] hover:text-[#713B32] transition-colors text-left"
              >
                Notification
              </Link>
              <Link
                href="/wallet"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#292522] hover:bg-[#F8F3EA] hover:text-[#713B32] transition-colors flex justify-between items-center"
              >
                <span>Wallet Transactions</span>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col items-end">
                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Balance</span>
                  <span className="font-bold text-xs text-[#292522]">{formatPrice(walletBalance)}</span>
                </div>
              </Link>
              <Link
                href="/order-history"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#292522] hover:bg-[#F8F3EA] hover:text-[#713B32] transition-colors text-left"
              >
                Order History
              </Link>
              <Link
                href="/my-reports"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#292522] hover:bg-[#F8F3EA] hover:text-[#713B32] transition-colors text-left"
              >
                My Reports
              </Link>
              <Link
                href="/customer-support"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#292522] hover:bg-[#F8F3EA] hover:text-[#713B32] transition-colors text-left"
              >
                Customer Support Chat
              </Link>

              {/* Currency Selector */}
              <div className="px-5 py-2.5 flex items-center justify-between border-t border-b border-[#E5D9C8] bg-[#F8F3EA]">
                <span className="text-xs font-semibold text-[#6B5E55]">Currency</span>
                <div className="flex items-center gap-1 bg-[#FFFDFC] p-1 rounded-lg border border-[#E5D9C8] shadow-sm">
                  <button
                    onClick={() => setCurrencyCode('INR')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                      currencyCode === 'INR'
                        ? 'bg-[#713B32] text-white'
                        : 'text-[#6B5E55] hover:text-[#292522]'
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    onClick={() => setCurrencyCode('USD')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                      currencyCode === 'USD'
                        ? 'bg-[#713B32] text-white'
                        : 'text-[#6B5E55] hover:text-[#292522]'
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#292522] mb-1">Sign Out</h3>
                <p className="text-[#6B5E55] text-sm">Are you sure you want to sign out of your account?</p>
              </div>
              <div className="flex border-t border-[#E5D9C8] bg-[#F8F3EA]">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3.5 text-[#292522] font-semibold hover:bg-[#EDE4D5] transition-colors text-sm"
                >
                  Cancel
                </button>
                <div className="w-px bg-[#E5D9C8]" />
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3.5 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
                >
                  Yes, Sign out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
