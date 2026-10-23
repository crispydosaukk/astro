'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { Settings, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function AppSettingsAdminPage() {
  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="space-y-1">
            <Link href="/app-dynamic" className="text-xs text-primary font-bold flex items-center gap-1 hover:underline mb-1">
              <ArrowLeft size={13} /> Back to App Dynamic Hub
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings size={22} className="text-primary" />
              App Dynamic : Settings & Theme Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure splash screen duration, default theme presets (Light Vedic warm cream / Dark Cosmic), and app metadata.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sun size={18} className="text-amber-500" />
              Default Theme: Light Vedic
            </h3>
            <p className="text-xs text-muted-foreground">
              Warm cream (#F8F4EE) with deep sacred gold (#C9A84C) and burgundy (#8B1A1A) accents. Set as default for new mobile app installs.
            </p>
            <div className="h-12 rounded-xl border border-border flex items-center px-4 gap-3 bg-[#F8F4EE]">
              <span className="w-4 h-4 rounded-full bg-[#C9A84C]" />
              <span className="text-xs font-bold text-[#1A1A2E]">Preview: Light Vedic Theme</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Moon size={18} className="text-indigo-400" />
              Dark Cosmic Preset
            </h3>
            <p className="text-xs text-muted-foreground">
              Deep space dark atmosphere (#080D1A) with starlight overlays and celestial glows.
            </p>
            <div className="h-12 rounded-xl border border-border flex items-center px-4 gap-3 bg-[#080D1A]">
              <span className="w-4 h-4 rounded-full bg-[#C9A84C]" />
              <span className="text-xs font-bold text-[#F0EAD6]">Preview: Dark Cosmic Theme</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
