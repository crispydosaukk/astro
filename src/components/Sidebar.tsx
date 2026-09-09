'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Search, Users, Send, ClipboardList, Star, Shield, BarChart3, Bot, Bell, UserCog, Settings, ScrollText, ChevronDown, ChevronRight, Telescope, FileText, MessageSquare, CheckSquare, GitBranch, BookOpen, Video, UserCheck, Timer, BadgeCheck, FolderOpen, Database, Zap, PanelLeftClose, PanelLeftOpen,  } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={16} />,
    href: '/admin-dashboard',
  },
  {
    id: 'nav-discovery',
    label: 'Discovery',
    icon: <Telescope size={16} />,
    children: [
      { id: 'nav-campaigns', label: 'Campaigns', icon: <GitBranch size={14} />, href: '/discovery-campaign-management' },
      { id: 'nav-jobs', label: 'Discovery Jobs', icon: <Zap size={14} />, href: '/discovery-jobs' },
      { id: 'nav-sources', label: 'Search Sources', icon: <Database size={14} />, href: '/search-sources' },
      { id: 'nav-history', label: 'Search History', icon: <ScrollText size={14} />, href: '/search-history' },
    ],
  },
  {
    id: 'nav-candidates',
    label: 'Candidates',
    icon: <Users size={16} />,
    children: [
      { id: 'nav-all-candidates', label: 'All Candidates', icon: <Users size={14} />, href: '/candidate-management' },
      { id: 'nav-qualified', label: 'Qualified', icon: <Star size={14} />, href: '/candidates/qualified' },
      { id: 'nav-outreach-pending', label: 'Outreach Pending', icon: <Send size={14} />, href: '/candidates/outreach-pending' },
      { id: 'nav-applications', label: 'Applications', icon: <FileText size={14} />, href: '/application-management' },
      { id: 'nav-duplicates', label: 'Duplicates', icon: <FolderOpen size={14} />, href: '/candidates/duplicates' },
      { id: 'nav-verified', label: 'Verified Astrologers', icon: <BadgeCheck size={14} />, href: '/candidates/verified' },
    ],
  },
  {
    id: 'nav-outreach',
    label: 'Outreach',
    icon: <Send size={16} />,
    children: [
      { id: 'nav-outreach-campaigns', label: 'Campaigns', icon: <GitBranch size={14} />, href: '/outreach/campaigns' },
      { id: 'nav-templates', label: 'Templates', icon: <BookOpen size={14} />, href: '/outreach/templates' },
      { id: 'nav-messages', label: 'Messages', icon: <MessageSquare size={14} />, href: '/outreach/messages' },
      { id: 'nav-comm-history', label: 'Communication History', icon: <ScrollText size={14} />, href: '/outreach/communication-history' },
    ],
  },
  {
    id: 'nav-enrolment',
    label: 'Enrolment',
    icon: <ClipboardList size={16} />,
    children: [
      { id: 'nav-app-mgmt', label: 'Applications', icon: <FileText size={14} />, href: '/enrolment/applications' },
      { id: 'nav-assessments', label: 'Assessments', icon: <CheckSquare size={14} />, href: '/enrolment/assessments' },
      { id: 'nav-chart-cases', label: 'Chart Cases', icon: <BarChart3 size={14} />, href: '/enrolment/chart-cases' },
      { id: 'nav-ai-interviews', label: 'AI Interviews', icon: <Video size={14} />, href: '/enrolment/ai-interviews' },
      { id: 'nav-human-review', label: 'Human Review', icon: <UserCheck size={14} />, href: '/human-review-module' },
    ],
  },
  {
    id: 'nav-probation',
    label: 'Probation',
    icon: <Timer size={16} />,
    children: [
      { id: 'nav-prob-active', label: 'Active', icon: <Timer size={14} />, href: '/probation/active' },
      { id: 'nav-prob-checkpoints', label: 'Checkpoints', icon: <CheckSquare size={14} />, href: '/probation/checkpoints' },
      { id: 'nav-prob-completed', label: 'Completed', icon: <BadgeCheck size={14} />, href: '/probation/completed' },
    ],
  },
  {
    id: 'nav-verification',
    label: 'Verification',
    icon: <Shield size={16} />,
    href: '/verification',
  },
  {
    id: 'nav-reports',
    label: 'Reports',
    icon: <BarChart3 size={16} />,
    href: '/reports',
  },
  {
    id: 'nav-ai-ops',
    label: 'AI Operations',
    icon: <Bot size={16} />,
    href: '/ai-operations',
  },
  {
    id: 'nav-notifications',
    label: 'Notifications',
    icon: <Bell size={16} />,
    href: '/notifications',
  },
  {
    id: 'nav-users',
    label: 'Users & Roles',
    icon: <UserCog size={16} />,
    href: '/users-roles',
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    icon: <Settings size={16} />,
    href: '/settings',
  },
  {
    id: 'nav-audit',
    label: 'Audit Logs',
    icon: <ScrollText size={16} />,
    href: '/audit-logs',
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['nav-candidates', 'nav-enrolment']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/' && pathname === '/') return true;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);
    const childActive = item.children?.some(c => isActive(c.href));

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => !collapsed && toggleExpand(item.id)}
            className={`nav-item w-full justify-between ${childActive ? 'text-primary font-semibold' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
              {!collapsed && (
                <span className="truncate text-md">{item.label}</span>
              )}
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.badge && (
                  <span className="text-2xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 tabular-nums">
                    {item.badge}
                  </span>
                )}
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
            )}
            {collapsed && item.badge && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          {!collapsed && isExpanded && (
            <div className="ml-4 mt-0.5 border-l border-border pl-2 space-y-0.5">
              {item.children!.map(child => (
                <Link
                  key={child.id}
                  href={child.href || '#'}
                  className={`nav-item text-sm ${isActive(child.href) ? 'active' : ''}`}
                >
                  <span className="flex-shrink-0">{child.icon}</span>
                  <span className="truncate">{child.label}</span>
                  {child.badge && (
                    <span className="ml-auto text-2xs font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5 tabular-nums">
                      {child.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href || '#'}
        className={`nav-item relative ${active ? 'active' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="truncate text-md">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-2xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 tabular-nums">
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`sidebar-transition flex-shrink-0 flex flex-col bg-card border-r border-border h-screen sticky top-0 overflow-hidden ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        title="Back to AstroParihar Main Website"
        className={`flex items-center justify-center border-b border-border flex-shrink-0 hover:bg-muted/40 transition-colors ${
          collapsed ? 'px-2 py-3.5' : 'px-3 py-3.5'
        }`}
      >
        <AppLogo
          src={collapsed ? "/assets/images/app_logo.png" : "/assets/images/AstroParihar_Logo-1786957316255.webp"}
          size={collapsed ? 30 : 42}
          imageClassName={collapsed ? "object-contain" : "object-contain max-w-[215px]"}
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
        {navItems.map(item => renderNavItem(item))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <button
          onClick={onToggle}
          className="btn-ghost w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : (
            <>
              <PanelLeftClose size={16} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}