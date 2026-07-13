'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '#services' },
  { label: 'Talk to Astrologer', href: '/talk-to-astrologer' },
  { label: 'Remedies', href: '/ai-recommendations-screen' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#blog' },
  { label: 'Admin', href: '/admin-panel' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-lg' : ''}`}>
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
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent/10 text-slate-700 hover:text-accent transition-all icon-hover-animate">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/sign-up-login-screen" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-accent/50 hover:text-accent transition-all duration-200">
              Sign In
            </Link>
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all duration-200 gold-shadow">
              <Sparkles size={14} />
              <span className="hidden sm:inline">Get Started</span>
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-800 transition-all">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-xl"
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
                <Link href="/sign-up-login-screen" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-accent/50 transition-all">Sign In</Link>
                <Link href="/sign-up-login-screen" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold gold-gradient-bg text-white">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}