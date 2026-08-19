'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAllMahadashaGuides, MahadashaGuide } from '@/lib/mahadasha';

export default function RecentReports() {
  const { user } = useUserData();
  const [reports, setReports] = useState<any[]>([]);
  const [mahadashaGuides, setMahadashaGuides] = useState<Record<string, MahadashaGuide>>({});
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'services' | 'remedies' | 'mahadasha'>('all');

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

        // Filter completed & sort by date descending
        const sortedReports = fetchedReports
          .filter((rep) => rep.status === 'completed')
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
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

  const getReportCategory = (type: string = ''): 'services' | 'remedies' | 'mahadasha' => {
    if (type.includes('Guide') || type.includes('Mahadasha') || type.includes('PDF')) {
      return 'mahadasha';
    }
    if (
      type.includes('Gemstone') ||
      type.includes('Mantra') ||
      type.includes('Yantra') ||
      type.includes('Homam') ||
      type.includes('Remedies')
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
    if (rep.type?.includes('Rahu') && rep.type?.includes('Survival')) {
      return mahadashaGuides['rahu-survival']?.pdfUrl || '/assets/pdfs/rahu_mahadasha_survival_guide.pdf';
    }
    if (rep.type?.includes('Rahu')) {
      return mahadashaGuides['rahu-stabilisation']?.pdfUrl || '/assets/pdfs/rahu_mahadasha_stabilisation_guide.pdf';
    }
    if (rep.type?.includes('Sani') && rep.type?.includes('Survival')) {
      return mahadashaGuides['sani-survival']?.pdfUrl || '/assets/pdfs/sani_mahadasha_survival_guide.pdf';
    }
    if (rep.type?.includes('Sani')) {
      return mahadashaGuides['sani-stabilisation']?.pdfUrl || '/assets/pdfs/sani_mahadasha_stabilisation_guide.pdf';
    }
    return '/assets/pdfs/rahu_mahadasha_stabilisation_guide.pdf';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getIconForType = (type: string = '') => {
    if (type.includes('Guide') || type.includes('Mahadasha')) return ShieldCheck;
    if (type.includes('Homam')) return Flame;
    if (type.includes('Gemstone')) return Gem;
    if (type.includes('Mantra')) return Music;
    if (type.includes('Yantra')) return Triangle;
    if (type.includes('Love') || type.includes('Relationship')) return Heart;
    if (type.includes('Finance') || type.includes('Wealth')) return Coins;
    if (type.includes('Health') || type.includes('Vitality')) return Activity;
    if (type.includes('Kundli') || type.includes('Horoscope')) return Sparkles;
    return FileText;
  };

  const getColorClassForType = (type: string = '') => {
    if (type.includes('Guide') || type.includes('Mahadasha')) return 'text-amber-400';
    if (type.includes('Homam')) return 'text-orange-400';
    if (type.includes('Gemstone')) return 'text-red-400';
    if (type.includes('Mantra')) return 'text-blue-400';
    if (type.includes('Yantra')) return 'text-green-400';
    if (type.includes('Love') || type.includes('Relationship')) return 'text-rose-400';
    if (type.includes('Finance') || type.includes('Wealth')) return 'text-emerald-400';
    if (type.includes('Health') || type.includes('Vitality')) return 'text-cyan-400';
    return 'text-purple-400';
  };

  const getBgClassForType = (type: string = '') => {
    if (type.includes('Guide') || type.includes('Mahadasha')) return 'bg-amber-500/10';
    if (type.includes('Homam')) return 'bg-orange-500/10';
    if (type.includes('Gemstone')) return 'bg-red-500/10';
    if (type.includes('Mantra')) return 'bg-blue-500/10';
    if (type.includes('Yantra')) return 'bg-green-500/10';
    if (type.includes('Love') || type.includes('Relationship')) return 'bg-rose-500/10';
    if (type.includes('Finance') || type.includes('Wealth')) return 'bg-emerald-500/10';
    if (type.includes('Health') || type.includes('Vitality')) return 'bg-cyan-500/10';
    return 'bg-purple-500/10';
  };

  const filteredReports = reports.filter((rep) => {
    if (activeCategory === 'all') return true;
    return getReportCategory(rep.type) === activeCategory;
  });

  const servicesCount = reports.filter((r) => getReportCategory(r.type) === 'services').length;
  const remediesCount = reports.filter((r) => getReportCategory(r.type) === 'remedies').length;
  const mahadashaCount = reports.filter((r) => getReportCategory(r.type) === 'mahadasha').length;

  return (
    <>
      <div
        id="recent-reports"
        className="glass-card-light dark:glass-card rounded-3xl border border-border overflow-hidden space-y-4"
      >
        {/* Header with Title */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">My Astrological Reports & Purchased PDF Guides</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Categorized view of your services reports, remedies, and Mahadasha PDF guides</p>
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
            { id: 'all', label: `All Orders (${reports.length})` },
            { id: 'services', label: `Services Reports (${servicesCount})` },
            { id: 'remedies', label: `Remedies (${remediesCount})` },
            { id: 'mahadasha', label: `Mahadasha PDF Guides (${mahadashaCount})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
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
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-2">
              <FileText size={36} className="opacity-40" />
              <p className="font-semibold">No reports or guides found in this category.</p>
              <Link href="/services" className="text-xs font-bold text-[#C9952B] hover:underline">
                Explore Services & PDF Guides →
              </Link>
            </div>
          ) : (
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
                {filteredReports.map((rep, i) => {
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
                              {rep.type || 'Custom Report'}
                            </span>
                            {rep.details?.name && (
                              <span className="text-[11px] text-muted-foreground">For: {rep.details.name}</span>
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
                          {category === 'mahadasha' ? 'PDF Guide' : category === 'remedies' ? 'Remedy' : 'Service'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {formatDate(rep.createdAt)}
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
          )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:p-0 print:static print:inset-auto print:z-auto">
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
              className="relative w-full max-w-3xl max-h-[85vh] print:max-h-none print:h-auto print:shadow-none print:border-none print:bg-transparent bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden print:overflow-visible"
            >
              {/* Print Header with Logo */}
              <div className="hidden print:flex flex-col items-center justify-center pb-6 mb-6 border-b-2 border-black">
                <img src="/AstroParihar_Logo.png" alt="AstroParihar Logo" className="h-24 object-contain" />
              </div>

              <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between bg-muted/30 print:bg-transparent print:border-none print:p-0">
                <div>
                  <h3 className="text-2xl font-bold text-foreground print:text-black">{selectedReport.type}</h3>
                  {selectedReport.details?.dob && (
                    <p className="text-sm text-muted-foreground mt-1 print:text-gray-600">
                      Generated for {selectedReport.details?.dob} | {selectedReport.details?.time} |{' '}
                      {selectedReport.details?.place}
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
                  {getReportCategory(selectedReport.type) === 'mahadasha' ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-black/40 border border-[#C9952B]/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="text-[#C9952B] font-bold">📄 Official Admin Uploaded PDF Document</span>
                        <a
                          href={getGuidePdfUrl(selectedReport)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline font-bold"
                        >
                          Open PDF in New Window ↗
                        </a>
                      </div>
                      <iframe
                        src={getGuidePdfUrl(selectedReport)}
                        title={selectedReport.type}
                        className="w-full h-[60vh] sm:h-[65vh] rounded-2xl border border-white/10 bg-white shadow-inner"
                      />
                    </div>
                  ) : (
                    (() => {
                      try {
                        const data = typeof selectedReport.reportContent === 'string'
                          ? JSON.parse(selectedReport.reportContent)
                          : selectedReport.reportContent;

                        if (data) {
                          const isKundliMatching =
                            selectedReport.type?.toLowerCase().includes('matching') ||
                            data.recommendationTitle?.toLowerCase().includes('matching') ||
                            data.ashtakoot;

                          const isJanamKundli =
                            selectedReport.type?.toLowerCase().includes('janam kundli') ||
                            selectedReport.type?.toLowerCase().includes('horoscope') ||
                            data.planetaryDegrees ||
                            data.ascendant;

                          const isPanchang =
                            selectedReport.type?.toLowerCase().includes('panchang') ||
                            data.tithi ||
                            data.rahuKaal;

                          const isFasting =
                            selectedReport.type?.toLowerCase().includes('fasting') ||
                            data.recommendedVrats ||
                            data.weeklyFastingDay;

                          return (
                            <div className="space-y-6">
                              {/* Primary Header Card */}
                              <div className="p-5 sm:p-6 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30 print:break-inside-avoid print:border-gray-300 print:bg-transparent space-y-2">
                                <p className="text-xs text-[#C9952B] font-semibold uppercase tracking-wider print:text-black">
                                  {data.recommendationTitle || selectedReport.type}
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground print:text-black">
                                  {data.recommendationName || selectedReport.type}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2 print:text-gray-700">
                                  {data.timing || 'Active'} {data.duration && data.duration !== 'N/A' && `· ${data.duration}`}
                                </p>
                              </div>

                              {/* 1. KUNDLI MATCHING SPECIFIC REPORT VIEW */}
                              {isKundliMatching && (
                                <div className="space-y-6">
                                  {/* Score Box */}
                                  <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3 shadow-sm">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">
                                      Total Gun Milan Compatibility Score
                                    </div>
                                    <div className="text-5xl font-black text-gradient-gold font-mono">
                                      {data.totalScore !== undefined ? data.totalScore : 29.5} <span className="text-xl text-muted-foreground">/ 36</span>
                                    </div>
                                    <p className="text-emerald-400 font-bold text-base">{data.status || 'Highly Compatible'}</p>
                                    {data.verdict && (
                                      <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed pt-1">
                                        {data.verdict}
                                      </p>
                                    )}

                                    {/* Planetary Signs & Manglik Analysis */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left">
                                      {data.groomAstro && (
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Your Planetary Alignment</div>
                                          <div className="text-xs font-bold text-[#C9952B]">{data.groomAstro.rashiName}</div>
                                          <div className="text-[11px] text-muted-foreground">
                                            {data.groomAstro.nakshatraName} · {data.groomAstro.gana} Gana · {data.groomAstro.nadi} Nadi
                                          </div>
                                        </div>
                                      )}

                                      {data.brideAstro && (
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Partner's Planetary Alignment</div>
                                          <div className="text-xs font-bold text-rose-400">{data.brideAstro.rashiName}</div>
                                          <div className="text-[11px] text-muted-foreground">
                                            {data.brideAstro.nakshatraName} · {data.brideAstro.gana} Gana · {data.brideAstro.nadi} Nadi
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {data.manglikStatus && (
                                      <div className="p-3 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 text-xs text-left">
                                        <span className="font-bold text-[#C9952B]">Manglik Compatibility: </span>
                                        <span className="text-foreground/90">{data.manglikStatus.summary}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Ashtakoot Grid */}
                                  {data.ashtakoot && Array.isArray(data.ashtakoot) && (
                                    <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Sparkles size={16} className="text-[#C9952B]" /> Ashtakoot 8-Factor Breakdown
                                      </h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {data.ashtakoot.map((kootItem: any, idx: number) => (
                                          <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                            <div className="flex justify-between items-center">
                                              <span className="font-bold text-foreground text-xs">{kootItem.koot}</span>
                                              <span className="text-xs font-bold text-[#C9952B]">{kootItem.score}</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">{kootItem.desc}</p>
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
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Lagna (Ascendant)</div>
                                        <div className="text-xs font-bold text-[#C9952B] mt-0.5">{data.ascendant}</div>
                                      </div>
                                    )}
                                    {data.moonSign && (
                                      <div className="p-3 rounded-xl bg-card border border-border text-center">
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Moon Sign (Rashi)</div>
                                        <div className="text-xs font-bold text-foreground mt-0.5">{data.moonSign}</div>
                                      </div>
                                    )}
                                    {data.sunSign && (
                                      <div className="p-3 rounded-xl bg-card border border-border text-center">
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Sun Sign (Surya)</div>
                                        <div className="text-xs font-bold text-foreground mt-0.5">{data.sunSign}</div>
                                      </div>
                                    )}
                                    {data.nakshatra && (
                                      <div className="p-3 rounded-xl bg-card border border-border text-center">
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Birth Nakshatra</div>
                                        <div className="text-xs font-bold text-emerald-400 mt-0.5">{data.nakshatra}</div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Planetary Positions Table */}
                                  {data.planetaryDegrees && Array.isArray(data.planetaryDegrees) && (
                                    <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                                      <h3 className="text-sm font-bold text-foreground">Planetary Positions & House Placements</h3>
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
                                            {data.planetaryDegrees.map((p: any, idx: number) => (
                                              <tr key={idx} className="hover:bg-white/5">
                                                <td className="py-2 font-semibold text-foreground">{p.planet}</td>
                                                <td className="py-2 text-muted-foreground">{p.rashi}</td>
                                                <td className="py-2 font-mono text-[#C9952B]">{p.degree}</td>
                                                <td className="py-2 text-muted-foreground">{p.house}</td>
                                                <td className="py-2 text-right font-medium text-emerald-400">{p.status}</td>
                                              </tr>
                                            ))}
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
                                    <Sparkles size={16} className="text-[#C9952B]" /> Panchang Key Calculations
                                  </h3>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    {data.tithi && (
                                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Tithi</span>
                                        <span className="font-semibold text-foreground">{data.tithi}</span>
                                      </div>
                                    )}
                                    {data.nakshatra && (
                                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Nakshatra</span>
                                        <span className="font-semibold text-foreground">{data.nakshatra}</span>
                                      </div>
                                    )}
                                    {data.yoga && (
                                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Yoga</span>
                                        <span className="font-semibold text-foreground">{data.yoga}</span>
                                      </div>
                                    )}
                                    {data.karana && (
                                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Karana</span>
                                        <span className="font-semibold text-foreground">{data.karana}</span>
                                      </div>
                                    )}
                                    {data.abhijitMuhurat && (
                                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Abhijit Muhurat</span>
                                        <span className="font-semibold text-emerald-400">{data.abhijitMuhurat}</span>
                                      </div>
                                    )}
                                    {data.rahuKaal && (
                                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Rahu Kaal</span>
                                        <span className="font-semibold text-red-400">{data.rahuKaal}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 4. FASTING PLANNER SPECIFIC VIEW */}
                              {isFasting && data.recommendedVrats && Array.isArray(data.recommendedVrats) && (
                                <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                                  <h3 className="text-sm font-bold text-foreground">Recommended Vrats & Fasting Schedule</h3>
                                  <div className="space-y-3">
                                    {data.recommendedVrats.map((vrat: any, idx: number) => (
                                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                                        <div className="flex justify-between items-center font-bold text-foreground">
                                          <span className="text-[#C9952B]">{vrat.name}</span>
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{vrat.frequency}</span>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{vrat.benefit}</p>
                                        <p className="text-foreground/90 text-[11px] pt-1"><strong>Ritual:</strong> {vrat.ritual}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Common Astrological Analysis Section */}
                              {(data.astrologicalAnalysis || data.description) && (
                                <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300 space-y-2">
                                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider print:text-black">
                                    Astrological Insights & Analysis
                                  </p>
                                  <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line print:text-black">
                                    {data.astrologicalAnalysis || data.description}
                                  </p>
                                </div>
                              )}

                              {/* Common Procedure Section */}
                              {data.procedure && (
                                <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300 space-y-2">
                                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider print:text-black">
                                    Procedure & Remedial Methodology
                                  </p>
                                  <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line print:text-black">
                                    {data.procedure}
                                  </p>
                                </div>
                              )}

                              {/* Common Rules / Materials Section */}
                              {data.materials && (
                                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300 space-y-1">
                                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider print:text-black">
                                    Materials / Sacred Offerings
                                  </p>
                                  <p className="text-xs sm:text-sm text-foreground leading-relaxed print:text-black">
                                    {data.materials}
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
                          {selectedReport.reportContent?.split('\n').map((line: string, i: number) => {
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
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/30 flex items-center justify-between flex-wrap gap-3">
                <Link
                  href="/talk-to-astrologer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg"
                >
                  <PhoneCall size={15} /> Clarify Doubts? Talk to Astrologer 📞
                </Link>
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
      </AnimatePresence>
    </>
  );
}
