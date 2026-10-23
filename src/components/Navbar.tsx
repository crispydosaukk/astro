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
  Moon,
  Clock,
  Globe,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import UserDropdown from './UserDropdown';
import { useCurrency } from '@/lib/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';

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

const panchangGroups = [
  {
    category: 'Daily Celestial Elements',
    items: [
      {
        label: 'Today Panchang',
        desc: 'Tithi, Nakshatra, Yoga & Shubh Muhurat',
        icon: Calendar,
        badge: 'Live',
        href: '/panchang/today-panchang',
      },
      {
        label: 'Tomorrow Panchang',
        desc: 'Advance next-day celestial alignments',
        icon: Calendar,
        badge: 'Advance',
        href: '/panchang/tomorrow-panchang',
      },
      {
        label: 'Tithi',
        desc: 'Lunar phases & paksha calculations',
        icon: Moon,
        href: '/panchang/tithi',
      },
      {
        label: 'Vaar',
        desc: 'Seven day lords & planetary deity',
        icon: Sun,
        href: '/panchang/vaar',
      },
      {
        label: 'Karana',
        desc: 'Half-tithi interval for action planning',
        icon: Sparkles,
        href: '/panchang/karana',
      },
    ],
  },
  {
    category: 'Muhurats & Timing Windows',
    items: [
      {
        label: 'Shubh Muhurat',
        desc: 'Auspicious Abhijit & Amrit timing windows',
        icon: Sparkles,
        badge: 'Auspicious',
        href: '/panchang/shubh-muhurat',
      },
      {
        label: 'Rahu Kaal',
        desc: 'Inauspicious Rahu periods & cautions',
        icon: Flame,
        badge: 'Caution',
        href: '/panchang/rahu-kaal',
      },
      {
        label: 'Choghadiya',
        desc: 'Day & night 7-fold auspicious divisions',
        icon: Compass,
        href: '/panchang/choghadiya',
      },
      {
        label: 'Hora',
        desc: 'Hourly planetary ruler alignment & tasks',
        icon: Clock,
        href: '/panchang/hora',
      },
    ],
  },
];

const panchangItems = panchangGroups.flatMap((g) => g.items);

const standardNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Talk to Astrologer', href: '/talk-to-astrologer' },
  { label: '✦ AI Expert Astrologer', href: '/talk-to-ai-astrologer', isAiBadge: true },
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
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const { formatPrice } = useCurrency();
  const { language, setLanguage, t, currentLangOption, languages } = useLanguage();

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getServiceLabel = (label: string) => {
    if (label === 'Janam Kundli') return t('service.janamKundli', label);
    if (label === 'Kundli Matching') return t('service.kundliMatching', label);
    if (label === 'Panchang') return t('service.panchang', label);
    if (label === 'Daily Horoscope') return t('service.dailyHoroscope', label);
    if (label === 'Meditation Guide') return t('service.meditationGuide', label);
    if (label === 'Fasting Planner') return t('service.fastingPlanner', label);
    if (label === 'Rahu Mahadasha Stabilisation Guide') return t('service.rahuStabilisation', label);
    if (label === 'Rahu Mahadasha Survival Guide') return t('service.rahuSurvival', label);
    if (label === 'Sani Mahadasha Stabilisation Guide') return t('service.saniStabilisation', label);
    if (label === 'Sani Mahadasha Survival Guide') return t('service.saniSurvival', label);
    return label;
  };

  const getServiceDesc = (desc: string) => {
    if (desc.includes('Personalized Vedic birth chart')) return t('service.janamKundliDesc', desc);
    if (desc.includes('Vedic Gun Milan')) return t('service.kundliMatchingDesc', desc);
    if (desc.includes('Tithi, Nakshatra')) return t('service.panchangDesc', desc);
    if (desc.includes('Daily zodiac forecasts')) return t('service.dailyHoroscopeDesc', desc);
    if (desc.includes('Mindfulness, mantras')) return t('service.meditationGuideDesc', desc);
    if (desc.includes('Sacred Vrat schedules')) return t('service.fastingPlannerDesc', desc);
    if (desc.includes('Harmonize intense Rahu transit')) return t('service.rahuStabilisationDesc', desc);
    if (desc.includes('Tactical survival & protective mantras')) return t('service.rahuSurvivalDesc', desc);
    if (desc.includes('Saturn discipline')) return t('service.saniStabilisationDesc', desc);
    if (desc.includes('Navigating Saturn trials')) return t('service.saniSurvivalDesc', desc);
    return desc;
  };

  const getPanchangLabel = (label: string) => {
    if (label === 'Today Panchang') return t('panchang.today', label);
    if (label === 'Tomorrow Panchang') return t('panchang.tomorrow', label);
    if (label === 'Tithi') return t('panchang.tithi', label);
    if (label === 'Vaar') return t('panchang.vaar', label);
    if (label === 'Karana') return t('panchang.karana', label);
    if (label === 'Shubh Muhurat') return t('panchang.shubhMuhurat', label);
    if (label === 'Rahu Kaal') return t('panchang.rahuKaal', label);
    if (label === 'Choghadiya') return t('panchang.choghadiya', label);
    if (label === 'Hora') return t('panchang.hora', label);
    return label;
  };

  const getPanchangDesc = (desc: string) => {
    if (desc.includes('Tithi, Nakshatra, Yoga')) return t('panchang.todayDesc', desc);
    if (desc.includes('Advance next-day')) return t('panchang.tomorrowDesc', desc);
    if (desc.includes('Lunar phases')) return t('panchang.tithiDesc', desc);
    if (desc.includes('Seven day lords')) return t('panchang.vaarDesc', desc);
    if (desc.includes('Half-tithi interval')) return t('panchang.karanaDesc', desc);
    if (desc.includes('Auspicious Abhijit')) return t('panchang.shubhMuhuratDesc', desc);
    if (desc.includes('Inauspicious Rahu periods')) return t('panchang.rahuKaalDesc', desc);
    if (desc.includes('Day & night 7-fold')) return t('panchang.choghadiyaDesc', desc);
    if (desc.includes('Hourly planetary ruler')) return t('panchang.horaDesc', desc);
    return desc;
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'Free Services & Tools') return t('category.freeServices', cat);
    if (cat === 'Mahadasha Guides') return t('category.mahadashaGuides', cat);
    if (cat === 'Daily Celestial Elements') return t('category.dailyCelestial', cat);
    if (cat === 'Muhurats & Timing Windows') return t('category.muhuratsTiming', cat);
    return cat;
  };

  const getBadgeLabel = (badge?: string) => {
    if (badge === 'Free') return t('badge.free', badge);
    if (badge === 'Live') return t('badge.live', badge);
    if (badge === 'Auspicious') return t('badge.auspicious', badge);
    if (badge === 'Caution') return t('badge.caution', badge);
    if (badge === 'Advance') return t('badge.advance', badge);
    return badge;
  };

  const getNavLinkLabel = (href: string, defaultLabel: string) => {
    if (href === '/') return t('nav.home', defaultLabel);
    if (href === '/talk-to-astrologer') return t('nav.talkToAstrologer', defaultLabel);
    if (href === '/talk-to-ai-astrologer') return t('nav.aiExpertAstrologer', defaultLabel);
    if (href === '/remedies') return t('nav.remedies', defaultLabel);
    if (href === '/astrologer-login') return t('nav.astrologerLogin', defaultLabel);
    return defaultLabel;
  };

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#FFFDFC]/95 backdrop-blur-md border-b border-[#E5D9C8] notranslate ${scrolled ? 'shadow-md' : ''}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <AppLogo src="/astrologo.png" size={48} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
              <Link
                href="/"
                suppressHydrationWarning
                className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap leading-none transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${pathname === '/' ? 'text-[#713B32] bg-[#EDE4D5]/80 font-bold' : 'text-[#292522]'}`}
              >
                <span suppressHydrationWarning>{t('nav.home', 'Home')}</span>
              </Link>

              {/* Services Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`flex items-center gap-1 px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap leading-none transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${
                    isServicesOpen ? 'text-[#713B32] bg-[#EDE4D5]/80' : 'text-[#292522]'
                  }`}
                >
                  <span suppressHydrationWarning>{t('nav.services', 'Services')}</span>
                  <ChevronDown
                    size={15}
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
                              <span>{getCategoryLabel(group.category)}</span>
                              <span className="h-px bg-[#E5D9C8] flex-1 ml-2" />
                            </div>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const IconComponent = item.icon;
                                const itemBadge = (item as any).priceINR
                                  ? formatPrice((item as any).priceINR, (item as any).priceUSD)
                                  : getBadgeLabel(item.badge);
                                const itemLabel = (item as any).priceINR
                                  ? `${getServiceLabel(item.label)} (PDF)`
                                  : getServiceLabel(item.label);
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
                                            itemBadge === 'Free' || itemBadge === 'ఉచితం' || itemBadge === 'मुफ्त' || itemBadge === 'இலவசம்'
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]'
                                          }`}
                                        >
                                          {itemBadge}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#6B5E55] line-clamp-1 mt-0.5">
                                        {getServiceDesc(item.desc)}
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
                  className={`flex items-center gap-1 px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap leading-none transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${
                    isPanchangOpen || pathname.includes('/panchang')
                      ? 'text-[#713B32] bg-[#EDE4D5]/80'
                      : 'text-[#292522]'
                  }`}
                >
                  <span suppressHydrationWarning>{t('nav.panchang', 'Panchang')}</span>
                  <ChevronDown
                    size={15}
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
                      className="absolute left-0 top-full pt-2 w-[600px] z-50"
                    >
                      <div className="bg-[#FFFDFC] rounded-2xl shadow-2xl border border-[#E5D9C8] p-5 grid grid-cols-2 gap-5 backdrop-blur-xl">
                        {panchangGroups.map((group) => (
                          <div key={group.category} className="space-y-2">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] px-2 flex items-center justify-between">
                              <span>{getCategoryLabel(group.category)}</span>
                              <span className="h-px bg-[#E5D9C8] flex-1 ml-2" />
                            </div>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const IconComponent = item.icon;
                                const itemBadge = getBadgeLabel(item.badge);
                                return (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsPanchangOpen(false)}
                                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#F8F3EA] transition-all group/item border border-transparent hover:border-[#E5D9C8]"
                                  >
                                    <div className="p-1.5 rounded-lg bg-[#EDE4D5] text-[#713B32] group-hover/item:bg-[#713B32] group-hover/item:text-white transition-colors mt-0.5 shrink-0">
                                      <IconComponent size={15} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-bold text-[#292522] group-hover/item:text-[#713B32] transition-colors truncate">
                                          {getPanchangLabel(item.label)}
                                        </span>
                                        {itemBadge && (
                                          <span
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                              item.badge === 'Live' || item.badge === 'Auspicious'
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                : item.badge === 'Caution'
                                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                : 'bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]'
                                            }`}
                                          >
                                            {itemBadge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-[#6B5E55] line-clamp-1 mt-0.5">
                                        {getPanchangDesc(item.desc)}
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

              {standardNavLinks
                .filter((link) => link.href !== '/')
                .map((link) => (
                  <Link
                    key={`nav-${link?.label}`}
                    href={link?.href}
                    suppressHydrationWarning
                    className={`px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap leading-none transition-all duration-200 hover:text-[#713B32] hover:bg-[#EDE4D5]/60 ${pathname === link?.href ? 'text-[#713B32] bg-[#EDE4D5]/80 font-bold' : 'text-[#292522]'}`}
                  >
                    <span suppressHydrationWarning>{getNavLinkLabel(link.href, link.label)}</span>
                  </Link>
                ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Global Language Selector (Desktop) */}
              <div className="relative hidden sm:block notranslate" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E5D9C8] bg-[#FFFDFC] text-[#292522] hover:border-[#713B32] hover:text-[#713B32] hover:bg-[#F8F3EA] transition-all duration-200 shadow-sm whitespace-nowrap shrink-0"
                  title="Select Language / భాష / भाषा / மொழி / ಭಾಷೆ / ഭാഷ"
                  aria-label="Select Language"
                  id="desktop-language-selector-btn"
                >
                  <Globe size={15} className="text-[#713B32] shrink-0" />
                  <span className="font-bold text-xs tracking-wide" suppressHydrationWarning>{currentLangOption.nativeName}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 text-[#6B5E55] ${isLangOpen ? 'rotate-180 text-[#713B32]' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#FFFDFC] rounded-2xl shadow-2xl border border-[#E5D9C8] p-2 z-50 overflow-hidden backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-[#E5D9C8] flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#713B32] uppercase tracking-wider">
                          <Globe size={13} className="text-[#B88A44]" />
                          <span>{t('lang.selectLanguage', 'Select Language')}</span>
                        </div>
                        <span className="text-[10px] text-[#8C7A6B] font-mono font-semibold">{languages.length} {t('lang.languages', 'Languages')}</span>
                      </div>
                      <div className="py-1 space-y-1">
                        {languages.map((item) => {
                          const isSelected = language === item.code;
                          return (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setLanguage(item.code);
                                setIsLangOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group ${
                                isSelected
                                  ? 'bg-[#EDE4D5]/80 text-[#713B32] font-bold border border-[#E5D9C8]'
                                  : 'hover:bg-[#F8F3EA] text-[#292522] border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors ${
                                    isSelected
                                      ? 'bg-[#713B32] text-white shadow-xs'
                                      : 'bg-[#EDE4D5] text-[#713B32] group-hover:bg-[#713B32] group-hover:text-white'
                                  }`}
                                >
                                  {item.shortLabel}
                                </span>
                                <div>
                                  <div className="text-xs font-bold leading-tight group-hover:text-[#713B32]">
                                    {item.nativeName}
                                  </div>
                                  <div className="text-[10px] text-[#6B5E55] leading-none mt-0.5">
                                    {item.name}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-[#713B32] flex items-center justify-center text-white shrink-0">
                                  <Check size={10} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Language Button */}
              <div className="relative sm:hidden notranslate">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[#E5D9C8] bg-[#FFFDFC] text-[#713B32] hover:bg-[#F8F3EA]"
                  aria-label="Select Language"
                  id="mobile-language-selector-btn"
                >
                  <Globe size={14} className="text-[#713B32]" />
                  <span>{currentLangOption.shortLabel}</span>
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#FFFDFC] rounded-xl shadow-2xl border border-[#E5D9C8] p-1.5 z-50 animate-slide-up">
                    {languages.map((item) => (
                      <button
                        key={`m-drop-${item.code}`}
                        type="button"
                        onClick={() => {
                          setLanguage(item.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left ${
                          language === item.code ? 'bg-[#EDE4D5] text-[#713B32] font-bold' : 'hover:bg-[#F8F3EA] text-[#292522]'
                        }`}
                      >
                        <span>{item.nativeName}</span>
                        {language === item.code && <Check size={12} className="text-[#713B32]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  <UserDropdown />
                </>
              ) : (
                <>
                  <Link
                    href="/sign-up-login-screen"
                    className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-[#E5D9C8] text-[#292522] hover:border-[#713B32] hover:text-[#713B32] hover:bg-[#F8F3EA] transition-all duration-200 shadow-sm whitespace-nowrap shrink-0"
                  >
                    {t('nav.signIn', 'Sign In')}
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
              {t('nav.activeCall', 'You have an active ongoing call!')}
            </div>
            <Link
              href={`/call/${activeCall.roomID}`}
              className="px-4 py-1.5 bg-[#FFFDFC] text-[#713B32] rounded-lg font-bold text-xs hover:bg-[#F8F3EA] transition-colors shadow-sm"
            >
              {t('nav.rejoinCall', 'Rejoin Call')}
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
                {/* Mobile Menu Dedicated Language Switcher */}
                <div className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#E5D9C8] space-y-2 mb-3 notranslate">
                  <div className="flex items-center justify-between text-xs font-bold text-[#713B32]">
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-[#B88A44]" />
                      <span>{t('lang.selectLanguage', 'Select Language')}</span>
                    </div>
                    <span className="text-[10px] text-[#8C7A6B] font-mono">{languages.length} {t('lang.languages', 'Languages')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((item) => {
                      const isSelected = language === item.code;
                      return (
                        <button
                          key={`mobile-lang-${item.code}`}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code);
                            setIsOpen(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-[#713B32] text-white border-[#713B32] shadow-sm'
                              : 'bg-[#FFFDFC] text-[#292522] border-[#E5D9C8] hover:border-[#713B32]'
                          }`}
                        >
                          <span className="truncate">{item.nativeName}</span>
                          <span
                            className={`text-[9px] uppercase px-1 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#EDE4D5] text-[#713B32]'
                            }`}
                          >
                            {item.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#EDE4D5]/60 hover:text-[#713B32] text-[#292522] transition-all"
                >
                  {t('nav.home', 'Home')}
                </Link>

                {/* Mobile Services Accordion */}
                <div>
                  <button
                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#EDE4D5]/60 hover:text-[#713B32] text-[#292522] transition-all"
                  >
                    <span>{t('nav.services', 'Services')}</span>
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
                              {getCategoryLabel(group.category)}
                            </div>
                            {group.items.map((item) => {
                              const IconComp = item.icon;
                              const itemBadge = (item as any).priceINR
                                ? formatPrice((item as any).priceINR, (item as any).priceUSD)
                                : getBadgeLabel(item.badge);
                              const itemLabel = (item as any).priceINR
                                ? `${getServiceLabel(item.label)} (PDF)`
                                : getServiceLabel(item.label);
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
                                      itemBadge === 'Free' || itemBadge === 'ఉచితం' || itemBadge === 'मुफ्त' || itemBadge === 'இலவசம்' || itemBadge === 'ಉಚಿತ' || itemBadge === 'സൗജന്യം'
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
                    <span>{t('nav.panchang', 'Panchang')}</span>
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
                            <span>{t('nav.todayPanchangFull', "Today's Full Panchang")}</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {t('badge.live', 'Live')}
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
                            <span>{getPanchangLabel(item.label)}</span>
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
                      {getNavLinkLabel(link.href, link.label)}
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
                        {t('nav.signIn', 'Sign In')}
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
