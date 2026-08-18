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
  const { formatPrice } = useCurrency();

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
        className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 focus:outline-none"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200">
          <UserIcon size={16} className="text-slate-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700 pr-2 hidden sm:block">My Profile</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden"
          >
            {/* User Profile Header */}
            <div className="p-5 flex items-center gap-4 border-b border-gray-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <UserIcon size={24} className="text-slate-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-lg font-bold text-gray-800 truncate">{fullName}</h3>
                {phoneNumber ? (
                  <p className="text-sm font-medium text-gray-500 truncate">{phoneNumber}</p>
                ) : (
                  <p className="text-sm font-medium text-gray-400 truncate">
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
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                Notification
              </Link>
              <Link
                href="/wallet"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors flex justify-between items-center"
              >
                <span>Wallet Transactions</span>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-end">
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Wallet Balance</span>
                  <span className="font-bold text-black">{formatPrice(walletBalance)}</span>
                </div>
              </Link>
              <Link
                href="/order-history"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                Order History
              </Link>
              <Link
                href="/my-reports"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                My Reports
              </Link>
              <Link
                href="/customer-support"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                Customer Support Chat
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h3>
                <p className="text-gray-500 text-sm">Are you sure you want to sign out of your account?</p>
              </div>
              <div className="flex border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <div className="w-px bg-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex-1 py-4 text-red-600 font-bold hover:bg-red-50 transition-colors"
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
