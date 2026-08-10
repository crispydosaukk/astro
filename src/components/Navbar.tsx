'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import UserDropdown from './UserDropdown';
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Talk to Astrologer', href: '/talk-to-astrologer' },
  { label: 'Remedies', href: '/remedies' },
  { label: 'Admin', href: '/admin-panel' },
  { label: 'Astrologer Login', href: '/astrologer-login' },
  { label: 'Astrologer Registration', href: '/astrologer-login?mode=signup' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check for active consultations as a customer
        const q = query(
          collection(db, 'consultations'),
          where('customerId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            setActiveCall({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
          } else {
            setActiveCall(null);
          }
        });
      } else {
        setActiveCall(null);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement?.classList?.toggle('dark');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-lg' : ''}`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <AppLogo src="/AstroParihar_Logo.png" size={40} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks?.map((link) => (
                <Link
                  key={`nav-${link?.label}`}
                  href={link?.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-accent hover:bg-accent/10 ${pathname === link?.href ? 'text-accent bg-accent/10' : 'text-slate-700'}`}
                >
                  {link?.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <UserDropdown />
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up-login-screen"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-accent/50 hover:text-accent transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-800 transition-all"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Call Banner */}
        {activeCall && !pathname.includes('/call/') && (
          <div className="bg-[#C9952B] text-white px-6 py-2.5 flex items-center justify-between text-sm shadow-md animate-pulse border-t border-[#C9952B]/30">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-ping" />
              You have an active ongoing {activeCall.type || 'video'} call!
            </div>
            <Link 
              href={`/call/${activeCall.roomID}`}
              className="px-4 py-1.5 bg-white text-[#C9952B] rounded-lg font-bold text-xs hover:bg-white/90 transition-colors shadow-sm"
            >
              Rejoin Call
            </Link>
          </div>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full"
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks?.map((link) => (
                  <Link
                    key={`mobile-nav-${link?.label}`}
                    href={link?.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent/10 hover:text-accent text-slate-700 transition-all"
                  >
                    {link?.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-slate-100 flex gap-3">
                  {user ? null : (
                    <>
                      <Link
                        href="/sign-up-login-screen"
                        className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-accent/50 transition-all"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
