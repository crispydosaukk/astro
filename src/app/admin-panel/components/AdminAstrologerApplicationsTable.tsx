'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Check,
  X,
  Eye,
  AlertTriangle,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Award,
  BookOpen,
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Define comprehensive astrologer application type
export interface AstrologerApp {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  dob?: string;
  city?: string;
  location?: string;
  gender?: string;
  languages?: string | string[];
  skills?: string | string[];
  specialisations?: string[];
  speciality?: string;
  experience?: string;
  qualification?: string;
  learningBackground?: string;
  learningSource?: string;
  bio?: string;
  about?: string;
  // KYC & Uploaded Documents
  aadhaarNumber?: string;
  aadhaarDocument?: string;
  aadhaarFileName?: string;
  panNumber?: string;
  panDocument?: string;
  panFileName?: string;
  otherDocuments?: Array<{
    id?: string;
    title?: string;
    category?: string;
    document?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
  }>;
  status: string;
  isVerified?: boolean;
  isOnline?: boolean;
  tokenNumber?: string | number;
  createdAt?: string;
  appliedAt?: string;
}

export default function AdminAstrologerApplicationsTable() {
  const [applications, setApplications] = useState<AstrologerApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<AstrologerApp | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; docUrl: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const appsMap = new Map<string, AstrologerApp>();

      // 1. Fetch from 'astrologers' collection
      try {
        const snapAst = await getDocs(collection(db, 'astrologers'));
        snapAst.forEach((docSnap) => {
          const d = docSnap.data();
          appsMap.set(docSnap.id, { id: docSnap.id, ...d } as AstrologerApp);
        });
      } catch (e) {
        console.warn('Error fetching astrologers:', e);
      }

      // 2. Fetch from 'candidates' collection and merge so no request is missed
      try {
        const snapCand = await getDocs(collection(db, 'candidates'));
        snapCand.forEach((docSnap) => {
          const d = docSnap.data();
          const existing = appsMap.get(docSnap.id) || ({} as any);
          appsMap.set(docSnap.id, {
            ...d,
            ...existing,
            id: docSnap.id,
            name: existing.name || d.name || 'Astrologer Candidate',
            email: existing.email || d.email || '',
            phone: existing.phone || d.phone || d.whatsapp || '',
            whatsapp: existing.whatsapp || d.whatsapp || existing.phone || d.phone || '',
            city: existing.city || existing.location || d.location || d.city || 'India',
            skills: existing.skills || existing.speciality || d.specialisations || 'Vedic Astrology',
            experience: existing.experience || d.experience || '5+ Years',
            qualification: existing.qualification || d.learningBackground || d.courseDetails || '',
            bio: existing.bio || existing.about || d.bio || '',
            status: (existing.status || d.lifecycleStatus || d.applicationStatus || 'pending').toLowerCase(),
            aadhaarNumber: existing.aadhaarNumber || d.aadhaarNumber || d.applicationData?.aadhaarNumber || '',
            aadhaarDocument: existing.aadhaarDocument || d.aadhaarDocument || d.applicationData?.aadhaarDocument || '',
            aadhaarFileName: existing.aadhaarFileName || d.aadhaarFileName || 'Aadhaar_Document',
            panNumber: existing.panNumber || d.panNumber || d.applicationData?.panNumber || '',
            panDocument: existing.panDocument || d.panDocument || d.applicationData?.panDocument || '',
            panFileName: existing.panFileName || d.panFileName || 'PAN_Document',
            otherDocuments: existing.otherDocuments || d.otherDocuments || d.applicationData?.otherDocuments || [],
            tokenNumber: existing.tokenNumber || d.tokenNumber || d.referenceId || String(docSnap.id).slice(-4),
            createdAt: existing.createdAt || d.createdAt || d.appliedAt || existing.appliedAt || new Date().toISOString(),
          } as AstrologerApp);
        });
      } catch (e) {
        console.warn('Error fetching candidates:', e);
      }

      const list = Array.from(appsMap.values()).sort((a, b) => {
        const tA = new Date(a.createdAt || a.appliedAt || 0).getTime();
        const tB = new Date(b.createdAt || b.appliedAt || 0).getTime();
        return tB - tA;
      });

      setApplications(list);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const isApproved = newStatus === 'approved';
      const astRef = doc(db, 'astrologers', id);

      // Status update: if accepted, onboard immediately and set offline by default
      await updateDoc(astRef, {
        status: newStatus,
        isVerified: isApproved,
        isOnline: false, // Default to offline as requested
        onboardingStatus: isApproved ? 'completed' : 'rejected',
        applicationStatus: isApproved ? 'approved' : 'rejected',
        updatedAt: new Date().toISOString(),
      });

      // Also sync candidates collection if doc exists
      try {
        const candRef = doc(db, 'candidates', id);
        await updateDoc(candRef, {
          lifecycleStatus: isApproved ? 'approved' : 'rejected',
          applicationStatus: isApproved ? 'Approved & Onboarded' : 'Rejected',
          status: newStatus,
          isVerified: isApproved,
          updatedAt: new Date().toISOString(),
        });
      } catch {}

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus, isVerified: isApproved, isOnline: false } : a))
      );

      if (isApproved) {
        toast.success('Astrologer Approved & Onboarded! Defaulted to Offline until they switch Online in their dashboard.');
      } else {
        toast.error('Astrologer Application Rejected. Next time user enters phone on login, rejection notice will show.');
      }

      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus, isVerified: isApproved, isOnline: false });
      }
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
      toast.error('Failed to update status');
    }
  };

  const filtered = applications.filter((a) => {
    const sTerm = search.toLowerCase();
    const matchSearch =
      (a.name && a.name.toLowerCase().includes(sTerm)) ||
      (a.email && a.email.toLowerCase().includes(sTerm)) ||
      (a.phone && a.phone.includes(sTerm)) ||
      (a.city && a.city.toLowerCase().includes(sTerm)) ||
      String(a.tokenNumber).includes(sTerm);

    const st = String(a.status || '').toLowerCase();
    const isPending = st === 'pending' || st === 'under_review' || st === 'under review';
    const isApproved = st === 'approved' || st === 'active' || st === 'onboarded';
    const isRejected = st === 'rejected' || st === 'declined';

    if (filterStatus === 'all') return matchSearch;
    if (filterStatus === 'pending') return matchSearch && isPending;
    if (filterStatus === 'approved') return matchSearch && isApproved;
    if (filterStatus === 'declined' || filterStatus === 'rejected') return matchSearch && isRejected;
    return matchSearch;
  });

  const pendingCount = applications.filter((a) => {
    const st = String(a.status || '').toLowerCase();
    return st === 'pending' || st === 'under_review' || st === 'under review';
  }).length;

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden relative">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-foreground flex-1">Astrologer Onboarding Requests</h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {pendingCount} pending review
          </span>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring w-56"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved & Onboarded</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Token / ID', 'Astrologer Candidate', 'Contact', 'Specialisations', 'City', 'Applied On', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={`ast-app-th-${h}`}
                    className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
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
                <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                  Loading applications...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                  No astrologer applications found.
                </td>
              </tr>
            ) : (
              filtered.map((ast, i) => {
                const st = String(ast.status || '').toLowerCase();
                const isPending = st === 'pending' || st === 'under_review' || st === 'under review';
                const isApproved = st === 'approved' || st === 'active' || st === 'onboarded';

                return (
                  <motion.tr
                    key={ast.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors group ${
                      isPending ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="px-5 py-4 font-mono font-semibold text-foreground whitespace-nowrap">
                      #{ast.tokenNumber || ast.id.slice(-5)}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-bold text-foreground">{ast.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Award size={11} className="text-amber-500" />
                          <span>{ast.experience || 'Vedic Practice'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <Phone size={11} className="text-emerald-500" />
                          <span>{ast.phone || 'No phone'}</span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1 truncate max-w-[170px]">
                          <Mail size={11} />
                          <span>{ast.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground truncate max-w-[160px]">
                      {Array.isArray(ast.skills) ? ast.skills.join(', ') : (ast.skills || 'Vedic Jyotish')}
                    </td>
                    <td className="px-5 py-4 text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin size={11} className="text-primary" />
                        <span>{ast.city || ast.location || 'India'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {ast.createdAt || ast.appliedAt ? new Date(ast.createdAt || ast.appliedAt!).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isApproved
                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                            : isPending
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {isApproved ? 'Approved' : isPending ? 'Pending' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedApp(ast)}
                          className="px-2.5 py-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye size={12} /> View Full
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleStatusChange(ast.id, 'approved')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1 text-xs font-bold"
                              title="Accept & Onboard Astrologer"
                            >
                              <Check size={13} /> Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(ast.id, 'rejected')}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all flex items-center gap-1 text-xs font-bold"
                              title="Reject Application"
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for full candidate details + document viewer */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedApp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedApp(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative"
                >
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <XCircle size={24} />
                  </button>

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="w-16 h-16 rounded-full gold-gradient-bg flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {selectedApp.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedApp.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center flex-wrap gap-2 mt-1">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded-md text-foreground font-semibold">
                          Token: #{selectedApp.tokenNumber || selectedApp.id.slice(-5)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Phone size={12} className="text-emerald-500" />
                          {selectedApp.phone}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {selectedApp.email}
                        </span>
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          selectedApp.status === 'approved'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : selectedApp.status === 'pending' || selectedApp.status === 'under_review'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Section 1: Candidate Bio & Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-2xl border border-border space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/60 pb-2">
                          <BookOpen size={13} /> Astrological Experience & Practice
                        </h4>
                        <div className="text-xs space-y-1.5 pt-1">
                          <p>
                            <span className="text-muted-foreground font-medium">Experience:</span>{' '}
                            <span className="font-bold text-foreground">{selectedApp.experience || 'Not specified'}</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">Specialisations:</span>{' '}
                            <span className="font-bold text-foreground">
                              {Array.isArray(selectedApp.skills)
                                ? selectedApp.skills.join(', ')
                                : Array.isArray(selectedApp.specialisations)
                                ? selectedApp.specialisations.join(', ')
                                : (selectedApp.skills || 'Vedic Astrology')}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">Languages:</span>{' '}
                            <span className="font-bold text-foreground">
                              {Array.isArray(selectedApp.languages) ? selectedApp.languages.join(', ') : selectedApp.languages || 'Hindi, English'}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">Location / City:</span>{' '}
                            <span className="font-bold text-foreground">{selectedApp.city || selectedApp.location || 'India'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-2xl border border-border space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/60 pb-2">
                          <Award size={13} /> Guru Lineage & Qualification
                        </h4>
                        <div className="text-xs space-y-1.5 pt-1">
                          <p>
                            <span className="text-muted-foreground font-medium">Lineage / Gurukul:</span>{' '}
                            <span className="font-bold text-foreground">
                              {selectedApp.qualification || selectedApp.learningBackground || selectedApp.learningSource || 'Traditional Lineage'}
                            </span>
                          </p>
                          {selectedApp.bio && (
                            <div className="mt-2 pt-2 border-t border-border/60">
                              <span className="text-muted-foreground font-medium block mb-1">About / Consultation Bio:</span>
                              <p className="text-foreground leading-relaxed italic bg-card/60 p-2.5 rounded-xl border border-border/60">
                                "{selectedApp.bio}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Uploaded Images & Verification Documents */}
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <ShieldCheck size={14} /> Uploaded KYC & Identity Documents
                        </h4>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Click to View Images / Files
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        {/* 1. Aadhaar Card Card */}
                        <div className="p-3 bg-card rounded-xl border border-border flex flex-col justify-between space-y-2 shadow-2xs">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                                Aadhaar Card
                              </span>
                              {selectedApp.aadhaarDocument ? (
                                <span className="text-2xs bg-emerald-500/15 text-emerald-500 font-bold px-1.5 py-0.2 rounded">
                                  ✓ Attached
                                </span>
                              ) : (
                                <span className="text-2xs bg-muted text-muted-foreground font-medium px-1.5 py-0.2 rounded">
                                  Not Uploaded
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-foreground mt-1">
                              {selectedApp.aadhaarNumber ? `No: ${selectedApp.aadhaarNumber}` : 'Number provided'}
                            </p>
                            <p className="text-2xs text-muted-foreground truncate">
                              {selectedApp.aadhaarFileName || 'Aadhaar_Document'}
                            </p>
                          </div>

                          {selectedApp.aadhaarDocument ? (
                            <button
                              onClick={() =>
                                setViewingDoc({
                                  title: `Aadhaar Card - ${selectedApp.name}`,
                                  docUrl: selectedApp.aadhaarDocument!,
                                })
                              }
                              className="w-full py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <Eye size={12} /> View Document Image
                            </button>
                          ) : (
                            <span className="text-2xs text-muted-foreground text-center italic py-1">No file preview</span>
                          )}
                        </div>

                        {/* 2. PAN Card */}
                        <div className="p-3 bg-card rounded-xl border border-border flex flex-col justify-between space-y-2 shadow-2xs">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                                PAN Card
                              </span>
                              {selectedApp.panDocument ? (
                                <span className="text-2xs bg-emerald-500/15 text-emerald-500 font-bold px-1.5 py-0.2 rounded">
                                  ✓ Attached
                                </span>
                              ) : (
                                <span className="text-2xs bg-muted text-muted-foreground font-medium px-1.5 py-0.2 rounded">
                                  Not Uploaded
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-foreground mt-1">
                              {selectedApp.panNumber ? `PAN: ${selectedApp.panNumber}` : 'Number provided'}
                            </p>
                            <p className="text-2xs text-muted-foreground truncate">
                              {selectedApp.panFileName || 'PAN_Document'}
                            </p>
                          </div>

                          {selectedApp.panDocument ? (
                            <button
                              onClick={() =>
                                setViewingDoc({
                                  title: `PAN Card - ${selectedApp.name}`,
                                  docUrl: selectedApp.panDocument!,
                                })
                              }
                              className="w-full py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <Eye size={12} /> View Document Image
                            </button>
                          ) : (
                            <span className="text-2xs text-muted-foreground text-center italic py-1">No file preview</span>
                          )}
                        </div>

                        {/* 3. Supporting Documents */}
                        {Array.isArray(selectedApp.otherDocuments) && selectedApp.otherDocuments.length > 0 ? (
                          selectedApp.otherDocuments.map((docItem, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-card rounded-xl border border-border flex flex-col justify-between space-y-2 shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Certificate #{idx + 1}
                                  </span>
                                  <span className="text-2xs bg-accent/15 text-accent font-bold px-1.5 py-0.2 rounded">
                                    {docItem.category || 'Certificate'}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-foreground mt-1 truncate">
                                  {docItem.title || 'Supporting Document'}
                                </p>
                                <p className="text-2xs text-muted-foreground truncate">{docItem.fileName || 'Document'}</p>
                              </div>

                              {docItem.document || docItem.fileUrl ? (
                                <button
                                  onClick={() =>
                                    setViewingDoc({
                                      title: `${docItem.title || 'Certificate'} - ${selectedApp.name}`,
                                      docUrl: (docItem.document || docItem.fileUrl)!,
                                    })
                                  }
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent text-xs font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                  <Eye size={12} /> View Certificate
                                </button>
                              ) : (
                                <span className="text-2xs text-muted-foreground text-center italic py-1">No file preview</span>
                              )}
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer with Direct Flow Accept / Reject */}
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-muted-foreground">
                      * Accepting directly onboards the astrologer with <strong className="text-foreground">Offline</strong> status by default.
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                        className="px-5 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold transition-all text-xs flex items-center gap-1.5"
                      >
                        <X size={15} /> Reject Application
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedApp.id, 'approved')}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Check size={16} /> Accept & Onboard Directly
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Document / Image Viewer Sub-Modal */}
            {viewingDoc && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingDoc(null)}
                className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border p-5 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      <h4 className="font-bold text-foreground text-sm">{viewingDoc.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingDoc.docUrl.startsWith('http') && (
                        <a
                          href={viewingDoc.docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                        >
                          <ExternalLink size={14} /> Open in Tab
                        </a>
                      )}
                      <button
                        onClick={() => setViewingDoc(null)}
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto flex items-center justify-center py-4 bg-muted/20 rounded-xl mt-3">
                    {viewingDoc.docUrl.startsWith('data:image') ||
                    viewingDoc.docUrl.startsWith('http') ||
                    viewingDoc.docUrl.includes('.jpg') ||
                    viewingDoc.docUrl.includes('.png') ||
                    viewingDoc.docUrl.includes('.webp') ? (
                      <img
                        src={viewingDoc.docUrl}
                        alt={viewingDoc.title}
                        className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <FileText size={48} className="text-primary mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-foreground">PDF or Binary Document</p>
                        <p className="text-xs text-muted-foreground mt-1">Uploaded document file preview.</p>
                      </div>
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
