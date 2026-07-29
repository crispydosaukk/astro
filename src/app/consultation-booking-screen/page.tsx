import React from 'react';
import Navbar from '@/components/Navbar';
import ConsultationContent from './components/ConsultationContent';

export default function ConsultationBookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ConsultationContent />
    </div>
  );
}
