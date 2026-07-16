'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Star, Loader2, XCircle } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AstrologerData {
  id: string;
  name: string;
  email: string;
  specialty: string;
  experience: number;
  rating: number | null;
  consultations: number;
  revenue: string;
  status: string;
  avatar: string;
  tokenNumber?: string | number;
  dob?: string;
  gender?: string;
  city?: string;
  phoneType?: string;
  languages?: string;
  learningSource?: string;
  workingElsewhere?: string;
  dailyHours?: string;
  createdAt?: string;
}

export default function AdminAstrologersTable() {
  const [search, setSearch] = useState('');
  const [astrologers, setAstrologers] = useState<AstrologerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerData | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchApprovedAstrologers = async () => {
      try {
        const q = query(collection(db, 'astrologers'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        const fetchedData: AstrologerData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedData.push({
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email || 'No email',
            specialty: data.skills || 'N/A',
            experience: data.experience || 0,
            rating: data.rating || null,
            consultations: data.consultations || 0,
            revenue: data.revenue || '₹0',
            status: data.status || 'approved',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop',
            tokenNumber: data.tokenNumber || 'N/A',
            dob: data.dob,
            gender: data.gender,
            city: data.city,
            phoneType: data.phoneType,
            languages: data.languages,
            learningSource: data.learningSource,
            workingElsewhere: data.workingElsewhere,
            dailyHours: data.dailyHours,
            createdAt: data.createdAt,
          });
        });
        
        // Sort by name client-side
        fetchedData.sort((a, b) => a.name.localeCompare(b.name));
        setAstrologers(fetchedData);
      } catch (error) {
        console.error("Error fetching astrologers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedAstrologers();
  }, []);

  const filtered = astrologers.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Approved Astrologers</h2>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring w-40"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p>Loading approved astrologers...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  'Astrologer',
                  'Specialty',
                  'Experience',
                  'Rating',
                  'Consultations',
                  'Revenue',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={`ast-th-${h}`}
                    className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    No approved astrologers found.
                  </td>
                </tr>
              ) : (
                filtered.map((ast, i) => (
                  <motion.tr
                    key={ast.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <AppImage
                          src={ast.avatar}
                          alt={`${ast.name} astrologer admin panel`}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-foreground">{ast.name}</div>
                          <div className="text-xs text-muted-foreground">{ast.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{ast.specialty}</td>
                    <td className="px-5 py-4 text-foreground tabular-nums">{ast.experience} yrs</td>
                    <td className="px-5 py-4">
                      {ast.rating ? (
                        <div className="flex items-center gap-1">
                          <Star
                            size={12}
                            fill="currentColor"
                            className={ast.rating < 4 ? 'text-red-400' : 'text-accent'}
                          />
                          <span
                            className={`font-semibold tabular-nums ${ast.rating < 4 ? 'text-red-400' : 'text-foreground'}`}
                          >
                            {ast.rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-foreground tabular-nums font-mono">
                      {ast.consultations.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-foreground font-semibold tabular-nums">
                      {ast.revenue}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                        {ast.status.charAt(0).toUpperCase() + ast.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedAstrologer(ast)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                          title="View profile"
                        >
                          <Eye size={13} className="text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for full details via Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedAstrologer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAstrologer(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border p-6 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
              >
                <button
                  onClick={() => setSelectedAstrologer(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <XCircle size={24} />
                </button>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-16 h-16 rounded-full gold-gradient-bg flex items-center justify-center text-white text-2xl font-bold">
                    {selectedAstrologer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedAstrologer.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <span className="font-mono bg-muted px-2 py-0.5 rounded-md">
                        Token: #{selectedAstrologer.tokenNumber}
                      </span>
                      <span className="mx-2">•</span>
                      {selectedAstrologer.email}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-500/15 text-green-400">
                      Approved
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border pb-2">Personal Details</h4>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-muted-foreground">DOB:</span> <span className="text-foreground font-medium">{selectedAstrologer.dob || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">Gender:</span> <span className="text-foreground font-medium">{selectedAstrologer.gender || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">City:</span> <span className="text-foreground font-medium">{selectedAstrologer.city || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">Phone Type:</span> <span className="text-foreground font-medium">{selectedAstrologer.phoneType || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground border-b border-border pb-2">Professional Details</h4>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-muted-foreground">Languages:</span> <span className="text-foreground font-medium">{selectedAstrologer.languages || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">Skills:</span> <span className="text-foreground font-medium">{selectedAstrologer.specialty || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">Learning Source:</span> <span className="text-foreground font-medium">{selectedAstrologer.learningSource || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">Daily Hours:</span> <span className="text-foreground font-medium">{selectedAstrologer.dailyHours || 'N/A'}</span></p>
                      <p><span className="text-muted-foreground">Working Elsewhere:</span> <span className="text-foreground font-medium">{selectedAstrologer.workingElsewhere || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
