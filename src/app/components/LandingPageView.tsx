'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from './HeroSection';
import { RemediesSection, ComprehensiveServicesSection } from './ServicesSection';
import FeaturedAstrologers from './FeaturedAstrologers';
import TestimonialsSection from './TestimonialsSection';
import LandingFooter from './LandingFooter';
import { HomepageContent, defaultHomepageContent, subscribeHomepageContent, getHomepageContent } from '@/lib/cms';

interface LandingPageViewProps {
  initialContent: HomepageContent;
}

export default function LandingPageView({ initialContent }: LandingPageViewProps) {
  const [content, setContent] = useState<HomepageContent>(initialContent || defaultHomepageContent);

  useEffect(() => {
    // 1. Immediately fetch latest from Firestore directly in the client to bypass any CDN / build caches
    getHomepageContent()
      .then((fresh) => {
        if (fresh) setContent(fresh);
      })
      .catch(console.error);

    // 2. Subscribe in real-time to Firestore so any Admin changes appear INSTANTLY on screen
    const unsubscribe = subscribeHomepageContent((updated) => {
      if (updated) {
        setContent(updated);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <HeroSection content={content.hero} />
      <RemediesSection content={content.services} />
      <FeaturedAstrologers />
      <ComprehensiveServicesSection comprehensiveContent={content.comprehensiveServices} />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}
