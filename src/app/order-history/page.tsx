import React from 'react';
import Navbar from '@/components/Navbar';

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <div className="container mx-auto p-8 max-w-4xl pt-32">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Order History</h1>
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
          <p className="text-muted-foreground text-lg">
            Your past orders and consultations will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
