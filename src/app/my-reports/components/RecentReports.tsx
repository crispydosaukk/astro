'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Eye,
  Gem,
  Music,
  Triangle,
  Flame,
  ArrowRight,
  X,
  Loader2,
  Sparkles,
  ShieldCheck,
  Compass,
  BookOpen,
  Heart,
  Coins,
  Activity,
  PhoneCall,
  Bot,
  Lock,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAllMahadashaGuides, MahadashaGuide } from '@/lib/mahadasha';
import Pagination from '@/components/ui/Pagination';
import VedicSquareChart from '@/components/VedicSquareChart';

export class ReportErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ReportErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <p className="text-sm font-bold text-[#C9952B]">
              Vedic Report Insights
            </p>
            <p className="text-xs text-muted-foreground">
              Report rendered with standard formatting. All your calculations are safely recorded.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export function renderSafeText(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val.map((item) => renderSafeText(item)).filter(Boolean).join(', ');
  }
  if (typeof val === 'object') {
    if (val.name || val.title || val.text || val.label) {
      return String(val.name || val.title || val.text || val.label);
    }
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
  }
  return String(val);
}

export function renderAdditionalGuidance(guidance: any) {
  if (!guidance) return null;
  if (typeof guidance === 'string') {
    return (
      <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
        {guidance}
      </p>
    );
  }
  if (typeof guidance === 'object') {
    return (
      <div className="space-y-3.5 text-xs sm:text-sm">
        {/* Do's */}
        {guidance.dos && (
          <div className="space-y-2 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>✓</span> Recommended Do&apos;s
            </span>
            {Array.isArray(guidance.dos) ? (
              <ul className="space-y-1.5 pl-1">
                {guidance.dos.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90 leading-relaxed">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{renderSafeText(item)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground/90 leading-relaxed">{renderSafeText(guidance.dos)}</p>
            )}
          </div>
        )}

        {/* Don'ts */}
        {guidance.donts && (
          <div className="space-y-2 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠</span> Precautions &amp; Don&apos;ts
            </span>
            {Array.isArray(guidance.donts) ? (
              <ul className="space-y-1.5 pl-1">
                {guidance.donts.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90 leading-relaxed">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{renderSafeText(item)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-foreground/90 leading-relaxed">{renderSafeText(guidance.donts)}</p>
            )}
          </div>
        )}

        {/* Cleansing Frequency */}
        {(guidance.cleansingFrequency || guidance.cleansing) && (
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              Gemstone Cleansing &amp; Re-energization Frequency
            </span>
            <p className="text-foreground font-medium leading-relaxed">
              {renderSafeText(guidance.cleansingFrequency || guidance.cleansing)}
            </p>
          </div>
        )}

        {/* Compatible Secondary Gemstones */}
        {(guidance.compatibleSecondaryGemstones ||
          guidance.compatibleGemstones ||
          guidance.secondaryGemstones) && (
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-[#C9952B] uppercase font-bold block">
              Compatible Secondary Gemstones
            </span>
            <p className="text-foreground font-medium leading-relaxed">
              {renderSafeText(
                guidance.compatibleSecondaryGemstones ||
                  guidance.compatibleGemstones ||
                  guidance.secondaryGemstones
              )}
            </p>
          </div>
        )}

        {/* Other fields */}
        {Object.entries(guidance)
          .filter(
            ([k]) =>
              ![
                'dos',
                'donts',
                'cleansingFrequency',
                'cleansing',
                'compatibleSecondaryGemstones',
                'compatibleGemstones',
                'secondaryGemstones',
              ].includes(k)
          )
          .map(([k, v]) => (
            <div key={k} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block capitalize">
                {k.replace(/([A-Z])/g, ' $1')}
              </span>
              <p className="text-foreground leading-relaxed">{renderSafeText(v)}</p>
            </div>
          ))}
      </div>
    );
  }
  return (
    <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
      {renderSafeText(guidance)}
    </p>
  );
}

export function parseReportTimestamp(item: any): number {
  if (!item) return 0;
  const raw =
    item.createdAt ??
    item.timestamp ??
    item.date ??
    item.updatedAt ??
    item.details?.createdAt ??
    item.details?.date;

  if (!raw) return 0;

  // 1. Firestore Timestamp instance (has toMillis or toDate)
  if (typeof raw.toMillis === 'function') {
    try {
      const val = raw.toMillis();
      if (typeof val === 'number' && !isNaN(val)) return val;
    } catch {}
  }
  if (typeof raw.toDate === 'function') {
    try {
      const d = raw.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d.getTime();
    } catch {}
  }

  // 2. Serialized Firestore Timestamp object { seconds, nanoseconds } or { _seconds, _nanoseconds }
  if (typeof raw === 'object') {
    if (typeof raw.seconds === 'number') return raw.seconds * 1000;
    if (typeof raw._seconds === 'number') return raw._seconds * 1000;
  }

  // 3. Date instance
  if (raw instanceof Date) {
    const t = raw.getTime();
    if (!isNaN(t)) return t;
  }

  // 4. Numeric timestamp (millis or seconds)
  if (typeof raw === 'number' && !isNaN(raw)) {
    return raw < 1e11 ? raw * 1000 : raw;
  }

  // 5. String (ISO 8601 or parsed date string)
  if (typeof raw === 'string') {
    const parsed = Date.parse(raw);
    if (!isNaN(parsed)) return parsed;
  }

  return 0;
}

export default function RecentReports() {
  const { user } = useUserData();
  const [reports, setReports] = useState<any[]>([]);
  const [mahadashaGuides, setMahadashaGuides] = useState<Record<string, MahadashaGuide>>({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'services' | 'remedies' | 'mahadasha'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchReportsAndGuides() {
      const uid = user?.uid || 'demo-user-id';
      try {
        // Fetch dynamic guide configuration set by Admin in Dashboard
        const guidesList = await getAllMahadashaGuides();
        const guidesMap: Record<string, MahadashaGuide> = {};
        guidesList.forEach((g) => {
          guidesMap[g.id] = g;
        });
        setMahadashaGuides(guidesMap);

        // Fetch user's completed reports from Firestore
        const q = query(collection(db, 'service_requests'), where('userId', '==', uid));
        const querySnapshot = await getDocs(q);
        const fetchedReports: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() });
        });

        // Filter completed & sort by date descending (latest first)
        const sortedReports = fetchedReports
          .filter((rep) => !rep.status || rep.status === 'completed' || rep.status === 'ready')
          .sort((a, b) => {
            const timeA = parseReportTimestamp(a);
            const timeB = parseReportTimestamp(b);
            if (timeB !== timeA) return timeB - timeA;
            return String(b.id || '').localeCompare(String(a.id || ''));
          });

        setReports(sortedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchReportsAndGuides();
    } else if (user === null) {
      setLoading(false);
    }
  }, [user]);

  const getReportCategory = (type: any = ''): 'services' | 'remedies' | 'mahadasha' => {
    const t = String(type || '');
    if (t.includes('Guide') || t.includes('Mahadasha') || t.includes('PDF')) {
      return 'mahadasha';
    }
    if (
      t.includes('Gemstone') ||
      t.includes('Mantra') ||
      t.includes('Yantra') ||
      t.includes('Yanthra') ||
      t.includes('Homam') ||
      t.includes('Remedies')
    ) {
      return 'remedies';
    }
    return 'services';
  };

  const getGuidePdfUrl = (rep: any): string => {
    if (rep.details?.pdfUrl) return rep.details.pdfUrl;
    if (rep.details?.guideId && mahadashaGuides[rep.details.guideId]) {
      return mahadashaGuides[rep.details.guideId].pdfUrl;
    }
    const t = String(rep.type || '');
    if (t.includes('Rahu') && t.includes('Survival')) {
      return (
        mahadashaGuides['rahu-survival']?.pdfUrl || '/assets/pdfs/rahu_mahadasha_survival_guide.pdf'
      );
    }
    if (t.includes('Rahu')) {
      return (
        mahadashaGuides['rahu-stabilisation']?.pdfUrl ||
        '/assets/pdfs/rahu_mahadasha_stabilisation_guide.pdf'
      );
    }
    if (t.includes('Sani') && t.includes('Survival')) {
      return (
        mahadashaGuides['sani-survival']?.pdfUrl || '/assets/pdfs/sani_mahadasha_survival_guide.pdf'
      );
    }
    if (t.includes('Sani')) {
      return (
        mahadashaGuides['sani-stabilisation']?.pdfUrl ||
        '/assets/pdfs/sani_mahadasha_stabilisation_guide.pdf'
      );
    }
    return '/assets/pdfs/rahu_mahadasha_stabilisation_guide.pdf';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      if (typeof timestamp.toDate === 'function') {
        const d = timestamp.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
      if (typeof timestamp === 'object' && typeof timestamp.seconds === 'number') {
        const d = new Date(timestamp.seconds * 1000);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const getIconForType = (type: any = '') => {
    const t = String(type || '');
    if (t.includes('Guide') || t.includes('Mahadasha')) return ShieldCheck;
    if (t.includes('Homam')) return Flame;
    if (t.includes('Gemstone')) return Gem;
    if (t.includes('Mantra')) return Music;
    if (t.includes('Yantra') || t.includes('Yanthra')) return Triangle;
    if (t.includes('Love') || t.includes('Relationship')) return Heart;
    if (t.includes('Finance') || t.includes('Wealth')) return Coins;
    if (t.includes('Health') || t.includes('Vitality')) return Activity;
    if (t.includes('Kundli') || t.includes('Horoscope')) return Sparkles;
    return FileText;
  };

  const getColorClassForType = (type: any = '') => {
    const t = String(type || '');
    if (t.includes('Guide') || t.includes('Mahadasha')) return 'text-amber-400';
    if (t.includes('Homam')) return 'text-orange-400';
    if (t.includes('Gemstone')) return 'text-red-400';
    if (t.includes('Mantra')) return 'text-blue-400';
    if (t.includes('Yantra') || t.includes('Yanthra')) return 'text-green-400';
    if (t.includes('Love') || t.includes('Relationship')) return 'text-rose-400';
    if (t.includes('Finance') || t.includes('Wealth')) return 'text-emerald-400';
    if (t.includes('Health') || t.includes('Vitality')) return 'text-cyan-400';
    return 'text-purple-400';
  };

  const getBgClassForType = (type: any = '') => {
    const t = String(type || '');
    if (t.includes('Guide') || t.includes('Mahadasha')) return 'bg-amber-500/10';
    if (t.includes('Homam')) return 'bg-orange-500/10';
    if (t.includes('Gemstone')) return 'bg-red-500/10';
    if (t.includes('Mantra')) return 'bg-blue-500/10';
    if (t.includes('Yantra') || t.includes('Yanthra')) return 'bg-green-500/10';
    if (t.includes('Love') || t.includes('Relationship')) return 'bg-rose-500/10';
    if (t.includes('Finance') || t.includes('Wealth')) return 'bg-emerald-500/10';
    if (t.includes('Health') || t.includes('Vitality')) return 'bg-cyan-500/10';
    return 'bg-purple-500/10';
  };

  // Strictly sort reports latest/newest first
  const sortedReportsList = [...reports].sort((a, b) => {
    const timeA = parseReportTimestamp(a);
    const timeB = parseReportTimestamp(b);
    if (timeB !== timeA) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  const filteredReports = sortedReportsList.filter((rep) => {
    if (activeCategory === 'all') return true;
    return getReportCategory(rep.type) === activeCategory;
  });

  const servicesCount = sortedReportsList.filter((r) => getReportCategory(r.type) === 'services').length;
  const remediesCount = sortedReportsList.filter((r) => getReportCategory(r.type) === 'remedies').length;
  const mahadashaCount = sortedReportsList.filter((r) => getReportCategory(r.type) === 'mahadasha').length;

  return (
    <>
      <div
        id="recent-reports"
        className="glass-card-light dark:glass-card rounded-3xl border border-border overflow-hidden space-y-4"
      >
        {/* Header with Title */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              My Astrological Reports & Purchased PDF Guides
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categorized view of your services reports, remedies, and Mahadasha PDF guides
            </p>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-1.5 text-xs font-bold text-[#C9952B] hover:underline"
          >
            Generate New Report <ArrowRight size={12} />
          </Link>
        </div>

        {/* Divided Category Tabs: Services, Remedies, Mahadasha PDF Guides */}
        <div className="px-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/50 no-scrollbar">
          {[
            { id: 'all', label: `All Orders (${sortedReportsList.length})` },
            { id: 'services', label: `Services Reports (${servicesCount})` },
            { id: 'remedies', label: `Remedies (${remediesCount})` },
            { id: 'mahadasha', label: `Mahadasha PDF Guides (${mahadashaCount})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'gold-gradient-bg text-white shadow-lg'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[220px]">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-[#C9952B]" size={28} />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#C9952B]/15 border border-[#C9952B]/30 flex items-center justify-center text-[#C9952B] shadow-sm">
                <Lock size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Please Sign In to View Your Reports
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Access all your personalized Vedic chart analysis, remedy reports, and unlocked Mahadasha guides in one place.
                </p>
              </div>
              <Link
                href="/sign-up-login-screen?redirect=/my-reports"
                className="px-6 py-2.5 rounded-full gold-gradient-bg text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-90 transition-all flex items-center gap-2"
              >
                <LogIn size={15} /> Sign In to Your Account
              </Link>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-2">
              <FileText size={36} className="opacity-40" />
              <p className="font-semibold">No reports or guides found in this category.</p>
              <Link href="/services" className="text-xs font-bold text-[#C9952B] hover:underline">
                Explore Services & PDF Guides →
              </Link>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Report / Order Name
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rep, i) => {
                  const Icon = getIconForType(rep.type);
                  const category = getReportCategory(rep.type);

                  return (
                    <motion.tr
                      key={rep.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${getBgClassForType(rep.type)} flex items-center justify-center shrink-0`}
                          >
                            <Icon size={16} className={getColorClassForType(rep.type)} />
                          </div>
                          <div>
                            <span className="font-bold text-foreground text-sm block">
                              {renderSafeText(rep.type || 'Custom Report')}
                            </span>
                            {rep.details?.name && (
                              <span className="text-[11px] text-muted-foreground">
                                For: {renderSafeText(rep.details.name)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            category === 'mahadasha'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : category === 'remedies'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {category === 'mahadasha'
                            ? 'PDF Guide'
                            : category === 'remedies'
                              ? 'Remedy'
                              : 'Service'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {formatDate(rep.createdAt || rep.timestamp || rep.date || rep.details?.createdAt || rep.details?.date)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400">
                          Ready
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-all hover:text-[#C9952B] text-xs font-semibold inline-flex items-center gap-1.5 border border-white/10"
                          title="View Report Details"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            <div className="px-6 pb-2">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(filteredReports.length / itemsPerPage))}
                totalItems={filteredReports.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="reports"
              />
            </div>
          </>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedReport && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 print:p-0 print:static print:inset-auto print:z-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm print:hidden"
                  onClick={() => setSelectedReport(null)}
                />
                <motion.div
                  id="report-pdf-content"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-3xl max-h-[85vh] print:max-h-none print:h-auto print:shadow-none print:border-none print:bg-transparent bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden print:overflow-visible z-10"
                >
                  {/* Print Header with Logo */}
                  <div className="hidden print:flex flex-col items-center justify-center pb-6 mb-6 border-b-2 border-black">
                    <img
                      src="/astrologo.png"
                      alt="AstroParihar Logo"
                      className="h-32 object-contain"
                    />
                  </div>

                  <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between bg-muted/30 print:bg-transparent print:border-none print:p-0">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground print:text-black">
                        {selectedReport.type}
                      </h3>
                      {selectedReport.details?.dob && (
                        <p className="text-sm text-muted-foreground mt-1 print:text-gray-600">
                          Generated for {selectedReport.details?.dob} |{' '}
                          {selectedReport.details?.time} | {selectedReport.details?.place}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="pdf-exclude p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground print:hidden"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="overflow-y-auto custom-scrollbar print:overflow-visible print:h-auto">
                    <div className="p-4 sm:p-6 space-y-6 print:p-0 print:py-6">
                      <ReportErrorBoundary
                        fallback={
                          <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30 flex items-center justify-center text-[#C9952B] text-xl font-bold">
                              📜
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-foreground">
                                {renderSafeText(selectedReport.type || 'Astrological Report')}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Complete astrological calculations and report details:
                              </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                              {typeof selectedReport.reportContent === 'string'
                                ? selectedReport.reportContent
                                : JSON.stringify(selectedReport.reportContent, null, 2)}
                            </div>
                          </div>
                        }
                      >
                      {getReportCategory(selectedReport.type) === 'mahadasha' ? (
                        <div className="space-y-4">
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EDE4D5] dark:bg-amber-950/40 border border-[#E5D9C8] dark:border-amber-500/30 flex items-center justify-between flex-wrap gap-3 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-950 dark:text-amber-200 font-bold text-sm shadow-inner">
                                📄
                              </span>
                              <div>
                                <span className="text-[#292522] dark:text-amber-100 font-bold text-xs sm:text-sm block">
                                  Official Admin Uploaded PDF Document
                                </span>
                                <span className="text-[11px] text-[#713B32] dark:text-amber-300/80 font-medium block">
                                  Kundli Mahadasha calculations & Vedic analysis guide
                                </span>
                              </div>
                            </div>
                            <a
                              href={getGuidePdfUrl(selectedReport)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg hover:opacity-95 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <span>Open PDF in New Window</span>
                              <span className="text-sm font-black">↗</span>
                            </a>
                          </div>
                          <iframe
                            src={getGuidePdfUrl(selectedReport)}
                            title={selectedReport.type}
                            className="w-full h-[60vh] sm:h-[65vh] rounded-2xl border border-border bg-white shadow-inner"
                          />
                        </div>
                      ) : (
                        (() => {
                          try {
                            const data =
                              typeof selectedReport.reportContent === 'string'
                                ? JSON.parse(selectedReport.reportContent)
                                : selectedReport.reportContent;

                            if (data) {
                              const recTitle =
                                typeof data.recommendationTitle === 'string'
                                  ? data.recommendationTitle.toLowerCase()
                                  : '';
                              const repType =
                                typeof selectedReport.type === 'string'
                                  ? selectedReport.type.toLowerCase()
                                  : '';

                              const isKundliMatching =
                                repType.includes('matching') ||
                                recTitle.includes('matching') ||
                                !!data.ashtakoot;

                              const isJanamKundli =
                                repType.includes('janam kundli') ||
                                repType.includes('horoscope') ||
                                !!data.planetaryDegrees ||
                                !!data.ascendant;

                              const isPanchang =
                                repType.includes('panchang') ||
                                !!data.tithi ||
                                !!data.rahuKaal;

                              const isFasting =
                                repType.includes('fasting') ||
                                !!data.recommendedVrats ||
                                !!data.weeklyFastingDay;

                              const isVastu =
                                repType.includes('vastu') ||
                                repType.includes('vāstu') ||
                                !!data.directionalAnalysis ||
                                !!data.propertySummary;

                              const isHomam =
                                repType.includes('homa') ||
                                repType.includes('homam') ||
                                repType.includes('hawan') ||
                                repType.includes('havan') ||
                                repType.includes('puja') ||
                                recTitle.includes('homa') ||
                                recTitle.includes('homam') ||
                                recTitle.includes('hawan') ||
                                !!data.recommendedHoma ||
                                !!data.primaryHomam;

                              const homamData =
                                data.recommendedHoma && typeof data.recommendedHoma === 'object'
                                  ? data.recommendedHoma
                                  : data.primaryHomam && typeof data.primaryHomam === 'object'
                                  ? data.primaryHomam
                                  : isHomam
                                  ? {
                                      name:
                                        typeof data.recommendedHoma === 'string'
                                          ? data.recommendedHoma
                                          : 'Lakshmi Kubera Homam & Navagraha Shanti Homam',
                                      purpose:
                                        'Balance planetary energies, remove deep karmic obstacles, and invoke divine blessings',
                                      day: 'Auspicious Friday or Saturday during Shukla Paksha',
                                      duration: '2–3 hours',
                                      deity: 'Goddess Mahalakshmi & Navagraha Devatas',
                                      ahutiMantra:
                                        'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः स्वाहा ॥ & ॐ ब्रह्मा मुरारिस्त्रिपुरान्तकारी... स्वाहा ॥',
                                      japaCount: '108 Sacred Ahutis into holy Agni Kund',
                                      samidha: 'Bilva samidha, Kamal Gatta, Mango wood, Navadhanya',
                                      materials:
                                        'Pure Cow Ghee, Dry Coconut (Purna Ahuti), Camphor, Havan Samagri (32 sacred herbs), Red/Yellow Silk Cloth',
                                      procedure:
                                        '1. Maha Sankalpa with Gotra & Nakshatra.\n2. Ganapathi Avahana and Mandapa Sthapana.\n3. 108 Ahutis with consecrated samidha and cow ghee.\n4. Maha Purna Ahuti with dry coconut.\n5. Application of sacred Raksha Bhasma on forehead.',
                                      benefits:
                                        'Burns away karmic afflictions, clears long-standing debt/career blocks, and radiates divine peace throughout the household.',
                                    }
                                  : null;

                              const isYantra =
                                repType.includes('yantra') ||
                                repType.includes('yanthra') ||
                                recTitle.includes('yantra') ||
                                recTitle.includes('yanthra') ||
                                !!data.primaryYantra ||
                                !!data.prescribedYantras ||
                                !!data.secondaryYantras;

                              const yantraData =
                                data.primaryYantra ||
                                (isYantra
                                  ? {
                                      name: 'श्री यन्त्र (Shree Yantra) & कुबेर यन्त्र (Kubera Yantra)',
                                      deity: 'Goddess Mahalakshmi & Lord Kubera',
                                      planet: 'Venus (Shukra) & Jupiter (Guru)',
                                      material:
                                        'Heavy Consecrated Copper Plate (Tamra Patra) / Ashtadhatu',
                                      geometry:
                                        'Sacred Nine Interlocking Triangles forming 43 Triads with Central Bindu',
                                      placementDirection:
                                        'North-East (Ishanya Kona) or North Wall, at eye level on sacred altar',
                                      activationMuhurat:
                                        'Shukla Paksha Friday or Sunday morning during Brahma Muhurta (Sunrise)',
                                      consecrationMantra:
                                        'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥ (Om Shreem Hreem Kleem Mahalakshmaye Namah)',
                                      japaCount: '108 Recitations during Prana Pratishtha',
                                      benefits:
                                        'Attracts auspicious abundance, harmonizes spatial energy lines, removes monetary obstacles, and continuously radiates positive vibrational geometry.',
                                    }
                                  : null);

                              const secondaryYantras =
                                data.secondaryYantras ||
                                data.prescribedYantras ||
                                (isYantra
                                  ? [
                                      {
                                        name: 'Surya Yantra (सूर्य यन्त्र)',
                                        deity: 'Lord Surya Bhagavan',
                                        planet: 'Sun (Surya)',
                                        placement: 'East Wall of living area or pooja room',
                                        purpose:
                                          'Amplifies willpower, leadership, vitality, and social renown.',
                                      },
                                      {
                                        name: 'Navagraha Yantra (नवग्रह यन्त्र)',
                                        deity: 'Nine Celestial Grahas',
                                        planet: 'All Nine Planetary Deities',
                                        placement: 'Pooja room altar facing East or North',
                                        purpose:
                                          'Harmonizes transit clashes and neutralizes afflicted planetary Dasha cycles.',
                                      },
                                    ]
                                  : null);

                              const displayProcedure =
                                isYantra &&
                                (!data.procedure ||
                                  (typeof data.procedure === 'string' &&
                                    data.procedure.includes('Surya Arghya')))
                                  ? '1. Purify the consecrated Yantra plate with Gangajal and raw cow milk at sunrise.\n2. Lay on a red or yellow consecrated silk cloth on your sacred altar facing East or North.\n3. Anoint the central sacred Bindu with pure Sandalwood (Chandan) and Kumkum.\n4. Light a pure cow ghee diya and fragrant Guggal/Chandan incense.\n5. Recite the activation Beej Mantra "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः" 108 times using a Sphatik or Rudraksha mala.\n6. Offer fresh fragrant yellow or white flowers and sweet naivedyam.'
                                  : data.procedure;

                              const displayMaterials =
                                isYantra &&
                                (!data.materials ||
                                  (typeof data.materials === 'string' &&
                                    !data.materials.toLowerCase().includes('yantra')))
                                  ? 'Consecrated Copper / Ashtadhatu Yantra Plate, Pure Gangajal, Raw Cow Milk, Sandalwood Paste, Kumkum, Cow Ghee Diya, Sphatik Mala, Red Silk Asana'
                                  : data.materials;

                              const displayAnalysis =
                                isYantra &&
                                typeof data.astrologicalAnalysis === 'string' &&
                                data.astrologicalAnalysis.includes(
                                  'Chanting your personalized mantra ensures protection'
                                )
                                  ? data.astrologicalAnalysis.replace(
                                      'Chanting your personalized mantra ensures protection and success.',
                                      'Installing and worshiping your personalized consecrated Yantra creates a protective energetic shield and harmonizes spatial cosmic geometry to manifest peace and prosperity.'
                                    )
                                  : data.astrologicalAnalysis || data.description;

                              return (
                                <div className="space-y-6">
                                  {/* Primary Header Card */}
                                  <div className="p-5 sm:p-6 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30 print:break-inside-avoid print:border-gray-300 print:bg-transparent space-y-2">
                                    <p className="text-xs text-[#C9952B] font-semibold uppercase tracking-wider print:text-black">
                                      {renderSafeText(data.recommendationTitle || selectedReport.type)}
                                    </p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground print:text-black">
                                      {renderSafeText(data.recommendationName || selectedReport.type)}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2 print:text-gray-700">
                                      {renderSafeText(data.timing || 'Active')}{' '}
                                      {data.duration &&
                                        data.duration !== 'N/A' &&
                                        `· ${renderSafeText(data.duration)}`}
                                    </p>
                                  </div>

                                  {/* VASTU CONSULTATION SPECIFIC VIEW */}
                                  {isVastu && (
                                    <div className="space-y-6">
                                      {/* Property Summary Bar */}
                                      {data.propertySummary && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Property Type
                                            </span>
                                            <p className="text-xs sm:text-sm font-bold text-foreground">
                                              {data.propertySummary.propertyType}
                                            </p>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Entrance Facing
                                            </span>
                                            <p className="text-xs sm:text-sm font-bold text-[#C9952B]">
                                              {data.propertySummary.entranceFacing}
                                            </p>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Spatial Score
                                            </span>
                                            <p className="text-xs sm:text-sm font-bold text-emerald-400">
                                              {data.propertySummary.overallEnergyScore ||
                                                '84/100 (Auspicious)'}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* 8-Direction Zone Alignment Grid */}
                                      {data.directionalAnalysis &&
                                        Array.isArray(data.directionalAnalysis) && (
                                          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                              <Compass size={16} className="text-[#C9952B]" />{' '}
                                              8-Directional Energy &amp; Remedial Audit
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              {data.directionalAnalysis.map(
                                                (dir: any, idx: number) => (
                                                  <div
                                                    key={idx}
                                                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs"
                                                  >
                                                    <div className="flex justify-between items-center font-bold">
                                                      <span className="text-foreground">
                                                        {dir.direction}
                                                      </span>
                                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/30">
                                                        {dir.status}
                                                      </span>
                                                    </div>
                                                    <p className="text-muted-foreground leading-relaxed">
                                                      {dir.observation}
                                                    </p>
                                                    <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-[11px] text-[#C9952B] font-medium">
                                                      ✨ <strong>Remedy:</strong> {dir.remedy}
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {/* Non-Demolition Dosha Corrections */}
                                      {data.doshaCorrections &&
                                        Array.isArray(data.doshaCorrections) && (
                                          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                              <ShieldCheck size={16} className="text-emerald-400" />{' '}
                                              Non-Demolition Rectification Protocols
                                            </h3>
                                            <div className="space-y-2">
                                              {data.doshaCorrections.map(
                                                (corr: string, idx: number) => (
                                                  <div
                                                    key={idx}
                                                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground leading-relaxed flex items-start gap-2"
                                                  >
                                                    <span className="text-emerald-400 font-bold">
                                                      ✓
                                                    </span>
                                                    <span>{corr}</span>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {/* 1. KUNDLI MATCHING SPECIFIC REPORT VIEW */}
                                  {isKundliMatching && (
                                    <div className="space-y-6">
                                      {/* Score Box */}
                                      <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3 shadow-sm">
                                        <div className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">
                                          Total Gun Milan Compatibility Score
                                        </div>
                                        <div className="text-5xl font-black text-gradient-gold font-mono">
                                          {data.totalScore !== undefined ? data.totalScore : 29.5}{' '}
                                          <span className="text-xl text-muted-foreground">
                                            / 36
                                          </span>
                                        </div>
                                        <p className="text-emerald-400 font-bold text-base">
                                          {data.status || 'Highly Compatible'}
                                        </p>
                                        {data.verdict && (
                                          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed pt-1">
                                            {data.verdict}
                                          </p>
                                        )}

                                        {/* Planetary Signs & Manglik Analysis */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left">
                                          {data.groomAstro && (
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                              <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                                Your Planetary Alignment
                                              </div>
                                              <div className="text-xs font-bold text-[#C9952B]">
                                                {data.groomAstro.rashiName}
                                              </div>
                                              <div className="text-[11px] text-muted-foreground">
                                                {data.groomAstro.nakshatraName} ·{' '}
                                                {data.groomAstro.gana} Gana · {data.groomAstro.nadi}{' '}
                                                Nadi
                                              </div>
                                            </div>
                                          )}

                                          {data.brideAstro && (
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                              <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                                Partner's Planetary Alignment
                                              </div>
                                              <div className="text-xs font-bold text-rose-400">
                                                {data.brideAstro.rashiName}
                                              </div>
                                              <div className="text-[11px] text-muted-foreground">
                                                {data.brideAstro.nakshatraName} ·{' '}
                                                {data.brideAstro.gana} Gana · {data.brideAstro.nadi}{' '}
                                                Nadi
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {data.manglikStatus && (
                                          <div className="p-3 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 text-xs text-left">
                                            <span className="font-bold text-[#C9952B]">
                                              Manglik Compatibility:{' '}
                                            </span>
                                            <span className="text-foreground/90">
                                              {data.manglikStatus.summary}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Ashtakoot Grid */}
                                      {data.ashtakoot && Array.isArray(data.ashtakoot) && (
                                        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                                          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                            <Sparkles size={16} className="text-[#C9952B]" />{' '}
                                            Ashtakoot 8-Factor Breakdown
                                          </h3>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {data.ashtakoot.map((kootItem: any, idx: number) => (
                                              <div
                                                key={idx}
                                                className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1"
                                              >
                                                <div className="flex justify-between items-center">
                                                  <span className="font-bold text-foreground text-xs">
                                                    {kootItem.koot}
                                                  </span>
                                                  <span className="text-xs font-bold text-[#C9952B]">
                                                    {kootItem.score}
                                                  </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                  {kootItem.desc}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* 2. JANAM KUNDLI / HOROSCOPE SPECIFIC VIEW */}
                                  {isJanamKundli && (
                                    <div className="space-y-6">
                                      {/* Kundli Key Pillars */}
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {data.ascendant && (
                                          <div className="p-3 rounded-xl bg-card border border-border text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Lagna (Ascendant)
                                            </div>
                                            <div className="text-xs font-bold text-[#C9952B] mt-0.5">
                                              {data.ascendant}
                                            </div>
                                          </div>
                                        )}
                                        {data.moonSign && (
                                          <div className="p-3 rounded-xl bg-card border border-border text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Moon Sign (Rashi)
                                            </div>
                                            <div className="text-xs font-bold text-foreground mt-0.5">
                                              {data.moonSign}
                                            </div>
                                          </div>
                                        )}
                                        {data.sunSign && (
                                          <div className="p-3 rounded-xl bg-card border border-border text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Sun Sign (Surya)
                                            </div>
                                            <div className="text-xs font-bold text-foreground mt-0.5">
                                              {data.sunSign}
                                            </div>
                                          </div>
                                        )}
                                        {data.nakshatra && (
                                          <div className="p-3 rounded-xl bg-card border border-border text-center">
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                              Birth Nakshatra
                                            </div>
                                            <div className="text-xs font-bold text-emerald-400 mt-0.5">
                                              {data.nakshatra}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Vedic Square Birth Chart */}
                                      {(data.planetaryDegrees || data.ascendant) && (
                                        <div className="p-5 rounded-2xl bg-card border border-border">
                                          <VedicSquareChart chartData={data} chartType="D1" />
                                        </div>
                                      )}

                                      {/* Planetary Positions Table */}
                                      {data.planetaryDegrees &&
                                        Array.isArray(data.planetaryDegrees) && (
                                          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                                            <h3 className="text-sm font-bold text-foreground">
                                              Planetary Positions & House Placements
                                            </h3>
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-xs">
                                                <thead>
                                                  <tr className="border-b border-border text-muted-foreground text-left">
                                                    <th className="pb-2">Planet</th>
                                                    <th className="pb-2">Rashi</th>
                                                    <th className="pb-2">Degree</th>
                                                    <th className="pb-2">House</th>
                                                    <th className="pb-2 text-right">Status</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                  {data.planetaryDegrees.map(
                                                    (p: any, idx: number) => (
                                                      <tr key={idx} className="hover:bg-white/5">
                                                        <td className="py-2 font-semibold text-foreground">
                                                          {p.planet}
                                                        </td>
                                                        <td className="py-2 text-muted-foreground">
                                                          {p.rashi}
                                                        </td>
                                                        <td className="py-2 font-mono text-[#C9952B]">
                                                          {p.degree}
                                                        </td>
                                                        <td className="py-2 text-muted-foreground">
                                                          {p.house}
                                                        </td>
                                                        <td className="py-2 text-right font-medium text-emerald-400">
                                                          {p.status}
                                                        </td>
                                                      </tr>
                                                    )
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {/* 3. PANCHANG SPECIFIC VIEW */}
                                  {isPanchang && (
                                    <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <Sparkles size={16} className="text-[#C9952B]" /> Panchang
                                        Key Calculations
                                      </h3>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        {data.tithi && (
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Tithi
                                            </span>
                                            <span className="font-semibold text-foreground">
                                              {data.tithi}
                                            </span>
                                          </div>
                                        )}
                                        {data.nakshatra && (
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Nakshatra
                                            </span>
                                            <span className="font-semibold text-foreground">
                                              {data.nakshatra}
                                            </span>
                                          </div>
                                        )}
                                        {data.yoga && (
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Yoga
                                            </span>
                                            <span className="font-semibold text-foreground">
                                              {data.yoga}
                                            </span>
                                          </div>
                                        )}
                                        {data.karana && (
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Karana
                                            </span>
                                            <span className="font-semibold text-foreground">
                                              {data.karana}
                                            </span>
                                          </div>
                                        )}
                                        {data.abhijitMuhurat && (
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Abhijit Muhurat
                                            </span>
                                            <span className="font-semibold text-emerald-400">
                                              {data.abhijitMuhurat}
                                            </span>
                                          </div>
                                        )}
                                        {data.rahuKaal && (
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Rahu Kaal
                                            </span>
                                            <span className="font-semibold text-red-400">
                                              {data.rahuKaal}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 4. FASTING PLANNER SPECIFIC VIEW */}
                                  {isFasting &&
                                    data.recommendedVrats &&
                                    Array.isArray(data.recommendedVrats) && (
                                      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                                        <h3 className="text-sm font-bold text-foreground">
                                          Recommended Vrats & Fasting Schedule
                                        </h3>
                                        <div className="space-y-3">
                                          {data.recommendedVrats.map((vrat: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs"
                                            >
                                              <div className="flex justify-between items-center font-bold text-foreground">
                                                <span className="text-[#C9952B]">{vrat.name}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                                  {vrat.frequency}
                                                </span>
                                              </div>
                                              <p className="text-muted-foreground leading-relaxed">
                                                {vrat.benefit}
                                              </p>
                                              <p className="text-foreground/90 text-[11px] pt-1">
                                                <strong>Ritual:</strong> {vrat.ritual}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Common Astrological Analysis Section */}
                                  {displayAnalysis && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300 space-y-2">
                                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider print:text-black">
                                        Astrological Insights & Analysis
                                      </p>
                                      <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line print:text-black">
                                        {renderSafeText(displayAnalysis)}
                                      </p>
                                    </div>
                                  )}

                                  {/* Prescribed Sacred Vedic Homam Card */}
                                  {homamData && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 via-card to-card border border-amber-500/30 shadow-sm space-y-4 print:border-gray-300 print:bg-transparent">
                                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/60">
                                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2 print:text-black">
                                          <Flame size={15} className="text-amber-400 print:text-black animate-pulse" /> Prescribed Sacred Vedic Homam (अग्नि होम)
                                        </h4>
                                        {homamData.deity && (
                                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20 print:text-black print:border-gray-400">
                                            Deity: {renderSafeText(homamData.deity)}
                                          </span>
                                        )}
                                      </div>

                                      {/* Primary Homam Hero Banner */}
                                      <div className="p-4 sm:p-5 rounded-2xl bg-[#EDE4D5] dark:bg-amber-950/40 border border-[#E5D9C8] dark:border-amber-500/30 text-center space-y-1.5 shadow-inner print:bg-gray-100 print:border-gray-300">
                                        <span className="text-[10px] uppercase font-extrabold text-[#713B32] dark:text-amber-400 tracking-widest block print:text-black">
                                          Sacred Vedic Agni Ritual
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#292522] dark:text-amber-100 print:text-black">
                                          {renderSafeText(homamData.name)}
                                        </h3>
                                        {homamData.purpose && (
                                          <p className="text-xs text-[#6B5E55] dark:text-amber-200/80 font-medium max-w-xl mx-auto print:text-gray-700">
                                            {renderSafeText(homamData.purpose)}
                                          </p>
                                        )}
                                      </div>

                                      {/* Homam Specs Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 print:border-gray-300 print:bg-transparent">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold print:text-gray-600">
                                            Auspicious Day &amp; Timing
                                          </span>
                                          <span className="font-semibold text-foreground print:text-black">
                                            📅 {renderSafeText(homamData.day || 'Auspicious Friday / Saturday')}
                                            {homamData.duration && ` (${renderSafeText(homamData.duration)})`}
                                          </span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 print:border-gray-300 print:bg-transparent">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold print:text-gray-600">
                                            Sacred Samidha Wood &amp; Offerings
                                          </span>
                                          <span className="font-semibold text-foreground print:text-black">
                                            🌿 {renderSafeText(homamData.samidha || 'Bilva wood, Kamal Gatta, Mango wood, Sacred herbs')}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Ahuti Mantra */}
                                      {homamData.ahutiMantra && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1.5 shadow-sm print:bg-amber-50 print:border-amber-200">
                                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider print:text-amber-800">
                                            Sacred Ahuti Invocation Mantra
                                          </span>
                                          <p className="text-base sm:text-lg font-serif font-bold text-[#C9952B] print:text-black leading-relaxed">
                                            {renderSafeText(homamData.ahutiMantra)}
                                          </p>
                                          <p className="text-[11px] text-muted-foreground print:text-gray-700">
                                            Offerings:{' '}
                                            <strong className="text-foreground print:text-black">
                                              {renderSafeText(homamData.japaCount || '108 Sacred Ahutis into Holy Agni')}
                                            </strong>
                                          </p>
                                        </div>
                                      )}

                                      {/* Benefits */}
                                      {homamData.benefits && (
                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground/90 leading-relaxed print:border-gray-300 print:bg-transparent print:text-black">
                                          <strong className="text-amber-400 print:text-black">Karmic Transformation &amp; Divine Blessings:</strong>{' '}
                                          {renderSafeText(homamData.benefits)}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Prescribed Sacred Yantra Card */}
                                  {yantraData && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-card to-card border border-emerald-500/30 shadow-sm space-y-4 print:border-gray-300 print:bg-transparent">
                                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/60">
                                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2 print:text-black">
                                          <Triangle size={15} className="text-emerald-400 print:text-black" /> Prescribed Sacred Vedic Yantra
                                        </h4>
                                        {yantraData.deity && (
                                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 print:text-black print:border-gray-400">
                                            Deity: {yantraData.deity}
                                          </span>
                                        )}
                                      </div>

                                      {/* Primary Yantra Hero Banner */}
                                      <div className="p-4 sm:p-5 rounded-2xl bg-[#EDE4D5] dark:bg-emerald-950/40 border border-[#E5D9C8] dark:border-emerald-500/30 text-center space-y-1.5 shadow-inner print:bg-gray-100 print:border-gray-300">
                                        <span className="text-[10px] uppercase font-extrabold text-[#713B32] dark:text-emerald-400 tracking-widest block print:text-black">
                                          Primary Prescribed Geometric Conductor
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#292522] dark:text-emerald-100 print:text-black">
                                          {yantraData.name}
                                        </h3>
                                        <p className="text-xs text-[#6B5E55] dark:text-emerald-200/80 font-medium print:text-gray-700">
                                          Governing Graha:{' '}
                                          <span className="font-bold text-[#713B32] dark:text-emerald-300 print:text-black">
                                            {yantraData.planet || 'Venus / Jupiter'}
                                          </span>
                                        </p>
                                      </div>

                                      {/* Yantra Specs Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 print:border-gray-300 print:bg-transparent">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold print:text-gray-600">
                                            Sacred Geometry &amp; Pattern
                                          </span>
                                          <span className="font-semibold text-foreground print:text-black">
                                            {yantraData.geometry || 'Sacred Interlocking Triangles & Lotus Bhupura'}
                                          </span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 print:border-gray-300 print:bg-transparent">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold print:text-gray-600">
                                            Consecration Metal / Material
                                          </span>
                                          <span className="font-semibold text-foreground print:text-black">
                                            {yantraData.material || 'Heavy Consecrated Copper Plate (Tamra Patra)'}
                                          </span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 print:border-gray-300 print:bg-transparent">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold print:text-gray-600">
                                            Auspicious Placement Direction
                                          </span>
                                          <span className="font-semibold text-[#C9952B] print:text-black">
                                            📍 {yantraData.placementDirection || 'North-East (Ishanya Kona) or North Wall'}
                                          </span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 print:border-gray-300 print:bg-transparent">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold print:text-gray-600">
                                            Activation Muhurat
                                          </span>
                                          <span className="font-semibold text-emerald-400 print:text-black">
                                            ⏳ {yantraData.activationMuhurat || 'Friday/Sunday morning during Brahma Muhurta'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Prana Pratishtha Activation Mantra */}
                                      {(yantraData.consecrationMantra || yantraData.activationMantra) && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1.5 shadow-sm print:bg-amber-50 print:border-amber-200">
                                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider print:text-amber-800">
                                            Prana Pratishtha Consecration Beej Mantra
                                          </span>
                                          <p className="text-base sm:text-lg font-serif font-bold text-[#C9952B] print:text-black">
                                            {yantraData.consecrationMantra || yantraData.activationMantra}
                                          </p>
                                          <p className="text-[11px] text-muted-foreground print:text-gray-700">
                                            Recitation:{' '}
                                            <strong className="text-foreground print:text-black">
                                              {yantraData.japaCount || '108 Recitations using Sphatik/Rudraksha Mala'}
                                            </strong>
                                          </p>
                                        </div>
                                      )}

                                      {/* Benefits */}
                                      {yantraData.benefits && (
                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground/90 leading-relaxed print:border-gray-300 print:bg-transparent print:text-black">
                                          <strong className="text-emerald-400 print:text-black">Sacred Geometric Benefits:</strong>{' '}
                                          {yantraData.benefits}
                                        </div>
                                      )}

                                      {/* Secondary / Complementary Yantras */}
                                      {secondaryYantras &&
                                        Array.isArray(secondaryYantras) &&
                                        secondaryYantras.length > 0 && (
                                          <div className="pt-2 space-y-2.5">
                                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground print:text-gray-600">
                                              Complementary Planetary Yantras
                                            </h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                              {secondaryYantras.map((sy: any, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs print:border-gray-300 print:bg-transparent"
                                                >
                                                  <div className="flex justify-between items-center font-bold">
                                                    <span className="text-foreground print:text-black">{sy.name}</span>
                                                    <span className="text-[10px] text-emerald-400 font-semibold print:text-black">
                                                      {sy.planet || sy.deity}
                                                    </span>
                                                  </div>
                                                  <p className="text-muted-foreground text-[11px] print:text-gray-700">
                                                    {sy.purpose || sy.benefits}
                                                  </p>
                                                  {sy.placement && (
                                                    <p className="text-[10px] text-[#C9952B] font-medium print:text-black">
                                                      📍 Placement: {sy.placement}
                                                    </p>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {/* Common Procedure Section */}
                                  {displayProcedure && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300 space-y-2">
                                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider print:text-black">
                                        Procedure & Remedial Methodology
                                      </p>
                                      <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line print:text-black">
                                        {renderSafeText(displayProcedure)}
                                      </p>
                                    </div>
                                  )}

                                  {/* Common Rules / Materials Section */}
                                  {displayMaterials && (
                                    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300 space-y-1">
                                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider print:text-black">
                                        Materials / Sacred Offerings
                                      </p>
                                      <p className="text-xs sm:text-sm text-foreground leading-relaxed print:text-black">
                                        {renderSafeText(displayMaterials)}
                                      </p>
                                    </div>
                                  )}

                                  {/* Prescribed Mantras Card */}
                                  {data.prescribedMantras &&
                                    Array.isArray(data.prescribedMantras) && (
                                      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] flex items-center gap-1.5">
                                          <Sparkles size={14} /> Prescribed Vedic Mantras &amp; Japa
                                          Protocol
                                        </h4>
                                        <div className="space-y-2">
                                          {data.prescribedMantras.map((m: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs"
                                            >
                                              <div className="flex justify-between items-center font-bold">
                                                <span className="text-foreground">
                                                  {renderSafeText(m.title || m.name || 'Mantra')}
                                                </span>
                                                <span className="text-[#C9952B]">
                                                  {renderSafeText(m.japaCount || m.count || '108 Times')}
                                                </span>
                                              </div>
                                              {m.sanskrit && (
                                                <p className="text-sm font-serif text-[#C9952B]">
                                                  {renderSafeText(m.sanskrit)}
                                                </p>
                                              )}
                                              {m.bestTime && (
                                                <p className="text-muted-foreground text-[11px]">
                                                  Best Time: {renderSafeText(m.bestTime)}
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Primary Gemstone Card */}
                                  {data.primaryGemstone && (
                                    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] flex items-center gap-1.5">
                                        💎 Prescribed Astrological Gemstone
                                      </h4>
                                      {typeof data.primaryGemstone === 'object' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                              Gemstone
                                            </span>
                                            <span className="font-bold text-foreground text-sm">
                                              {renderSafeText(
                                                data.primaryGemstone.name ||
                                                  data.primaryGemstone.gemstone ||
                                                  data.primaryGemstone.title ||
                                                  'Natural Vedic Gemstone'
                                              )}
                                            </span>
                                          </div>
                                          {(data.primaryGemstone.caratWeight ||
                                            data.primaryGemstone.metal) && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                                Weight &amp; Metal
                                              </span>
                                              <span className="font-semibold text-foreground">
                                                {renderSafeText(data.primaryGemstone.caratWeight)}
                                                {data.primaryGemstone.caratWeight &&
                                                  data.primaryGemstone.metal &&
                                                  ' in '}
                                                {renderSafeText(data.primaryGemstone.metal)}
                                              </span>
                                            </div>
                                          )}
                                          {(data.primaryGemstone.wearingFinger ||
                                            data.primaryGemstone.auspiciousDay) && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                                Finger &amp; Day
                                              </span>
                                              <span className="font-semibold text-foreground">
                                                {renderSafeText(data.primaryGemstone.wearingFinger)}
                                                {data.primaryGemstone.auspiciousDay &&
                                                  ` (${renderSafeText(
                                                    data.primaryGemstone.auspiciousDay
                                                  )})`}
                                              </span>
                                            </div>
                                          )}
                                          {data.primaryGemstone.consecrationMantra && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 sm:col-span-2">
                                              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                                Energization Mantra
                                              </span>
                                              <span className="font-serif text-[#C9952B] block mt-0.5">
                                                {renderSafeText(
                                                  data.primaryGemstone.consecrationMantra
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                            Prescribed Ratna
                                          </span>
                                          <p className="font-bold text-foreground text-sm mt-0.5">
                                            {renderSafeText(data.primaryGemstone)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Secondary / Substitute Gemstone Card */}
                                  {(data.substituteGemstone ||
                                    data.alternativeGemstone ||
                                    data.secondaryGemstone) && (
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                                        Upratna (Alternative / Secondary Gemstone)
                                      </span>
                                      <p className="text-foreground/90 font-medium leading-relaxed">
                                        {renderSafeText(
                                          data.substituteGemstone ||
                                            data.alternativeGemstone ||
                                            data.secondaryGemstone
                                        )}
                                      </p>
                                    </div>
                                  )}

                                  {/* Prescribed Mukhis Card */}
                                  {data.prescribedMukhis &&
                                    Array.isArray(data.prescribedMukhis) && (
                                      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] flex items-center gap-1.5">
                                          📿 Sacred Mukhi Rudraksha Combination
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {data.prescribedMukhis.map((rm: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs"
                                            >
                                              <div className="flex justify-between items-center font-bold">
                                                <span className="text-foreground">
                                                  {renderSafeText(rm.mukhi || rm.name)}
                                                </span>
                                                <span className="text-[#C9952B] text-[10px]">
                                                  {renderSafeText(rm.planet)}
                                                </span>
                                              </div>
                                              <p className="text-muted-foreground text-[11px]">
                                                {renderSafeText(rm.benefits || rm.purpose)}
                                              </p>
                                              <p className="text-[10px] text-muted-foreground font-semibold">
                                                Deity: {renderSafeText(rm.deity)}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Recommended Pre-Marital / Remedial Rituals */}
                                  {data.recommendedRituals &&
                                    Array.isArray(data.recommendedRituals) && (
                                      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                                          Recommended Remedial Pujas &amp; Rituals
                                        </h4>
                                        <div className="space-y-1.5">
                                          {data.recommendedRituals.map((r: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed"
                                            >
                                              <span className="text-emerald-400 font-bold">✓</span>
                                              <span>{renderSafeText(r)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Lucky Attributes Card */}
                                  {data.luckyAttributes &&
                                    typeof data.luckyAttributes === 'object' && (
                                      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B]">
                                          Cosmic Resonance &amp; Lucky Attributes
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                          {data.luckyAttributes.luckyColor && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                                Lucky Color
                                              </span>
                                              <span className="font-bold text-[#C9952B] mt-0.5 block">
                                                {renderSafeText(data.luckyAttributes.luckyColor)}
                                              </span>
                                            </div>
                                          )}
                                          {data.luckyAttributes.luckyNumber && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                                Lucky Number
                                              </span>
                                              <span className="font-bold text-foreground mt-0.5 block">
                                                {renderSafeText(data.luckyAttributes.luckyNumber)}
                                              </span>
                                            </div>
                                          )}
                                          {data.luckyAttributes.luckyDirection && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                                Favorable Direction
                                              </span>
                                              <span className="font-bold text-foreground mt-0.5 block">
                                                {renderSafeText(data.luckyAttributes.luckyDirection)}
                                              </span>
                                            </div>
                                          )}
                                          {data.luckyAttributes.favorableDay && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                                Auspicious Day
                                              </span>
                                              <span className="font-bold text-emerald-400 mt-0.5 block">
                                                {renderSafeText(data.luckyAttributes.favorableDay)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Extra Admin-Defined Output Guidance */}
                                  {(data.additionalGuidance || data.customAdminInsights) && (
                                    <div className="p-5 sm:p-6 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30 shadow-sm space-y-3">
                                      <p className="text-xs text-[#C9952B] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles size={14} /> Additional Vedic Guidance &amp;
                                        Lifestyle Alignment
                                      </p>
                                      {renderAdditionalGuidance(
                                        data.additionalGuidance || data.customAdminInsights
                                      )}
                                    </div>
                                  )}

                                  {/* Daily Blessing Sanskrit Shloka */}
                                  {data.dailyBlessingShloka && (
                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-amber-500">
                                        Daily Sacred Shloka
                                      </span>
                                      <p className="text-xs sm:text-sm font-serif text-[#C9952B] italic">
                                        &ldquo;{renderSafeText(data.dailyBlessingShloka)}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          } catch (e) {
                            // Not JSON
                          }

                          return (
                            <div className="prose prose-invert max-w-none space-y-4">
                              {selectedReport.reportContent
                                ?.split('\n')
                                .map((line: string, i: number) => {
                                  if (line.trim() === '') return <br key={i} />;
                                  return (
                                    <p key={i} className="text-sm leading-relaxed">
                                      {line}
                                    </p>
                                  );
                                })}
                            </div>
                          );
                        })()
                      )}
                      </ReportErrorBoundary>
                    </div>
                  </div>

                  <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Link
                        href="/talk-to-ai-astrologer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] transition-all shadow-md transform hover:-translate-y-0.5"
                      >
                        <Bot size={15} className="animate-pulse" /> AI Expert Astrologer
                      </Link>
                      <Link
                        href="/talk-to-astrologer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md"
                      >
                        <PhoneCall size={15} /> Talk to Astrologer 📞
                      </Link>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
