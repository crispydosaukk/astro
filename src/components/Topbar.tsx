'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface TopbarProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export default function Topbar({
  userName = 'Super Admin',
  userRole = 'Super Admin',
  userInitials = 'SA',
}: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentName, setCurrentName] = useState(userName);
  const [currentRole, setCurrentRole] = useState(userRole);
  const [currentInitials, setCurrentInitials] = useState(userInitials);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('astroparihar_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setCurrentName(parsed.name);
          if (parsed.role) setCurrentRole(parsed.role);
          setCurrentInitials('SA');
        }
      } catch (_e) {}
    }
  }, []);

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astroparihar_user');
    }
    try {
      await signOut(auth);
    } catch (_e) {}
    window.location.href = '/aiastro';
  };

  const notifications = [
    { id: 'notif-001', type: 'review', message: '5 candidates awaiting human review', time: '2 min ago', urgent: true },
    { id: 'notif-002', type: 'outreach', message: 'Campaign "Chennai Vedic" ready for outreach approval', time: '18 min ago', urgent: true },
    { id: 'notif-003', type: 'probation', message: 'Ravi Kumar — Day 15 checkpoint due today', time: '1 hr ago', urgent: false },
    { id: 'notif-004', type: 'discovery', message: 'Discovery job completed: 34 candidates found', time: '3 hrs ago', urgent: false },
    { id: 'notif-005', type: 'verification', message: 'Meenakshi Iyer verified successfully', time: '5 hrs ago', urgent: false },
  ];

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30">
      {/* Global search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidates, applications, campaigns…"
            className="input-field pl-9 py-2 text-sm h-9"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="btn-ghost relative p-2"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 card-elevated z-50 animate-slide-up overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-md">Notifications</span>
                <span className="text-2xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                  {notifications.filter(n => n.urgent).length} urgent
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors duration-150 ${notif.urgent ? 'bg-red-50/50' : ''}`}
                  >
                    <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border">
                <button className="text-sm text-primary font-semibold hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Website Link */}
        <Link
          href="/"
          className="btn-ghost px-2.5 py-1.5 text-xs flex items-center gap-1 font-medium hover:text-primary rounded-lg border border-border"
          title="Return to main AstroParihar website"
        >
          <span>Main Site</span>
        </Link>

        {/* Profile */}
        <div className="relative ml-1">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors duration-150"
          >
            <div className="w-7 h-7 rounded-full terracotta-gradient flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
              {currentInitials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold leading-none text-foreground">{currentName}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">{currentRole}</p>
            </div>
            <ChevronDown size={12} className="text-muted-foreground" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 card-elevated z-50 animate-slide-up overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm">{currentName}</p>
                <p className="text-xs text-muted-foreground">{currentRole}</p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground transition-colors">
                  <User size={14} className="text-muted-foreground" />
                  My Profile
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2.5 text-foreground transition-colors">
                  <Settings size={14} className="text-muted-foreground" />
                  Settings
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2.5 text-red-700 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}