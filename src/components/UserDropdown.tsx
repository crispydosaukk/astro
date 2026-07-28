'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { auth } from '@/lib/firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, userData, loading } = useUserData();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
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

  useEffect(() => {
    if (user || userData) {
      fetch('/api/debug-user', {
        method: 'POST',
        body: JSON.stringify({ uid: user?.uid, email: user?.email, userData, authPhone: user?.phoneNumber })
      }).catch(e => console.error(e));
    }
  }, [user, userData]);

  const fullName = loading ? 'Loading...' : (userData?.name || user?.displayName || user?.email?.split('@')[0] || 'User');
  const phoneNumber = loading ? '...' : (user?.phoneNumber || userData?.phone || userData?.phoneNumber || '');
  const walletBalance = userData?.walletBalance || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors focus:outline-none"
      >
        <UserIcon size={20} className="text-slate-600" />
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
            <div className="pt-6 pb-4 flex flex-col items-center border-b border-dashed border-gray-300">
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-3 overflow-hidden">
                <UserIcon size={64} className="text-gray-400 mt-4" />
              </div>
              <h3 className="text-xl font-bold text-[#3b5998]">{fullName}</h3>
              {phoneNumber ? (
                <p className="text-base font-semibold text-gray-600 mt-1">{phoneNumber}</p>
              ) : (
                <p className="text-base font-semibold text-gray-400 mt-1">{loading ? 'Loading...' : 'No Phone Added'}</p>
              )}
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
                <span className="font-bold text-black">₹ {walletBalance}</span>
              </Link>
              <Link 
                href="/order-history" 
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                Order History
              </Link>
              <Link 
                href="/customer-support" 
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                Customer Support Chat
              </Link>
              
              <button 
                onClick={handleLogout}
                className="px-6 py-3 text-[17px] text-gray-700 hover:bg-slate-50 transition-colors text-left"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
