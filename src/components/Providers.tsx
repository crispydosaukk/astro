'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { initAnalytics } from '@/lib/firebase';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Safely trigger client-side analytics initialization
    initAnalytics().catch(console.warn);
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
