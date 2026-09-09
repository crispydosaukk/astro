import React from 'react';
import type { Metadata } from 'next';
import SignInForm from '@/app/components/SignInForm';

export const metadata: Metadata = {
  title: 'AiASTRO — AI Astrologer Discovery & Verification Platform',
  description:
    'AstroParihar AI platform helps discover, qualify, assess, and verify professional Vedic astrologers through an automated pipeline.',
};

export default function AiAstroPage() {
  return <SignInForm />;
}
