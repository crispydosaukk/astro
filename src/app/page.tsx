import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import FeaturedAstrologers from './components/FeaturedAstrologers';
import AIModulesPreview from './components/AIModulesPreview';
import TestimonialsSection from './components/TestimonialsSection';
import LandingFooter from './components/LandingFooter';
import { getHomepageContent } from '@/lib/cms';

export default async function LandingPage() {
  const content = await getHomepageContent();

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <HeroSection content={content.hero} />
      <ServicesSection content={content.services} />
      <FeaturedAstrologers />
      <AIModulesPreview />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}