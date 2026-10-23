'use client';

import React, { createContext, useContext, useEffect, useState, useTransition, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  LanguageCode,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  translations,
} from '@/lib/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentLangOption: LanguageOption;
  languages: LanguageOption[];
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Safe React DOM monkey-patch to prevent React from crashing when
// Google Translate wraps or alters text nodes with <font> tags:
if (typeof window !== 'undefined') {
  try {
    if (typeof Node === 'function' && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child && child.parentNode !== this) {
          if (child.parentNode) {
            try {
              return child.parentNode.removeChild(child);
            } catch (_e) {}
          }
          return child;
        }
        return originalRemoveChild.apply(this, [child]) as T;
      };

      const originalInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
        if (referenceNode && referenceNode.parentNode !== this) {
          if (referenceNode.parentNode) {
            try {
              return referenceNode.parentNode.insertBefore(newNode, referenceNode);
            } catch (_e) {}
          }
          return newNode;
        }
        return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
      };
    }
  } catch (err) {
    console.warn('Could not apply Google Translate DOM guard:', err);
  }
}

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: {
  children: React.ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') return initialLanguage;
    try {
      const savedLang = localStorage.getItem('astroparihar_language') as LanguageCode | null;
      if (savedLang && ['en', 'te', 'hi', 'ta', 'kn', 'ml'].includes(savedLang)) {
        return savedLang;
      }
    } catch (_e) {}
    return initialLanguage;
  });

  const [isTranslating, startTransition] = useTransition();
  const [mounted, setMounted] = useState<boolean>(false);
  const pathname = usePathname();

  // Helper to retrieve cookie
  const getCookie = useCallback((name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }, []);

  // Set Google Translate cookie
  const setGoogleTransCookie = useCallback((lang: LanguageCode) => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const hostname = window.location.hostname;

    if (lang === 'en') {
      // Clear cookie completely
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      document.cookie = 'googtrans=/en/en; path=/;';
      if (hostname && hostname !== 'localhost') {
        document.cookie = `googtrans=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        document.cookie = `googtrans=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      }
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
      if (hostname && hostname !== 'localhost') {
        document.cookie = `googtrans=/en/${lang}; path=/; domain=${hostname};`;
        document.cookie = `googtrans=/en/${lang}; path=/; domain=.${hostname};`;
      }
    }
  }, []);

  // Programmatically trigger Google Translate select combo
  const triggerGoogleTranslate = useCallback((lang: LanguageCode) => {
    if (typeof document === 'undefined') return false;
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  }, []);

  // 1. Initial Mount: Ensure document lang attributes and initialize Google Translate
  useEffect(() => {
    setMounted(true);
    let initialLang: LanguageCode = language;

    try {
      const savedLang = localStorage.getItem('astroparihar_language') as LanguageCode | null;
      if (savedLang && ['en', 'te', 'hi', 'ta', 'kn', 'ml'].includes(savedLang)) {
        initialLang = savedLang;
      } else {
        const cookieVal = getCookie('googtrans');
        if (cookieVal) {
          const parts = cookieVal.split('/');
          const target = parts[parts.length - 1];
          if (['en', 'te', 'hi', 'ta', 'kn', 'ml'].includes(target)) {
            initialLang = target as LanguageCode;
          }
        }
      }
    } catch (_e) {}

    setLanguageState(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.setAttribute('data-lang', initialLang);

    // 2. Initialize Google Translate Script
    (window as any).googleTranslateElementInit = () => {
      try {
        if ((window as any).google && (window as any).google.translate) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,te,hi,ta',
              autoDisplay: false,
            },
            'google_translate_element'
          );

          // Apply initial language if not English
          if (initialLang !== 'en') {
            setTimeout(() => {
              triggerGoogleTranslate(initialLang);
            }, 300);
          }
        }
      } catch (err) {
        console.warn('Google Translate initialization error:', err);
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [getCookie, triggerGoogleTranslate, language]);

  // 3. Keep translation active on client-side route navigation
  useEffect(() => {
    if (!mounted || language === 'en') return;

    const timer = setTimeout(() => {
      triggerGoogleTranslate(language);
    }, 350);

    return () => clearTimeout(timer);
  }, [pathname, language, mounted, triggerGoogleTranslate]);

  // 4. Change Language Handler
  const setLanguage = (newLang: LanguageCode) => {
    if (newLang === language) return;

    try {
      localStorage.setItem('astroparihar_language', newLang);
    } catch (_e) {}

    // Persist language cookie for Next.js SSR layout
    document.cookie = `astroparihar_language=${newLang}; path=/; max-age=31536000; SameSite=Lax;`;
    setGoogleTransCookie(newLang);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
      document.documentElement.setAttribute('data-lang', newLang);
    }

    setLanguageState(newLang);

    const targetOption = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
    const toastMsg =
      newLang === 'te'
        ? 'భాష తెలుగులోకి మార్చబడింది'
        : newLang === 'hi'
        ? 'भाषा हिन्दी में बदल दी गई है'
        : newLang === 'ta'
        ? 'மொழி தமிழுக்கு மாற்றப்பட்டது'
        : 'Language switched to English';

    toast.success(toastMsg, {
      description: targetOption ? `${targetOption.nativeName} (${targetOption.name})` : undefined,
      duration: 2500,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('astroparihar-language-change', { detail: { language: newLang } }));
    }

    triggerGoogleTranslate(newLang);

    // CRITICAL: Clean reload guarantees fresh DOM translation without stale nodes or reconciliation collisions
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  // Translation function using the dictionary
  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const currentLangOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLangOption,
        languages: SUPPORTED_LANGUAGES,
        isTranslating,
      }}
    >
      {/* Hidden container for Google Translate Element */}
      <div
        id="google_translate_element"
        style={{ display: 'none', position: 'absolute', top: -9999, left: -9999 }}
        aria-hidden="true"
      />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      language: 'en' as LanguageCode,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key,
      currentLangOption: SUPPORTED_LANGUAGES[0],
      languages: SUPPORTED_LANGUAGES,
      isTranslating: false,
    };
  }
  return context;
}
