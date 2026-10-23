import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import GlobalFooterAndBottomBar from '@/components/GlobalFooterAndBottomBar';
import AIChatSidebar from '@/components/AIChatSidebar';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: 'AstroParihar — Premium Vedic Astrology Guidance',
  description:
    'Get personalized Vedic astrology insights, gemstone & mantra recommendations, and connect with expert astrologers for live consultations.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  verification: {
    google: 'aFwiTW8WhIlrE6WnejYCuggHrijqzCIKMV7kMhTgqdE',
  },
};

import { cookies } from 'next/headers';
import { LanguageCode } from '@/lib/translations';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let initialLanguage: LanguageCode = 'en';
  try {
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('astroparihar_language')?.value;
    if (langCookie && ['en', 'te', 'hi', 'ta', 'kn', 'ml'].includes(langCookie)) {
      initialLanguage = langCookie as LanguageCode;
    } else {
      const googtrans = cookieStore.get('googtrans')?.value;
      if (googtrans) {
        const parts = googtrans.split('/');
        const target = parts[parts.length - 1];
        if (['en', 'te', 'hi', 'ta', 'kn', 'ml'].includes(target)) {
          initialLanguage = target as LanguageCode;
        }
      }
    }
  } catch (_e) {}

  return (
    <html lang={initialLanguage} data-lang={initialLanguage} className={`${plusJakartaSans.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body className={plusJakartaSans.className} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <CurrencyProvider>
              {children}
              <GlobalFooterAndBottomBar />
              <AIChatSidebar />
              <Toaster position="top-center" richColors closeButton />
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
