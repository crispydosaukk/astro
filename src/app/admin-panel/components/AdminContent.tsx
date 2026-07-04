'use client';
import React, { useState } from 'react';
import AdminMetrics from './AdminMetrics';
import AdminCharts from './AdminCharts';
import AdminUsersTable from './AdminUsersTable';
import AdminAstrologersTable from './AdminAstrologersTable';
import AdminAppointmentsTable from './AdminAppointmentsTable';
import AdminPaymentsTable from './AdminPaymentsTable';
import { Shield, Users, Star, Calendar, CreditCard, Bell, Download } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const tabs = [
  { id: 'tab-overview', label: 'Overview', icon: Shield },
  { id: 'tab-users', label: 'Users', icon: Users },
  { id: 'tab-astrologers', label: 'Astrologers', icon: Star },
  { id: 'tab-appointments', label: 'Appointments', icon: Calendar },
  { id: 'tab-payments', label: 'Payments', icon: CreditCard },
];

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('tab-overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield size={20} className="text-accent" /> Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">AstroParihar Control Center · Last synced 2 min ago</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-accent/50 text-sm hover:text-accent transition-all">
              <Download size={14} /> Export
            </button>
            <button className="relative p-2 rounded-xl hover:bg-muted transition-all">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide">
          {tabs?.map(tab => {
            const Icon = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${activeTab === tab?.id ? 'gold-gradient-bg text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <Icon size={14} />
                {tab?.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
        {activeTab === 'tab-overview' && (
          <>
            <AdminMetrics />
            <AdminCharts />
          </>
        )}
        {activeTab === 'tab-users' && <AdminUsersTable />}
        {activeTab === 'tab-astrologers' && <AdminAstrologersTable />}
        {activeTab === 'tab-appointments' && <AdminAppointmentsTable />}
        {activeTab === 'tab-payments' && <AdminPaymentsTable />}
      </div>
    </div>
  );
}