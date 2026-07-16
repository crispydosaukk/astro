import React, { Suspense } from 'react';
import AstrologerAuthScreen from './components/AstrologerAuthScreen';

export default function AstrologerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AstrologerAuthScreen />
    </Suspense>
  );
}
