import React from 'react';
import Navbar from '@/components/Navbar';
import PanchangServicePage from '../services/panchang/page';

export default function PanchangPage() {
  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <PanchangServicePage />
      </main>
    </div>
  );
}
