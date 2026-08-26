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
import { useCurrency } from '@/lib/CurrencyContext';

const servicesList = [
  {
    category: 'Free Services & Tools',
    items: [
      {
        label: 'Janam Kundli',
        desc: 'Personalized Vedic birth chart & life predictions',
        icon: Sparkles,
        badge: 'Free',
        href: '/services/janam-kundli',
      },
      {
        label: 'Kundli Matching',
        desc: 'Vedic Gun Milan & marital compatibility check',
        icon: Compass,
        badge: 'Free',
        href: '/services/kundli-matching',
      },
      {
        label: 'Panchang',
        desc: 'Tithi, Nakshatra, Yoga & Shubh Muhurat',
        icon: Calendar,
        badge: 'Free',
        href: '/services/panchang',
      },
      {
        label: 'Daily Horoscope',
        desc: 'Daily zodiac forecasts & lucky guidance',
        icon: Sun,
        badge: 'Free',
        href: '/services/daily-horoscope',
      },
      {
        label: 'Meditation Guide',
        desc: 'Mindfulness, mantras & spiritual alignment',
        icon: HeartHandshake,
        badge: 'Free',
        href: '/services/meditation-guide',
      },
      {
        label: 'Fasting Planner',
        desc: 'Sacred Vrat schedules, rules & rituals',
        icon: BookOpen,
        badge: 'Free',
        href: '/services/fasting-planner',
      },
    ],
  },
  {
    category: 'Mahadasha Guides',
    items: [
      {
        label: 'Rahu Mahadasha Stabilisation Guide',
        desc: 'Harmonize intense Rahu transit & remedies',
        icon: ShieldCheck,
        badge: '₹499',
        priceINR: 499,
        priceUSD: 19,
        href: '/services/rahu-mahadasha-stabilisation-guide',
      },
      {
        label: 'Rahu Mahadasha Survival Guide',
        desc: 'Tactical survival & protective mantras',
        icon: Flame,
        badge: '₹999',
        priceINR: 999,
        priceUSD: 29,
        href: '/services/rahu-mahadasha-survival-guide',
      },
      {
        label: 'Sani Mahadasha Stabilisation Guide',
        desc: 'Saturn discipline, endurance & remedies',
        icon: ShieldCheck,
        badge: '₹499',
        priceINR: 499,
        priceUSD: 19,
        href: '/services/sani-mahadasha-stabilisation-guide',
      },
      {
        label: 'Sani Mahadasha Survival Guide',
        desc: 'Navigating Saturn trials & karmic phase',
        icon: Zap,
        badge: '₹999',
        priceINR: 999,
        priceUSD: 29,
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
  { label: '✦ AI Astrologers', href: '/talk-to-ai-astrologer', isAiBadge: true },
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
  const [isMobilePanchangOpen, setIsMobilePanchangOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { formatPrice } = useCurrency();

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#FFFDFC]/95 backdrop-blur-md border-b border-[#E5D9C8] ${scrolled ? 'shadow-md' : ''}`}
      >
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <AppLogo src="/astrologo.png" size={52} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${pathname === '/' ? 'text-[#713B32] bg-[#EDE4D5]/80 font-bold' : 'text-[#292522]'}`}
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
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${
                    isServicesOpen ? 'text-[#713B32] bg-[#EDE4D5]/80' : 'text-[#292522]'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-[#713B32]' : ''}`}
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
                      <div className="bg-[#FFFDFC] rounded-2xl shadow-2xl border border-[#E5D9C8] p-5 grid grid-cols-2 gap-5 backdrop-blur-xl">
                        {servicesList.map((group) => (
                          <div key={group.category} className="space-y-2">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] px-2 flex items-center justify-between">
                              <span>{group.category}</span>
                              <span className="h-px bg-[#E5D9C8] flex-1 ml-2" />
                            </div>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const IconComponent = item.icon;
                                const itemBadge = (item as any).priceINR
                                  ? formatPrice((item as any).priceINR, (item as any).priceUSD)
                                  : item.badge;
                                const itemLabel = (item as any).priceINR
                                  ? `${item.label} (PDF)`
                                  : item.label;
                                return (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsServicesOpen(false)}
                                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8F3EA] transition-all group/item border border-transparent hover:border-[#E5D9C8]"
                                  >
                                    <div className="p-1.5 rounded-lg bg-[#EDE4D5] text-[#713B32] group-hover/item:bg-[#713B32] group-hover/item:text-white transition-colors mt-0.5 shrink-0">
                                      <IconComponent size={15} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-bold text-[#292522] group-hover/item:text-[#713B32] transition-colors truncate">
                                          {itemLabel}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                            itemBadge === 'Free'
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]'
                                          }`}
                                        >
                                          {itemBadge}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#6B5E55] line-clamp-1 mt-0.5">
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
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${
                    isPanchangOpen || pathname.includes('/panchang')
                      ? 'text-[#713B32] bg-[#EDE4D5]/80'
                      : 'text-[#292522]'
                  }`}
                >
                  <span>Panchang</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isPanchangOpen ? 'rotate-180 text-[#713B32]' : ''}`}
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
                      <div className="bg-[#FFFDFC] rounded-2xl shadow-2xl border border-[#E5D9C8] p-2 space-y-0.5">
                        {panchangItems.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsPanchangOpen(false)}
                            className="block px-4 py-2.5 rounded-xl text-xs font-semibold text-[#292522] hover:bg-[#F8F3EA] hover:text-[#713B32] transition-colors"
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
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${pathname === link?.href ? 'text-[#713B32] bg-[#EDE4D5]/80 font-bold' : 'text-[#292522]'}`}
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-[#E5D9C8] text-[#292522] hover:border-[#713B32] hover:text-[#713B32] hover:bg-[#F8F3EA] transition-all duration-200 shadow-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#EDE4D5] text-[#292522] transition-all"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Active Call Banner */}
        {activeCall && !pathname.includes('/call/') && (
          <div className="bg-[#713B32] text-white px-6 py-2.5 flex items-center justify-between text-sm shadow-md animate-pulse border-t border-[#B88A44]/30">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              You have an active ongoing {activeCall.type || 'video'} call!
            </div>
            <Link
              href={`/call/${activeCall.roomID}`}
              className="px-4 py-1.5 bg-[#FFFDFC] text-[#713B32] rounded-lg font-bold text-xs hover:bg-[#F8F3EA] transition-colors shadow-sm"
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
              className="lg:hidden bg-[#FFFDFC] border-t border-[#E5D9C8] shadow-2xl absolute w-full max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              <div className="px-6 py-4 space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#EDE4D5]/60 hover:text-[#713B32] text-[#292522] transition-all"
                >
                  Home
                </Link>

                {/* Mobile Services Accordion */}
                <div>
                  <button
                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#EDE4D5]/60 hover:text-[#713B32] text-[#292522] transition-all"
                  >
                    <span>Services</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${isMobileServicesOpen ? 'rotate-180 text-[#713B32]' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-3 pr-2 py-1 space-y-3 bg-[#F8F3EA] rounded-xl my-1 border border-[#E5D9C8]"
                      >
                        {servicesList.map((group) => (
                          <div key={`mobile-${group.category}`} className="space-y-1">
                            <div className="text-[10px] font-bold text-[#6B5E55] uppercase tracking-wider px-2 pt-2">
                              {group.category}
                            </div>
                            {group.items.map((item) => {
                              const IconComp = item.icon;
                              const itemBadge = (item as any).priceINR
                                ? formatPrice((item as any).priceINR, (item as any).priceUSD)
                                : item.badge;
                              const itemLabel = (item as any).priceINR
                                ? `${item.label} (PDF)`
                                : item.label;
                              return (
                                <Link
                                  key={`mobile-${item.label}`}
                                  href={item.href}
                                  onClick={() => {
                                    setIsServicesOpen(false);
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-[#292522] hover:bg-[#EDE4D5] hover:text-[#713B32] transition-all"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <IconComp size={14} className="text-[#713B32] shrink-0" />
                                    <span className="truncate">{itemLabel}</span>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1 ${
                                      itemBadge === 'Free'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-[#EDE4D5] text-[#713B32]'
                                    }`}
                                  >
                                    {itemBadge}
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

                {/* Mobile Panchang Accordion */}
                <div>
                  <button
                    onClick={() => setIsMobilePanchangOpen(!isMobilePanchangOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#EDE4D5]/60 hover:text-[#713B32] text-[#292522] transition-all"
                  >
                    <span>Panchang</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${isMobilePanchangOpen ? 'rotate-180 text-[#713B32]' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobilePanchangOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-3 pr-2 py-2 space-y-1 bg-[#F8F3EA] rounded-xl my-1 border border-[#E5D9C8]"
                      >
                        <Link
                          href="/services/panchang"
                          onClick={() => {
                            setIsMobilePanchangOpen(false);
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold text-[#713B32] bg-[#EDE4D5] hover:bg-[#E5D9C8] transition-all mb-1"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#B88A44]" />
                            <span>Today&apos;s Full Panchang</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Live
                          </span>
                        </Link>

                        {panchangItems.map((item) => (
                          <Link
                            key={`mobile-panchang-${item.label}`}
                            href={item.href}
                            onClick={() => {
                              setIsMobilePanchangOpen(false);
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#292522] hover:bg-[#EDE4D5] hover:text-[#713B32] transition-all"
                          >
                            <Calendar size={13} className="text-[#B88A44]" />
                            <span>{item.label}</span>
                          </Link>
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
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#EDE4D5]/60 hover:text-[#713B32] text-[#292522] transition-all"
                    >
                      {link?.label}
                    </Link>
                  ))}

                <div className="pt-3 border-t border-[#E5D9C8] flex gap-3">
                  {user ? null : (
                    <>
                      <Link
                        href="/sign-up-login-screen"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold border border-[#E5D9C8] text-[#292522] hover:border-[#713B32] hover:text-[#713B32] hover:bg-[#F8F3EA] transition-all"
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
