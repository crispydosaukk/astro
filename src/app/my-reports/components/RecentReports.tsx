'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Gem,
  Music,
  Triangle,
  Flame,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function RecentReports() {
  const { user } = useUserData();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    async function fetchReports() {
      const uid = user?.uid || 'demo-user-id';
      try {
        const q = query(collection(db, 'service_requests'), where('userId', '==', uid));
        const querySnapshot = await getDocs(q);
        const fetchedReports: any[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...doc.data() });
        });

        // Filter by completed and sort by createdAt descending in memory to avoid Firestore index requirement
        const sortedReports = fetchedReports
          .filter((rep) => rep.status === 'completed')
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
          })
          .slice(0, 10);

        setReports(sortedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchReports();
    } else if (user === null) {
      setLoading(false); // Done loading user, but no user
    }
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getIconForType = (type: string) => {
    if (type.includes('Homam')) return Flame;
    if (type.includes('Gemstone')) return Gem;
    if (type.includes('Mantra')) return Music;
    if (type.includes('Yantra')) return Triangle;
    return FileText;
  };

  const getColorClassForType = (type: string) => {
    if (type.includes('Homam')) return 'text-orange-400';
    if (type.includes('Gemstone')) return 'text-red-400';
    if (type.includes('Mantra')) return 'text-blue-400';
    if (type.includes('Yantra')) return 'text-green-400';
    return 'text-purple-400';
  };

  const getBgClassForType = (type: string) => {
    if (type.includes('Homam')) return 'bg-orange-500/10';
    if (type.includes('Gemstone')) return 'bg-red-500/10';
    if (type.includes('Mantra')) return 'bg-blue-500/10';
    if (type.includes('Yantra')) return 'bg-green-500/10';
    return 'bg-purple-500/10';
  };

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-pdf-content');
      if (element) {
        // Temporarily prepare for PDF capture
        const originalMaxHeight = element.style.maxHeight;
        const scrollDiv = element.querySelector('.overflow-y-auto') as HTMLElement;
        const originalOverflow = scrollDiv ? scrollDiv.style.overflow : '';
        
        element.style.maxHeight = 'none';
        if (scrollDiv) scrollDiv.style.overflow = 'visible';

        const opt = {
          margin: 0.5,
          filename: `${selectedReport?.type || 'Report'}.pdf`,
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            ignoreElements: (el: Element) => el.classList.contains('pdf-exclude')
          }
        };
        
        await html2pdf().set(opt).from(element).save();
        
        // Restore
        element.style.maxHeight = originalMaxHeight;
        if (scrollDiv) scrollDiv.style.overflow = originalOverflow;
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      window.print();
    }
  };

  return (
    <>
      <div
        id="recent-reports"
        className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden print:hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Reports</h2>
          <Link
            href="/#services"
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Generate New <ArrowRight size={10} />
          </Link>
        </div>
        <div className="overflow-x-auto min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin text-[#C9952B]" size={24} />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <FileText size={32} className="mb-2 opacity-50" />
              <p>No reports found. Generate one from the services page.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">
                    Report
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">
                    Generated
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep, i) => {
                  const Icon = getIconForType(rep.type);
                  return (
                    <motion.tr
                      key={rep.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${getBgClassForType(rep.type)} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon size={15} className={getColorClassForType(rep.type)} />
                          </div>
                          <span className="font-medium text-foreground">
                            {rep.type || 'Custom Report'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {formatDate(rep.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                          Ready
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => setSelectedReport(rep)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-all"
                            title="View report"
                          >
                            <Eye
                              size={14}
                              className="text-muted-foreground hover:text-foreground"
                            />
                          </button>
                        </div>
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
              className="relative w-full max-w-3xl max-h-[85vh] print:max-h-none print:h-auto print:shadow-none print:border-none print:bg-transparent bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden print:overflow-visible"
            >
              {/* Print Header with Logo */}
              <div className="hidden print:flex flex-col items-center justify-center pb-6 mb-6 border-b-2 border-black">
                <img src="/AstroParihar_Logo.png" alt="AstroParihar Logo" className="h-24 object-contain" />
              </div>

              <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between bg-muted/30 print:bg-transparent print:border-none print:p-0">
                <div>
                  <h3 className="text-2xl font-bold text-foreground print:text-black">{selectedReport.type}</h3>
                  <p className="text-sm text-muted-foreground mt-1 print:text-gray-600">
                    Generated for {selectedReport.details?.dob} | {selectedReport.details?.time} |{' '}
                    {selectedReport.details?.place}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="pdf-exclude p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground print:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar print:overflow-visible print:h-auto">
                <div className="p-6 sm:p-8 space-y-6 print:p-0 print:py-6">
                  {(() => {
                    try {
                      const data = JSON.parse(selectedReport.reportContent);
                      if (data && data.recommendationTitle) {
                        return (
                          <div className="space-y-6">
                            <div className="p-5 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30 print:break-inside-avoid print:border-gray-300 print:bg-transparent">
                              <p className="text-xs text-[#C9952B] font-semibold mb-1 uppercase tracking-wider print:text-black">
                                {data.recommendationTitle
                                  .replace(/Recommended /i, '')
                                  .replace(/Get Your /i, '')}
                              </p>
                              <h2 className="text-2xl font-bold text-foreground mb-2 print:text-black">
                                {data.recommendationName}
                              </h2>
                              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 print:text-gray-700">
                                {data.timing}{' '}
                                {data.duration && data.duration !== 'N/A' && `· ${data.duration}`}
                              </p>
                            </div>

                            {data.materials && (
                              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300">
                                <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider print:text-black">
                                  Materials / Requirements
                                </p>
                                <p className="text-sm text-foreground leading-relaxed print:text-black">
                                  {data.materials}
                                </p>
                              </div>
                            )}

                            {(data.astrologicalAnalysis || data.description) && (
                              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300">
                                <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider print:text-black">
                                  Astrological Insights
                                </p>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap print:text-black">
                                  {data.astrologicalAnalysis || data.description}
                                </p>
                              </div>
                            )}

                            {data.procedure && (
                              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300">
                                <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider print:text-black">
                                  Procedure / Methodology
                                </p>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap print:text-black">
                                  {data.procedure}
                                </p>
                              </div>
                            )}

                            {data.rules && (
                              <div className="p-5 rounded-2xl bg-card border border-[#C9952B]/20 shadow-sm relative overflow-hidden print:break-inside-avoid print:shadow-none print:border-gray-300">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#C9952B] print:hidden" />
                                <p className="text-xs text-[#C9952B] font-semibold mb-2 uppercase tracking-wider pl-2 print:pl-0 print:text-black">
                                  Rules & Restrictions
                                </p>
                                <p className="text-sm text-foreground leading-relaxed pl-2 print:pl-0 print:text-black">
                                  {data.rules}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Not JSON, fallback to markdown
                    }

                    return (
                      <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground max-w-none">
                        {selectedReport.reportContent?.split('\n').map((line: string, i: number) => {
                          if (line.startsWith('### '))
                            return (
                              <h4 key={i} className="text-lg font-bold mt-6 mb-3 text-[#C9952B]">
                                {line.replace('### ', '')}
                              </h4>
                            );
                          if (line.startsWith('## '))
                            return (
                              <h3 key={i} className="text-xl font-bold mt-8 mb-4 text-[#C9952B]">
                                {line.replace('## ', '')}
                              </h3>
                            );
                          if (line.startsWith('# '))
                            return (
                              <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-[#C9952B]">
                                {line.replace('# ', '')}
                              </h2>
                            );
                          if (line.startsWith('- '))
                            return (
                              <li key={i} className="ml-4 mb-1">
                                {line.substring(2)}
                              </li>
                            );
                          if (line.trim() === '') return <br key={i} />;
                          return (
                            <p key={i} className="mb-4 leading-relaxed">
                              {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="pdf-exclude p-6 border-t border-border bg-muted/30 flex items-center justify-between print:hidden">
                <Link
                  href="/talk-to-astrologer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white gold-gradient-bg hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                >
                  Clarify Doubts? Talk to our Astrologer
                </Link>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
