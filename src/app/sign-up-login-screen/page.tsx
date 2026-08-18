import React, { Suspense } from 'react';
import AuthScreen from './components/AuthScreen';
import { Loader2 } from 'lucide-react';

export default function SignUpLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B]" size={32} />
      </div>
    }>
      <AuthScreen />
    </Suspense>
  );
}
