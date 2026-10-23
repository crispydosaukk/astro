'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppDynamicRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin-panel/app-dynamic/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center">
      <div className="text-center p-8 space-y-2">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-semibold">Opening Admin Panel...</p>
      </div>
    </div>
  );
}
