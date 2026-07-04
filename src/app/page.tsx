import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from './components/HeroSection';
import PanchangWidget from './components/PanchangWidget';
import ServicesSection from './components/ServicesSection';
import FeaturedAstrologers from './components/FeaturedAstrologers';
import AIModulesPreview from './components/AIModulesPreview';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <HeroSection />
      <PanchangWidget />
      <ServicesSection />
      <FeaturedAstrologers />
      <AIModulesPreview />
      <PricingSection />
      <TestimonialsSection />
      <LandingFooter />
    </div>
  );
}