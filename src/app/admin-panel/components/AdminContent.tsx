'use client';
import React, { useState } from 'react';
import AdminMetrics from './AdminMetrics';
import AdminCharts from './AdminCharts';
import AdminUsersTable from './AdminUsersTable';
import AdminAstrologersTable from './AdminAstrologersTable';
import AdminAstrologerApplicationsTable from './AdminAstrologerApplicationsTable';
import AdminAppointmentsTable from './AdminAppointmentsTable';
import AdminPaymentsTable from './AdminPaymentsTable';
import AdminContentManagement from './AdminContentManagement';
import { Shield, Bell, Download, LogOut } from 'lucide-react';
import LogoutModal from '@/components/LogoutModal';

export default function AdminContent({ activeTab = 'tab-overview' }: { activeTab?: string }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield size={20} className="text-accent" /> Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AstroParihar Control Center · Last synced 2 min ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-accent/50 text-sm hover:text-accent transition-all">
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-white hover:border-red-500/50 text-sm hover:text-red-400 transition-all"
            >
              <LogOut size={14} /> Sign Out
            </button>
            <button className="relative p-2 rounded-xl hover:bg-muted transition-all">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
        {activeTab === 'tab-overview' && (
          <>
            <AdminMetrics />
            <AdminCharts />
          </>
        )}
        {activeTab === 'tab-content' && <AdminContentManagement />}
        {activeTab === 'tab-users' && <AdminUsersTable />}
        {activeTab === 'tab-astrologers' && <AdminAstrologersTable />}
        {activeTab === 'tab-applications' && <AdminAstrologerApplicationsTable />}
        {activeTab === 'tab-appointments' && <AdminAppointmentsTable />}
        {activeTab === 'tab-payments' && <AdminPaymentsTable />}
      </div>
      {/* Modals */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
}
