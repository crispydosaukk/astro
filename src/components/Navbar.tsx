'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Compass,
  Calendar,
  Sun,
  HeartHandshake,
  BookOpen,
  ShieldCheck,
  Flame,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import UserDropdown from './UserDropdown';

const servicesList = [
  {
    category: 'Free Services & Tools',
    items: [
      {
        label: 'Free Janam Kundli',
        desc: 'Personalized Vedic birth chart & life predictions',
        icon: Sparkles,
        badge: 'Free',
        href: '/services/free-horoscope',
      },
      {
        label: 'Free Kundli Matching',
        desc: 'Vedic Gun Milan & marital compatibility check',
        icon: Compass,
        badge: 'Free',
        href: '/services/free-kundli-matching',
      },
      {
        label: 'Free Panchang',
        desc: 'Tithi, Nakshatra, Yoga & Shubh Muhurat',
        icon: Calendar,
        badge: 'Free',
        href: '/services/free-panchang',
      },
      {
        label: 'Free Daily Horoscope',
        desc: 'Daily zodiac forecasts & lucky guidance',
        icon: Sun,
        badge: 'Free',
        href: '/services/free-daily-horoscope',
      },
      {
        label: 'Free Meditation guide',
        desc: 'Mindfulness, mantras & spiritual alignment',
        icon: HeartHandshake,
        badge: 'Free',
        href: '/services/free-meditation-guide',
      },
      {
        label: 'Free Fasting Planner',
        desc: 'Sacred Vrat schedules, rules & rituals',
        icon: BookOpen,
        badge: 'Free',
        href: '/services/free-fasting-planner',
      },
    ],
  },
  {
    category: 'Mahadasha Guides',
    items: [
      {
        label: 'Rahu Mahadasha Stabilisation Guide (PDF) - ₹499',
        desc: 'Harmonize intense Rahu transit & remedies',
        icon: ShieldCheck,
        badge: '₹499',
        href: '/services/rahu-mahadasha-stabilisation-guide',
      },
      {
        label: 'Rahu Mahadasha Survival Guide (PDF) - ₹999',
        desc: 'Tactical survival & protective mantras',
        icon: Flame,
        badge: '₹999',
        href: '/services/rahu-mahadasha-survival-guide',
      },
      {
        label: 'Sani Mahadasha Stabilisation Guide (PDF) - ₹499',
        desc: 'Saturn discipline, endurance & remedies',
        icon: ShieldCheck,
        badge: '₹499',
        href: '/services/sani-mahadasha-stabilisation-guide',
      },
      {
        label: 'Sani Mahadasha Survival Guide (PDF) - ₹999',
        desc: 'Navigating Saturn trials & karmic phase',
        icon: Zap,
        badge: '₹999',
        href: '/services/sani-mahadasha-survival-guide',
      },
    ],
  },
];

const panchangItems = [
  { label: 'Today Panchang', href: '/panchang/today-panchang' },
  { label: 'Rahu Kaal', href: '/panchang/rahu-kaal' },
  { label: 'Choghadiya', href: '/panchang/choghadiya' },
  { label: 'Tithi', href: '/panchang/tithi' },
  { label: 'Vaar', href: '/panchang/vaar' },
  { label: 'Hora', href: '/panchang/hora' },
  { label: 'Karana', href: '/panchang/karana' },
  { label: 'Tomorrow Panchang', href: '/panchang/tomorrow-panchang' },
  { label: 'Shubh Muhurat', href: '/panchang/shubh-muhurat' },
];

const standardNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Talk to Astrologer', href: '/talk-to-astrologer' },
  { label: 'Remedies', href: '/remedies' },
  { label: 'Astrologer Login', href: '/astrologer-login' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPanchangOpen, setIsPanchangOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 150);
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
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-accent hover:bg-accent/10 ${pathname === '/' ? 'text-accent bg-accent/10' : 'text-slate-700'}`}
              >
                Home
              </Link>

              {/* Services Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-accent hover:bg-accent/10 ${
                    isServicesOpen ? 'text-accent bg-accent/10' : 'text-slate-700'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-accent' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-0 top-full pt-2 w-[640px] z-50"
                    >
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 grid grid-cols-2 gap-5 backdrop-blur-xl bg-white/95">
                        {servicesList.map((group) => (
                          <div key={group.category} className="space-y-2">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                              <span>{group.category}</span>
                              <span className="h-px bg-slate-100 flex-1 ml-2" />
                            </div>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsServicesOpen(false)}
                                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-amber-50/80 transition-all group/item border border-transparent hover:border-amber-200/50"
                                  >
                                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover/item:bg-amber-500 group-hover/item:text-white transition-colors mt-0.5 shrink-0">
                                      <IconComponent size={15} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-semibold text-slate-800 group-hover/item:text-amber-700 transition-colors truncate">
                                          {item.label}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                            item.badge === 'Free'
                                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                              : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                                          }`}
                                        >
                                          {item.badge}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Panchang Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsPanchangOpen(true)}
                onMouseLeave={() => setIsPanchangOpen(false)}
              >
                <button
                  onClick={() => setIsPanchangOpen(!isPanchangOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-accent hover:bg-accent/10 ${
                    isPanchangOpen || pathname.includes('/panchang') ? 'text-accent bg-accent/10' : 'text-slate-700'
                  }`}
                >
                  <span>Panchang</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isPanchangOpen ? 'rotate-180 text-accent' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isPanchangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-0 top-full pt-2 w-56 z-50"
                    >
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 space-y-0.5">
                        {panchangItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsPanchangOpen(false)}
                            className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {standardNavLinks
                .filter((link) => link.href !== '/')
                .map((link) => (
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
              className="lg:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              <div className="px-6 py-4 space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent/10 hover:text-accent text-slate-700 transition-all"
                >
                  Home
                </Link>

                {/* Mobile Services Accordion */}
                <div>
                  <button
                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent/10 hover:text-accent text-slate-700 transition-all"
                  >
                    <span>Services</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180 text-accent' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-3 pr-2 py-1 space-y-3 bg-slate-50/70 rounded-xl my-1 border border-slate-100"
                      >
                        {servicesList.map((group) => (
                          <div key={`mobile-${group.category}`} className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                              {group.category}
                            </div>
                            {group.items.map((item) => {
                              const IconComp = item.icon;
                              return (
                                <Link
                                  key={`mobile-${item.label}`}
                                  href={item.href}
                                  onClick={() => {
                                    setIsServicesOpen(false);
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/70 hover:text-amber-900 transition-all"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <IconComp size={14} className="text-amber-600 shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${
                                      item.badge === 'Free'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {standardNavLinks
                  .filter((link) => link.href !== '/')
                  .map((link) => (
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
                        onClick={() => setIsOpen(false)}
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
