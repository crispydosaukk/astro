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
import AdminDynamicPageEditor from './AdminDynamicPageEditor';
import AdminAIPrompts from './AdminAIPrompts';
import AdminAIAstrologersTable from './AdminAIAstrologersTable';
import AdminAppOnboardingEditor from './AdminAppOnboardingEditor';
import AdminAppBannersEditor from './AdminAppBannersEditor';
import AdminAppCosmicInsightsEditor from './AdminAppCosmicInsightsEditor';
import AdminAppReviewsEditor from './AdminAppReviewsEditor';
import AdminAppServicesEditor from './AdminAppServicesEditor';
import { Shield, Bell, Download, LogOut, Smartphone, LayoutTemplate, Sparkles, ChevronDown } from 'lucide-react';
import LogoutModal from '@/components/LogoutModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const APP_DYNAMIC_SUBMODULES = [
  {
    id: 'tab-app-onboarding',
    label: 'Onboarding Slides',
    shortLabel: 'Onboarding',
    href: '/admin-panel/app-dynamic/onboarding',
    icon: Smartphone,
  },
  {
    id: 'tab-app-banners',
    label: 'Home Banners & Promos',
    shortLabel: 'Home Banners',
    href: '/admin-panel/app-dynamic/banners',
    icon: LayoutTemplate,
  },
  {
    id: 'tab-app-cosmic-insights',
    label: 'Cosmic Insights Carousel',
    shortLabel: 'Cosmic Insights',
    href: '/admin-panel/app-dynamic/cosmic-insights',
    icon: Sparkles,
  },
  {
    id: 'tab-app-services',
    label: 'App Services & Remedies',
    shortLabel: 'Services',
    href: '/admin-panel/app-dynamic/services',
    icon: LayoutTemplate,
  },
  {
    id: 'tab-app-reviews',
    label: 'Customer Reviews & Ratings',
    shortLabel: 'Reviews & Ratings',
    href: '/admin-panel/app-dynamic/reviews',
    icon: Shield,
  },
];

export default function AdminContent({ activeTab = 'tab-overview' }: { activeTab?: string }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const isAppDynamic =
    activeTab === 'tab-app-onboarding' ||
    activeTab === 'tab-app-dynamic' ||
    activeTab === 'tab-app-banners' ||
    activeTab === 'tab-app-cosmic-insights' ||
    activeTab === 'tab-app-reviews' ||
    activeTab === 'tab-app-services';

  const currentSubTab =
    activeTab === 'tab-app-dynamic' ? 'tab-app-onboarding' : activeTab;

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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs transition-all shadow-sm"
              title="Sign Out of Admin Panel"
            >
              <LogOut size={15} /> Sign Out
            </button>
            <button className="relative p-2 rounded-xl hover:bg-muted transition-all">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-6">
        {/* App Dynamic Module & Submodule Dropdown Selector Bar */}
        {isAppDynamic && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Module:
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                    App Dynamic
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-foreground">Submodule:</span>
                  <div className="relative inline-block">
                    <select
                      value={currentSubTab}
                      onChange={(e) => {
                        const target = APP_DYNAMIC_SUBMODULES.find(
                          (sub) => sub.id === e.target.value
                        );
                        if (target) router.push(target.href);
                      }}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-muted/80 hover:bg-muted border border-border hover:border-accent text-xs font-bold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    >
                      {APP_DYNAMIC_SUBMODULES.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submodule Switch Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border/70 rounded-xl overflow-x-auto">
              {APP_DYNAMIC_SUBMODULES.map((sub) => {
                const isCurrent = currentSubTab === sub.id;
                const SubIcon = sub.icon;
                return (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isCurrent
                        ? 'bg-card text-foreground shadow-xs font-bold border border-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <SubIcon
                      size={13}
                      className={isCurrent ? 'text-accent' : 'text-muted-foreground'}
                    />
                    <span>{sub.shortLabel}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tab-overview' && (
          <>
            <AdminMetrics />
            <AdminCharts />
          </>
        )}
        {(activeTab === 'tab-app-onboarding' || activeTab === 'tab-app-dynamic') && (
          <AdminAppOnboardingEditor />
        )}
        {activeTab === 'tab-app-banners' && <AdminAppBannersEditor />}
        {activeTab === 'tab-app-cosmic-insights' && <AdminAppCosmicInsightsEditor />}
        {activeTab === 'tab-app-reviews' && <AdminAppReviewsEditor />}
        {activeTab === 'tab-app-services' && <AdminAppServicesEditor />}
        {activeTab === 'tab-content' && <AdminContentManagement />}
        {activeTab === 'tab-page-content' && <AdminDynamicPageEditor />}
        {activeTab === 'tab-prompts' && <AdminAIPrompts />}
        {activeTab === 'tab-ai-astrologers' && <AdminAIAstrologersTable />}
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
