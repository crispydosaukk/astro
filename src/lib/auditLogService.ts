'use client';

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
  category: 'auth' | 'candidate' | 'discovery' | 'outreach' | 'application' | 'review' | 'settings' | 'system';
}

const STORAGE_KEY = 'astroparihar_audit_logs';
export const AUDIT_EVENT_NAME = 'astroparihar_audit_log_updated';

// Realistic platform seed activity records
const SEED_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'audit-001',
    user: 'Priya Nair (Reviewer)',
    action: 'APPLICATION_REJECTED',
    entity: 'Candidate: Sandy',
    entityId: 'AP-2026-1477',
    timestamp: '2026-08-17 11:22:45',
    ipAddress: '192.168.1.42',
    details: 'Application rejected during 360° review due to failing score (12/100) and theory discrepancies.',
    category: 'review',
  },
  {
    id: 'audit-002',
    user: 'AI Proctoring Engine',
    action: 'CANDIDATE_DISQUALIFIED',
    entity: 'Candidate: Sandeep Sankranthi',
    entityId: 'AP-2026-7478',
    timestamp: '2026-08-17 10:45:12',
    ipAddress: '10.0.4.19',
    details: 'Automated disqualification triggered: 3+ tab-switch violations detected during 25-Question assessment.',
    category: 'application',
  },
  {
    id: 'audit-003',
    user: 'Suresh Menon (Reviewer)',
    action: 'REVIEW_ASSIGNED',
    entity: 'Candidate: Pandit Someshwar Rao',
    entityId: 'AP-2026-0001',
    timestamp: '2026-08-17 09:30:00',
    ipAddress: '192.168.1.88',
    details: 'High-priority dossier (AI Score: 91/100) assigned to Senior Vedic Reviewer Suresh Menon.',
    category: 'review',
  },
  {
    id: 'audit-004',
    user: 'Arjun Sharma (Admin)',
    action: 'ADMIN_LOGIN',
    entity: 'Console Session',
    entityId: 'SES-9921',
    timestamp: '2026-08-17 08:55:18',
    ipAddress: '192.168.1.10',
    details: 'Successful two-factor authenticated administrative sign-in to AstroParihar SuperAdmin console.',
    category: 'auth',
  },
  {
    id: 'audit-005',
    user: 'Autonomous Discovery Agent',
    action: 'CANDIDATES_DISCOVERED',
    entity: 'Campaign: Delhi Vedic Astrologers',
    entityId: 'CAMP-DELHI-04',
    timestamp: '2026-08-16 19:40:22',
    ipAddress: '10.0.1.5',
    details: 'Google Places discovery batch completed. 24 astrologer profiles discovered and scheduled for AI qualification.',
    category: 'discovery',
  },
  {
    id: 'audit-006',
    user: 'AI Scoring Engine',
    action: 'KUNDALI_EVALUATED',
    entity: 'Candidate: Rahul',
    entityId: 'AP-2026-2910',
    timestamp: '2026-08-16 16:15:30',
    ipAddress: '10.0.2.14',
    details: 'Kundali Case (Kanya Lagna / Shani Retrograde) evaluated. Astrological reasoning score: 53/100.',
    category: 'application',
  },
  {
    id: 'audit-007',
    user: 'Arjun Sharma (Admin)',
    action: 'OUTREACH_APPROVED',
    entity: 'Candidate: Pandit Someshwar Rao',
    entityId: 'CAND-001',
    timestamp: '2026-08-16 14:10:05',
    ipAddress: '192.168.1.10',
    details: 'Outreach email approved for dispatch with personalized Vedic credentials invitation.',
    category: 'outreach',
  },
  {
    id: 'audit-008',
    user: 'Outreach Dispatcher',
    action: 'EMAIL_DISPATCHED',
    entity: 'Template: Vedic Invitation V2',
    entityId: 'MSG-8841',
    timestamp: '2026-08-16 14:15:10',
    ipAddress: '10.0.3.2',
    details: 'Automated email invitation delivered to candidate via SMTP gateway with unique onboarding token.',
    category: 'outreach',
  },
  {
    id: 'audit-009',
    user: 'Priya Nair (Reviewer)',
    action: 'KYC_DOCUMENTS_VERIFIED',
    entity: 'Candidate: Pandit Someshwar Rao',
    entityId: 'DOC-901',
    timestamp: '2026-08-16 11:20:40',
    ipAddress: '192.168.1.42',
    details: 'Aadhaar identity card and ICAS Astrology Certification verified against official registry.',
    category: 'candidate',
  },
  {
    id: 'audit-010',
    user: 'System Gateway',
    action: 'SETTINGS_UPDATED',
    entity: 'AI Dashboard Settings',
    entityId: 'CONF-AI-Q15',
    timestamp: '2026-08-15 18:00:15',
    ipAddress: '127.0.0.1',
    details: 'Dynamic assessment configuration updated: Active pool set to 15 questions across 5 languages.',
    category: 'settings',
  },
  {
    id: 'audit-011',
    user: 'AI Interview Engine',
    action: 'INTERVIEW_COMPLETED',
    entity: 'Candidate: Pandit Someshwar Rao',
    entityId: 'INT-9912',
    timestamp: '2026-08-15 15:42:00',
    ipAddress: '10.0.2.14',
    details: 'Interactive audio AI interview concluded. Candidate demonstrated deep mastery of Parashari remedies.',
    category: 'application',
  },
  {
    id: 'audit-012',
    user: 'Suresh Menon (Reviewer)',
    action: 'STATUS_UPDATED',
    entity: 'Candidate: Rahul',
    entityId: 'AP-2026-2910',
    timestamp: '2026-08-15 12:30:10',
    ipAddress: '192.168.1.88',
    details: 'Status changed from "Under Screening" to "Review Required" for secondary chart remedy inspection.',
    category: 'candidate',
  },
  {
    id: 'audit-013',
    user: 'Arjun Sharma (Admin)',
    action: 'CAMPAIGN_LAUNCHED',
    entity: 'Campaign: Hyderabad Jyotish Drive',
    entityId: 'CAMP-HYD-01',
    timestamp: '2026-08-14 10:00:00',
    ipAddress: '192.168.1.10',
    details: 'Autonomous discovery job started targeting certified Jyotish Vidwan practitioners in Telangana.',
    category: 'discovery',
  },
  {
    id: 'audit-014',
    user: 'System Gateway',
    action: 'DATABASE_BACKUP_COMPLETED',
    entity: 'Firestore Collections',
    entityId: 'BAK-20260814',
    timestamp: '2026-08-14 04:00:00',
    ipAddress: '127.0.0.1',
    details: 'Scheduled cloud backup completed for candidates, applications, and astrologer registries.',
    category: 'system',
  },
];

/**
 * Retrieve all audit log entries, falling back to seed data if not yet initialized in localStorage
 */
export function getAuditLogs(): AuditEntry[] {
  if (typeof window === 'undefined') {
    return SEED_AUDIT_LOGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
    return SEED_AUDIT_LOGS;
  } catch (err) {
    console.warn('Failed to parse audit logs from storage:', err);
    return SEED_AUDIT_LOGS;
  }
}

/**
 * Append a new audit event and notify active subscribers
 */
export function logAuditEvent(
  entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress'> & {
    timestamp?: string;
    ipAddress?: string;
  }
): AuditEntry {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedTimestamp = entry.timestamp || 
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const fullEntry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: formattedTimestamp,
    ipAddress: entry.ipAddress || '192.168.1.42',
    ...entry,
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getAuditLogs();
      const updated = [fullEntry, ...current].slice(0, 300); // Retain latest 300 entries
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(AUDIT_EVENT_NAME, { detail: fullEntry }));
    } catch (err) {
      console.warn('Failed to persist audit entry:', err);
    }
  }

  return fullEntry;
}

/**
 * Calculate dynamic KPIs for audit logs dashboard
 */
export function getAuditStats(logs: AuditEntry[]): {
  total: number;
  today: number;
  uniqueUsers: number;
  categories: number;
} {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayPrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const todayCount = logs.filter(l => 
    l.timestamp.startsWith(todayPrefix) || 
    l.timestamp.startsWith('2026-08-17') // Included for demonstration continuity
  ).length;

  const uniqueUsers = new Set(logs.map(l => l.user)).size;
  const categories = new Set(logs.map(l => l.category)).size;

  return {
    total: logs.length,
    today: todayCount,
    uniqueUsers,
    categories,
  };
}

/**
 * Reset audit logs to default seeded state
 */
export function resetAuditLogs(): AuditEntry[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
    window.dispatchEvent(new CustomEvent(AUDIT_EVENT_NAME));
  }
  return SEED_AUDIT_LOGS;
}
