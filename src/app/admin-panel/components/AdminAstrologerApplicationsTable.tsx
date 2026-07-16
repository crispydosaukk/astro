'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Eye, AlertTriangle, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

// Define astrologer application type
interface AstrologerApp {
  id: string;
  name: string;
  email: string;
  dob: string;
  city: string;
  gender: string;
  languages: string;
  skills: string;
  phoneType: string;
  workingElsewhere: string;
  dailyHours: string;
  learningSource: string;
  status: string;
  tokenNumber: string | number;
  createdAt: string;
}

export default function AdminAstrologerApplicationsTable() {
  const [applications, setApplications] = useState<AstrologerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<AstrologerApp | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'astrologers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const appsData: AstrologerApp[] = [];
      querySnapshot.forEach((docSnap) => {
        appsData.push({ id: docSnap.id, ...docSnap.data() } as AstrologerApp);
      });
      setApplications(appsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const astRef = doc(db, 'astrologers', id);
      await updateDoc(astRef, { status: newStatus });

      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));

      if (newStatus === 'approved') {
        toast.success('Astrologer application approved!');
      } else {
        toast.info(`Astrologer application ${newStatus}.`);
      }

      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
      toast.error('Failed to update status');
    }
  };

  const filtered = applications.filter((a) => {
    const matchSearch =
      (a.name && a.name.toLowerCase().includes(search.toLowerCase())) ||
      (a.email && a.email.toLowerCase().includes(search.toLowerCase())) ||
      String(a.tokenNumber).includes(search);
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden relative">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-foreground flex-1">Astrologer Applications</h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {applications.filter((a) => a.status === 'pending').length} pending approval
          </span>
        </div>
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
            className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring w-48"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Token', 'Astrologer', 'Skills', 'City', 'Applied On', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={`ast-app-th-${h}`}
                    className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                  Loading applications...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                  No applications found.
                </td>
              </tr>
            ) : (
              filtered.map((ast, i) => (
                <motion.tr
                  key={ast.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors group ${ast.status === 'pending' ? 'bg-amber-500/5' : ''}`}
                >
                  <td className="px-5 py-4 font-mono font-semibold text-foreground">
                    #{ast.tokenNumber}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <div className="font-medium text-foreground">{ast.name}</div>
                      <div className="text-xs text-muted-foreground">{ast.email}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground truncate max-w-[150px]">
                    {ast.skills}
                  </td>
                  <td className="px-5 py-4 text-foreground">{ast.city}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {ast.createdAt ? new Date(ast.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ast.status === 'approved' ? 'bg-green-500/15 text-green-400' : ast.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}
                    >
                      {ast.status
                        ? ast.status.charAt(0).toUpperCase() + ast.status.slice(1)
                        : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedApp(ast)}
                        className="px-2.5 py-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </button>
                      {ast.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(ast.id, 'approved')}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-all"
                            title="Approve"
                          >
                            <Check size={14} className="text-green-400" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(ast.id, 'declined')}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all"
                            title="Decline"
                          >
                            <X size={14} className="text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for full details via Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
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
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <XCircle size={24} />
              </button>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full gold-gradient-bg flex items-center justify-center text-white text-2xl font-bold">
                  {selectedApp.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedApp.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded-md">
                      Token: #{selectedApp.tokenNumber}
                    </span>
                    <span className="mx-2">•</span>
                    {selectedApp.email}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${selectedApp.status === 'approved' ? 'bg-green-500/15 text-green-400' : selectedApp.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}
                  >
                    {selectedApp.status
                      ? selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)
                      : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground border-b border-border pb-2">
                    Personal Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">DOB:</span>{' '}
                      <span className="font-medium text-foreground">{selectedApp.dob}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Gender:</span>{' '}
                      <span className="font-medium text-foreground capitalize">
                        {selectedApp.gender}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">City:</span>{' '}
                      <span className="font-medium text-foreground">{selectedApp.city}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Phone Type:</span>{' '}
                      <span className="font-medium text-foreground">{selectedApp.phoneType}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground border-b border-border pb-2">
                    Professional Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Languages:</span>{' '}
                      <span className="font-medium text-foreground">{selectedApp.languages}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Skills:</span>{' '}
                      <span className="font-medium text-foreground">{selectedApp.skills}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Learning Source:</span>{' '}
                      <span className="font-medium text-foreground">
                        {selectedApp.learningSource}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Daily Hours:</span>{' '}
                      <span className="font-medium text-foreground">
                        {selectedApp.dailyHours} Hours
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Working Elsewhere:</span>{' '}
                      <span className="font-medium text-foreground capitalize">
                        {selectedApp.workingElsewhere}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-end gap-3">
                {selectedApp.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedApp.id, 'declined')}
                      className="px-6 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold transition-all"
                    >
                      Decline Application
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedApp.id, 'approved')}
                      className="px-6 py-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 font-semibold transition-all flex items-center gap-2"
                    >
                      <Check size={18} /> Approve Application
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-semibold transition-all"
                  >
                    Close
                  </button>
                )}
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
