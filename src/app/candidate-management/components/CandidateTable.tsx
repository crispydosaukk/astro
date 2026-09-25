'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Send, 
  MoreHorizontal, 
  Trash2, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Database,
  Sparkles, 
  Upload, 
  Download, 
  X, 
  Plus, 
  Check, 
  Users, 
  Phone, 
  Mail, 
  Globe,
  UserPlus,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Smartphone,
  Zap,
  Layers,
  RefreshCw
} from 'lucide-react';
import { 
  Candidate, 
  subscribeToCandidates, 
  seedInitialCandidates, 
  deleteCandidateFromFirestore,
  deleteAllCandidatesFromFirestore,
  saveCandidateToFirestore,
  updateCandidateStatus,
  resolveCandidateContact
} from '@/lib/firebase/candidateService';
import { subscribeToCampaigns } from '@/lib/firebase/discoveryService';
import { queueSmsViaMsg91, dispatchParallelOutreach } from '@/lib/firebase/smsService';
import CandidateProfileModal from '@/components/candidates/CandidateProfileModal';
import AddCandidateModal from '@/components/candidates/AddCandidateModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import CandidateTableHeader, { ColumnVisibility, OutreachCounts } from './CandidateTableHeader';
import MultiChannelOutreachModal from '@/components/candidates/MultiChannelOutreachModal';

type SortKey = 'name' | 'rating' | 'discoveredDate' | 'lifecycleStatus';

export default function CandidateTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  
  // Header Filters & Search State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSpec, setFilterSpec] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterScoreRange, setFilterScoreRange] = useState('All');
  const [channelFilter, setChannelFilter] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('All');
  const [campaignsList, setCampaignsList] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState('All');

  // Column Visibility State
  const [columns, setColumns] = useState<ColumnVisibility>({
    phone: true,
    email: true,
    location: true,
    website: false,
    specialisations: true,
    rating: true,
    experience: true,
    source: true,
    outreach: true,
    lifecycle: true,
    discovered: true,
  });

  // Table selection & pagination
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('discoveredDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Modals state
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState<Candidate | null>(null);
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<{ candidate: Candidate; evaluation: any } | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [quickParallelCandidate, setQuickParallelCandidate] = useState<Candidate | null>(null);
  const [quickParallelEmail, setQuickParallelEmail] = useState('');
  const [quickParallelPhone, setQuickParallelPhone] = useState('');
  const [isSendingQuickParallel, setIsSendingQuickParallel] = useState(false);
  const [multiOutreachRecipients, setMultiOutreachRecipients] = useState<Candidate[] | null>(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (firestoreCandidates) => {
          setCandidates(firestoreCandidates || []);
          setIsFirestoreLive(true);
        },
        (err) => {
          console.warn('Firestore subscription status:', err.message);
          setIsFirestoreLive(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Unable to subscribe to Firestore candidates:', e);
      setIsFirestoreLive(false);
    }
  }, []);

  // Subscribe to real-time discovery campaigns for filter list
  useEffect(() => {
    try {
      const unsub = subscribeToCampaigns((camps) => {
        const names = camps.map(c => c.name).filter(Boolean);
        setCampaignsList(names);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Unable to subscribe to campaigns:', e);
    }
  }, []);

  const searchParams = useSearchParams();

  // Sync state with URL search parameters on mount or navigation
  useEffect(() => {
    const channelParam = searchParams?.get('channel');
    if (channelParam) {
      setChannelFilter(channelParam);
    }
    const statusParam = searchParams?.get('status');
    if (statusParam) {
      setFilterStatus(statusParam);
    }
    const campaignParam = searchParams?.get('campaign');
    if (campaignParam) {
      setFilterCampaign(campaignParam);
    }
    const locationParam = searchParams?.get('location');
    if (locationParam) {
      setFilterLocation(locationParam);
    }
  }, [searchParams]);

  const handleChannelFilterChange = (newChannel: string) => {
    setChannelFilter(newChannel);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newChannel === 'all') {
        url.searchParams.delete('channel');
      } else {
        url.searchParams.set('channel', newChannel);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCampaignFilterChange = (newCampaign: string) => {
    setFilterCampaign(newCampaign);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newCampaign === 'All') {
        url.searchParams.delete('campaign');
      } else {
        url.searchParams.set('campaign', newCampaign);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleLocationFilterChange = (newLoc: string) => {
    setFilterLocation(newLoc);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newLoc === 'All') {
        url.searchParams.delete('location');
      } else {
        url.searchParams.set('location', newLoc);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Derive unique campaign options from both active campaigns and candidate records
  const campaignOptions = useMemo(() => {
    const namesSet = new Set<string>();
    campaignsList.forEach(name => {
      if (name && name.trim()) namesSet.add(name.trim());
    });
    candidates.forEach(c => {
      const name = c.campaignName || (c as any).campaign;
      if (name && typeof name === 'string' && name.trim()) {
        namesSet.add(name.trim());
      }
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [campaignsList, candidates]);

  // Derive unique location options from candidate records
  const locationOptions = useMemo(() => {
    const locSet = new Set<string>();
    candidates.forEach(c => {
      if (c.location && typeof c.location === 'string' && c.location.trim()) {
        locSet.add(c.location.trim());
      }
    });
    return Array.from(locSet).sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const handleDirectWhatsApp = async (candidate: Candidate, phoneNum: string) => {
    const cleanPhone = phoneNum.replace(/[^\d+]/g, '').replace(/^0+/, '');
    const phoneWithCountry = cleanPhone.startsWith('+') 
      ? cleanPhone.slice(1) 
      : cleanPhone.length === 10 
      ? `91${cleanPhone}` 
      : cleanPhone;

    const camp = candidate.campaignName || (candidate as any).campaign || '';
    const src = candidate.source || 'Discovery';
    const appUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/apply?id=${candidate.id}&name=${encodeURIComponent(candidate.name)}&phone=${encodeURIComponent(cleanPhone)}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`
      : `/apply?id=${candidate.id}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`;

    const text = `Namaste ${candidate.name} Ji 🙏,\n\nWe came across your esteemed astrology practice in ${candidate.location}. At AstroParihar, we are onboarding verified Astrologers for our global platform.\n\nWe would be honored to invite you to join our panel. You can review our invitation and complete your verification here:\n${appUrl}\n\nWarm regards,\nRecruitment Team, AstroParihar`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');

    // Update status to Sent (WhatsApp)
    await handleStatusChange(candidate.id, 'ready-for-outreach', 'Sent (WhatsApp)');
    showToast('WhatsApp Outreach Dispatched', `Direct invitation sent to ${candidate.name} (${phoneWithCountry}).`, 'success');
  };

  const handleDirectSms = async (candidate: Candidate, phoneNum: string) => {
    const cleanPhone = phoneNum.replace(/[^\d+]/g, '').replace(/^0+/, '');
    const camp = candidate.campaignName || (candidate as any).campaign || '';
    const src = candidate.source || 'Discovery';
    const appUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/apply?id=${candidate.id}&name=${encodeURIComponent(candidate.name)}&phone=${encodeURIComponent(cleanPhone)}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`
      : `https://astroparihar.com/apply?id=${candidate.id}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`;

    const smsText = `Namaste ${candidate.name} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: ${appUrl} - AstroParihar`;

    try {
      showToast('Dispatching SMS...', `Sending invitation to ${candidate.name} via MSG91 Gateway.`, 'info');
      const res = await queueSmsViaMsg91({
        phone: cleanPhone,
        candidateName: candidate.name,
        candidateId: candidate.id,
        message: smsText,
        templateId: '6ab4e155fe7c2c662905ac73',
        variables: {
          candidate_name: candidate.name,
          name: candidate.name,
          link: appUrl,
          specialisation: candidate.specialisations?.[0] || 'Vedic Astrology',
          location: candidate.location || 'India',
        }
      });

      if (res.success) {
        await handleStatusChange(candidate.id, 'ready-for-outreach', 'Sent (SMS)');
        showToast('SMS Dispatched Successfully', `SMS invitation sent to ${candidate.name} (${cleanPhone}) via MSG91.`, 'success');
      } else {
        showToast('SMS Dispatch Warning', res.error || 'Gateway logged transaction with note.', 'info');
      }
    } catch (err: any) {
      showToast('SMS Dispatch Failed', err.message, 'error');
    }
  };

  const handleOpenQuickParallel = (candidate: Candidate) => {
    setMultiOutreachRecipients([candidate]);
  };

  const handleExecuteQuickParallel = async (candidate: Candidate, targetEmail: string, targetPhone: string) => {
    setIsSendingQuickParallel(true);
    const cleanPhone = targetPhone.replace(/[^\d+]/g, '').replace(/^0+/, '');
    const cleanEmail = targetEmail.trim();

    const camp = candidate.campaignName || (candidate as any).campaign || '';
    const src = candidate.source || 'Discovery';
    const appUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/apply?id=${candidate.id}&name=${encodeURIComponent(candidate.name)}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`
      : `https://astroparihar.com/apply?id=${candidate.id}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`;

    const emailSubject = `Invitation to Join AstroParihar Astrologer Panel – ${candidate.name}`;
    const emailBody = `Namaste ${candidate.name} Ji,\n\nWe are delighted to invite you to join AstroParihar's premier network of verified astrologers. Having reviewed your esteemed practice in ${candidate.location} specializing in ${candidate.specialisations?.join(', ') || 'Vedic Astrology'}, we would be honored to partner with you.\n\nPlease review your verification dossier and onboarding details at:\n${appUrl}\n\nWarm regards,\nRecruitment Team, AstroParihar`;
    const smsText = `Namaste ${candidate.name} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: ${appUrl} - AstroParihar`;

    try {
      const res = await dispatchParallelOutreach({
        candidateName: candidate.name,
        candidateId: candidate.id,
        email: cleanEmail || undefined,
        emailSubject,
        emailBody,
        phone: cleanPhone || undefined,
        smsMessage: smsText,
        smsTemplateId: '6ab4e155fe7c2c662905ac73',
        specialisation: candidate.specialisations?.[0] || 'Vedic Astrology',
        location: candidate.location || 'India',
      });

      const emailOk = !cleanEmail || res.email.success;
      const smsOk = !cleanPhone || res.sms.success;

      if (emailOk && smsOk) {
        const statusLabel = cleanEmail && cleanPhone ? 'Sent (Email + SMS)' : cleanEmail ? 'Sent (Email)' : 'Sent (SMS)';
        await handleStatusChange(candidate.id, 'ready-for-outreach', statusLabel);
        setQuickParallelCandidate(null);
        showToast(
          '⚡ Dual Outreach Dispatched!',
          `Successfully dispatched message${cleanEmail ? ` to Email (${cleanEmail})` : ''}${cleanPhone ? ` and SMS (${cleanPhone})` : ''}!`,
          'success'
        );
      } else if (res.email.success && !res.sms.success) {
        await handleStatusChange(candidate.id, 'ready-for-outreach', 'Sent (Email)');
        showToast(
          'Email Sent, SMS Failed',
          `Email sent to ${cleanEmail}. SMS Error: ${res.sms.error || 'Gateway rejected SMS'}`,
          'info'
        );
      } else if (!res.email.success && res.sms.success) {
        await handleStatusChange(candidate.id, 'ready-for-outreach', 'Sent (SMS)');
        showToast(
          'SMS Sent, Email Failed',
          `SMS sent to ${cleanPhone}. Email Error: ${res.email.error || 'SMTP rejected'}`,
          'info'
        );
      } else {
        showToast(
          'Outreach Dispatch Failed',
          `Email: ${res.email.error || 'Error'} | SMS: ${res.sms.error || 'Error'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast('Parallel Dispatch Exception', err.message, 'error');
    } finally {
      setIsSendingQuickParallel(false);
    }
  };

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleToggleColumn = (key: keyof ColumnVisibility) => {
    setColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCandidateAdded = (newCandidate: Candidate) => {
    setCandidates(prev => {
      const exists = prev.some(c => c.id === newCandidate.id);
      if (exists) {
        return prev.map(c => c.id === newCandidate.id ? newCandidate : c);
      }
      return [newCandidate, ...prev];
    });
    showToast(
      `Candidate Added: ${newCandidate.name}`,
      `Successfully registered ${newCandidate.name} with ${newCandidate.specialisations.join(', ')}.`,
      'success'
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCandidateFromFirestore(id);
    } catch (e) {
      console.warn('Local delete fallback:', e);
    }
    setCandidates(prev => prev.filter(c => c.id !== id));
    setSelectedRows(prev => prev.filter(r => r !== id));
    setActionMenuOpen(null);
    showToast('Candidate removed from pipeline', '', 'info');
  };

  const handleStatusChange = async (id: string, newLifecycle: string, newOutreach?: string) => {
    try {
      await updateCandidateStatus(id, {
        lifecycleStatus: newLifecycle,
        ...(newOutreach ? { outreachStatus: newOutreach } : {})
      });
    } catch (_e) {}
    setCandidates(prev => prev.map(c => c.id === id ? {
      ...c,
      lifecycleStatus: newLifecycle,
      ...(newOutreach ? { outreachStatus: newOutreach } : {})
    } : c));
    setActionMenuOpen(null);
    showToast('Status updated successfully', `Stage changed to ${newLifecycle.toUpperCase()}`, 'success');
  };

  // Live AI Qualification with GPT-4o
  const handleAiQualify = async (candidate: Candidate) => {
    setQualifyingId(candidate.id);
    try {
      const res = await fetch('/api/ai/qualify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: candidate.name,
          specialization: candidate.specialisations.join(', '),
          experienceYears: parseInt(candidate.experience) || 10,
          consultationCount: 500,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        const newScore = data.evaluation.qualificationScore;
        const updated = {
          ...candidate,
          aiScore: newScore,
          lifecycleStatus: newScore >= 80 ? 'qualified' : candidate.lifecycleStatus,
        };
        try {
          await saveCandidateToFirestore(updated);
        } catch (_e) {}
        setCandidates(prev => prev.map(c => c.id === candidate.id ? updated : c));
        setDossier({
          candidate: updated,
          evaluation: data.evaluation,
        });
      }
    } catch (err) {
      console.error('AI Re-Score failed:', err);
    } finally {
      setQualifyingId(null);
    }
  };

  // CSV Import handler
  const handleCsvImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split('\n');
    const newAdded: Candidate[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith('name,')) continue;
      const parts = line.split(',').map((p: string) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const location = parts[1] || 'India';
        const spec = parts[2] ? [parts[2]] : ['Vedic Jyotish'];
        const exp = parts[3] || '8 yrs';
        const cand: Candidate = {
          id: `cand-${Date.now().toString().slice(-4)}-${i}`,
          name,
          businessName: `${name} Astrology Centre`,
          location,
          specialisations: spec,
          aiScore: Math.floor(Math.random() * 15) + 82,
          source: 'CSV Upload',
          outreachStatus: 'Not Sent',
          applicationStatus: null,
          lifecycleStatus: 'discovered',
          discoveredDate: 'Today',
          isDuplicate: false,
          experience: exp,
        };
        try {
          await saveCandidateToFirestore(cand);
        } catch (_e) {}
        newAdded.push(cand);
      }
    }

    if (newAdded.length > 0) {
      setCandidates(prev => [...newAdded, ...prev]);
      showToast(`Imported ${newAdded.length} candidates from CSV!`);
    }
    setIsCsvModalOpen(false);
    setCsvContent('');
  };

  // Export CSV of currently filtered candidates
  const handleExportCsv = () => {
    const listToExport = filteredCandidates;
    const headers = 'ID,Name,Business,Location,Phone,Email,Specialisations,AIScore,Experience,Source,OutreachStatus,LifecycleStatus\n';
    const rows = listToExport.map(c => {
      const contact = resolveCandidateContact(c);
      return `"${c.id}","${c.name}","${c.businessName}","${c.location}","${contact.phone || ''}","${contact.email || ''}","${c.specialisations.join(';')}","${c.aiScore}","${c.experience}","${c.source}","${c.outreachStatus}","${c.lifecycleStatus}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astroparihar_candidates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Candidates Exported', `Exported ${listToExport.length} candidates to CSV.`, 'info');
  };

  const handlePurgeAllCandidates = () => {
    setIsPurgeConfirmOpen(true);
  };

  const handleConfirmPurge = async () => {
    setIsPurging(true);
    try {
      setSyncStatus('Purging all candidate profiles...');
      const res = await deleteAllCandidatesFromFirestore();
      if (res.success) {
        setCandidates([]);
        setSelectedRows([]);
        showToast('All candidates purged', `Removed ${res.count} profiles from the pipeline.`, 'info');
      } else {
        showToast('Purge Failed', 'Unable to delete candidates from database.', 'error');
      }
    } catch (err: any) {
      showToast('Purge Error', err.message, 'error');
    } finally {
      setIsPurging(false);
      setIsPurgeConfirmOpen(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Outreach Channel & Method Counts
  const outreachCounts: OutreachCounts = useMemo(() => {
    let needWhatsapp = 0;
    let needEmail = 0;
    let whatsappSent = 0;
    let emailSent = 0;
    let phoneOnly = 0;

    candidates.forEach(c => {
      const contact = resolveCandidateContact(c);
      const hasPhone = Boolean(c.phone || contact.phone);
      const hasEmail = Boolean(c.email || contact.email);
      const isSent = c.outreachStatus === 'Sent' || c.outreachStatus === 'Contacted';
      const isApproved = c.outreachStatus === 'Approved' || c.outreachStatus === 'Pending Approval' || c.outreachStatus === 'Not Sent';

      if (hasPhone && !hasEmail) phoneOnly++;

      // WhatsApp metrics
      if (hasPhone && (c.outreachStatus?.toLowerCase().includes('whatsapp') || (isSent && !hasEmail))) {
        whatsappSent++;
      } else if (hasPhone && isApproved) {
        needWhatsapp++;
      }

      // Email metrics
      if (hasEmail && (c.outreachStatus?.toLowerCase().includes('email') || (isSent && hasEmail))) {
        emailSent++;
      } else if (hasEmail && isApproved) {
        needEmail++;
      }
    });

    return {
      total: candidates.length,
      needWhatsapp,
      needEmail,
      whatsappSent,
      emailSent,
      phoneOnly,
    };
  }, [candidates]);

  // Candidate Lifecycle & Channel Stats for Dashboard
  const candidateStats = useMemo(() => {
    let ready = 0;
    let contacted = 0;
    let applied = 0;
    let verified = 0;
    let phoneCount = 0;
    let emailCount = 0;

    candidates.forEach(c => {
      const contact = resolveCandidateContact(c);
      if (c.phone || contact.phone) phoneCount++;
      if (c.email || contact.email) emailCount++;

      const st = (c.lifecycleStatus || '').toLowerCase();
      const ost = (c.outreachStatus || '').toLowerCase();

      if (st === 'verified') {
        verified++;
      } else if (st === 'applied' || st === 'screening' || st === 'human-review' || st === 'probation') {
        applied++;
      } else if (ost.includes('sent') || ost.includes('contacted') || st === 'contacted') {
        contacted++;
      } else if (st === 'ready-for-outreach' || ost === 'approved' || ost === 'pending approval' || ost === 'not sent') {
        ready++;
      }
    });

    return {
      total: candidates.length,
      ready,
      contacted,
      applied,
      verified,
      phoneCount,
      emailCount,
    };
  }, [candidates]);

  // Filter candidates based on search, filter panel & outreach channel
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const contact = resolveCandidateContact(c);
        const matchName = c.name?.toLowerCase().includes(query);
        const matchBusiness = c.businessName?.toLowerCase().includes(query);
        const matchLocation = c.location?.toLowerCase().includes(query);
        const matchPhone = (c.phone || contact.phone)?.toLowerCase().includes(query);
        const matchEmail = (c.email || contact.email)?.toLowerCase().includes(query);
        const matchId = c.id?.toLowerCase().includes(query);
        const matchSpec = c.specialisations?.some(s => s.toLowerCase().includes(query));
        
        if (!matchName && !matchBusiness && !matchLocation && !matchPhone && !matchEmail && !matchId && !matchSpec) {
          return false;
        }
      }

      // 2. Status / Lifecycle Filter
      if (filterStatus !== 'All') {
        const normalizedFilter = filterStatus.toLowerCase().replace(/ /g, '-');
        const candidateLifecycle = (c.lifecycleStatus || '').toLowerCase();
        const candidateOutreach = (c.outreachStatus || '').toLowerCase();
        
        const matchesLifecycle = candidateLifecycle.includes(normalizedFilter) || candidateLifecycle === normalizedFilter;
        const matchesOutreach = candidateOutreach.includes(filterStatus.toLowerCase());
        
        if (!matchesLifecycle && !matchesOutreach) {
          return false;
        }
      }

      // 3. Specialisation Filter
      if (filterSpec !== 'All') {
        const hasSpec = c.specialisations?.some(s => s.toLowerCase() === filterSpec.toLowerCase());
        if (!hasSpec) return false;
      }

      // 4. Source Filter
      if (filterSource !== 'All') {
        if (c.source?.toLowerCase() !== filterSource.toLowerCase()) {
          return false;
        }
      }

      // 5. Score Range Filter
      if (filterScoreRange !== 'All') {
        const score = c.aiScore || 0;
        if (filterScoreRange === '90–100' && (score < 90 || score > 100)) return false;
        if (filterScoreRange === '80–89' && (score < 80 || score >= 90)) return false;
        if (filterScoreRange === '70–79' && (score < 70 || score >= 80)) return false;
        if (filterScoreRange === '60–69' && (score < 60 || score >= 70)) return false;
        if (filterScoreRange === 'Below 60' && score >= 60) return false;
      }

      // 6. Outreach Channel Filter
      if (channelFilter !== 'all') {
        const contact = resolveCandidateContact(c);
        const hasPhone = Boolean(c.phone || contact.phone);
        const hasEmail = Boolean(c.email || contact.email);
        const isSent = c.outreachStatus === 'Sent' || c.outreachStatus === 'Contacted';
        const isApproved = c.outreachStatus === 'Approved' || c.outreachStatus === 'Pending Approval' || c.outreachStatus === 'Not Sent';

        if (channelFilter === 'need-whatsapp') {
          if (!hasPhone || !isApproved) return false;
        } else if (channelFilter === 'need-email') {
          if (!hasEmail || !isApproved) return false;
        } else if (channelFilter === 'whatsapp-sent') {
          const wasWhatsapp = hasPhone && (c.outreachStatus?.toLowerCase().includes('whatsapp') || (isSent && !hasEmail));
          if (!wasWhatsapp) return false;
        } else if (channelFilter === 'email-sent') {
          const wasEmail = hasEmail && (c.outreachStatus?.toLowerCase().includes('email') || (isSent && hasEmail));
          if (!wasEmail) return false;
        } else if (channelFilter === 'sms-sent') {
          const wasSms = c.outreachStatus?.toLowerCase().includes('sms');
          if (!wasSms) return false;
        } else if (channelFilter === 'only-whatsapp' || channelFilter === 'phone-only') {
          if (!hasPhone || hasEmail) return false;
        } else if (channelFilter === 'only-email') {
          if (!hasEmail || hasPhone) return false;
        } else if (channelFilter === 'only-sms') {
          if (!hasPhone) return false;
        } else if (channelFilter === 'multi-channel' || channelFilter === 'both') {
          if (!hasPhone || !hasEmail) return false;
        }
      }

      // 7. Campaign Filter
      if (filterCampaign !== 'All') {
        const candCampaign = (c.campaignName || (c as any).campaign || '').toLowerCase().trim();
        if (candCampaign !== filterCampaign.toLowerCase().trim()) {
          return false;
        }
      }

      // 8. Location Filter
      if (filterLocation !== 'All') {
        const queryLoc = filterLocation.toLowerCase().trim();
        const candLoc = (c.location || '').toLowerCase().trim();
        if (!candLoc.includes(queryLoc) && !queryLoc.includes(candLoc)) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, search, filterStatus, filterSpec, filterSource, filterScoreRange, channelFilter, filterCampaign, filterLocation]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      let av: string | number = (a[sortKey] as string | number) ?? '';
      let bv: string | number = (b[sortKey] as string | number) ?? '';
      if (sortKey === 'rating') {
        av = a.rating || 0;
        bv = b.rating || 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCandidates, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage) || 1;
  const paginated = useMemo(() => {
    return sorted.slice((page - 1) * perPage, page * perPage);
  }, [sorted, page, perPage]);

  // Selection
  const allSelected = selectedRows.length === filteredCandidates.length && filteredCandidates.length > 0;

  const toggleAll = () => {
    setSelectedRows(allSelected ? [] : filteredCandidates.map(c => c.id));
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col opacity-40">
      <ChevronUp size={9} className={sortKey === col && sortDir === 'asc' ? 'opacity-100 text-primary' : ''} />
      <ChevronDown size={9} className={sortKey === col && sortDir === 'desc' ? 'opacity-100 text-primary' : ''} />
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slide-up flex items-center gap-3 bg-card border border-primary/30 text-foreground px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="pr-2">
            <p className="text-xs font-bold text-foreground">{toastMessage.title}</p>
            {toastMessage.desc && <p className="text-2xs text-muted-foreground mt-0.5">{toastMessage.desc}</p>}
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Candidate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => { setFilterStatus('All'); setChannelFilter('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'All' && channelFilter === 'all' 
              ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
              : 'border-border bg-card hover:border-primary/40'
          }`}
          title="Click to view all candidates"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Total Pipeline</span>
            <Users size={14} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{candidateStats.total}</p>
          <p className="text-3xs text-muted-foreground mt-0.5">All registered candidates</p>
        </div>

        <div 
          onClick={() => { setFilterStatus('Ready for Outreach'); setChannelFilter('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'Ready for Outreach' 
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' 
              : 'border-border bg-card hover:border-amber-500/40'
          }`}
          title="Click to filter Ready for Outreach"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Ready for Outreach</span>
            <Send size={14} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{candidateStats.ready}</p>
          <p className="text-3xs text-muted-foreground mt-0.5">Approved for communication</p>
        </div>

        <div 
          onClick={() => { setFilterStatus('Contacted'); setChannelFilter('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'Contacted' 
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5' 
              : 'border-border bg-card hover:border-blue-500/40'
          }`}
          title="Click to filter Outreach Sent"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Outreach Sent</span>
            <CheckCircle2 size={14} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{candidateStats.contacted}</p>
          <p className="text-3xs text-muted-foreground mt-0.5">WhatsApp, Email or SMS</p>
        </div>

        <div 
          onClick={() => { setFilterStatus('Applied'); setChannelFilter('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'Applied' 
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5' 
              : 'border-border bg-card hover:border-indigo-500/40'
          }`}
          title="Click to filter Applications"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Applications</span>
            <Layers size={14} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{candidateStats.applied}</p>
          <p className="text-3xs text-muted-foreground mt-0.5">Applied & in screening</p>
        </div>

        <div 
          onClick={() => { setFilterStatus('Verified'); setChannelFilter('all'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'Verified' 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' 
              : 'border-border bg-card hover:border-emerald-500/40'
          }`}
          title="Click to filter Verified Astrologers"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Verified</span>
            <Sparkles size={14} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{candidateStats.verified}</p>
          <p className="text-3xs text-muted-foreground mt-0.5">Panel verified astrologers</p>
        </div>

        <div 
          onClick={() => handleChannelFilterChange('phone-only')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            channelFilter === 'phone-only' 
              ? 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-500/5' 
              : 'border-border bg-card hover:border-violet-500/40'
          }`}
          title="Click to view candidates with phone numbers"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">Channels Ready</span>
            <Phone size={14} className="text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-sm font-bold text-foreground">📱 {candidateStats.phoneCount}</span>
            <span className="text-2xs text-muted-foreground">|</span>
            <span className="text-sm font-bold text-foreground">📧 {candidateStats.emailCount}</span>
          </div>
          <p className="text-3xs text-muted-foreground mt-0.5">Mobile & Email listed</p>
        </div>
      </div>

      {/* Top Controls Header Bar with Outreach Chips & Counts */}
      <CandidateTableHeader
        search={search}
        onSearchChange={setSearch}
        status={filterStatus}
        onStatusChange={setFilterStatus}
        spec={filterSpec}
        onSpecChange={setFilterSpec}
        source={filterSource}
        onSourceChange={setFilterSource}
        scoreRange={filterScoreRange}
        onScoreRangeChange={setFilterScoreRange}
        channelFilter={channelFilter}
        onChannelFilterChange={handleChannelFilterChange}
        campaign={filterCampaign}
        onCampaignChange={handleCampaignFilterChange}
        campaignOptions={campaignOptions}
        location={filterLocation}
        onLocationChange={handleLocationFilterChange}
        locationOptions={locationOptions}
        counts={outreachCounts}
        onExportCsv={handleExportCsv}
        onAddCandidateClick={() => setIsAddCandidateOpen(true)}
        columns={columns}
        onToggleColumn={handleToggleColumn}
      />

      {/* Main Table Card */}
      <div className="card-elevated overflow-hidden">
        {/* Pipeline & Quick Actions Secondary Bar */}
        <div className="bg-muted/30 border-b border-border px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Database size={14} className="text-primary" />
            <span className="font-semibold text-foreground">Pipeline Database:</span>
            {isFirestoreLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Firestore Sync ({candidates.length} records)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Active Local Memory ({candidates.length} records)
              </span>
            )}
            {syncStatus && (
              <span className="text-2xs font-semibold text-primary animate-fade-in">
                ✓ {syncStatus}
              </span>
            )}
            {filteredCandidates.length !== candidates.length && (
              <span className="text-2xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Showing {filteredCandidates.length} of {candidates.length} filtered
              </span>
            )}
            {filterCampaign !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span>🎯 Campaign: <strong>{filterCampaign}</strong></span>
                <button
                  onClick={() => handleCampaignFilterChange('All')}
                  className="hover:text-primary-foreground hover:bg-primary/80 rounded-full p-0.5 transition-colors"
                  title="Clear campaign filter"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {filterLocation !== 'All' && (
              <span className="inline-flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-100">
                <span>📍 Location: <strong>{filterLocation}</strong></span>
                <button
                  onClick={() => handleLocationFilterChange('All')}
                  className="hover:text-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5 transition-colors"
                  title="Clear location filter"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const targets = selectedRows.length > 0 
                  ? candidates.filter(c => selectedRows.includes(c.id))
                  : filteredCandidates;
                setMultiOutreachRecipients(targets);
              }}
              className="px-3 py-1 text-2xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 via-primary to-violet-600 text-white hover:opacity-95 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Send WhatsApp, Email, or SMS to multiple candidates at once"
            >
              <Send size={12} />
              Send Outreach {selectedRows.length > 0 ? `(${selectedRows.length} selected)` : `(All ${filteredCandidates.length})`}
            </button>

            <button
              onClick={() => setIsAddCandidateOpen(true)}
              className="btn-primary text-2xs py-1 px-3 flex items-center gap-1 shadow-xs"
              title="Add single candidate manually with full details"
            >
              <UserPlus size={12} />
              + Add Astrologer
            </button>

            {candidates.length > 0 && (
              <button
                onClick={handlePurgeAllCandidates}
                className="btn-secondary text-2xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
                title="Delete all candidate profiles from database"
              >
                <Trash2 size={12} />
                Purge All Candidates
              </button>
            )}

            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="btn-secondary text-2xs py-1 px-2.5 text-primary border-primary/30 hover:bg-primary/5 flex items-center gap-1.5"
              title="Import astrologers from CSV"
            >
              <Upload size={12} />
              Bulk CSV Import
            </button>

            <button
              onClick={handleExportCsv}
              className="btn-secondary text-2xs py-1 px-2.5 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              title="Download CSV"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </div>

        {/* Bulk action banner */}
        {selectedRows.length > 0 && (
          <div className="bulk-action-bar flex items-center justify-between px-5 py-2.5 bg-primary/5 border-b border-primary/20 animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-primary">
                {selectedRows.length} candidate{selectedRows.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => {
                  const selectedCandidates = candidates.filter(c => selectedRows.includes(c.id));
                  setMultiOutreachRecipients(selectedCandidates);
                }}
                className="text-xs bg-gradient-to-r from-emerald-600 via-primary to-violet-600 text-white font-bold px-3 py-1.5 rounded-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Send outreach via WhatsApp, Email, or SMS to all selected candidates"
              >
                <Send size={11} />
                Send Outreach ({selectedRows.length} People)
              </button>
              <button
                onClick={() => {
                  selectedRows.forEach(id => handleStatusChange(id, 'ready-for-outreach', 'Approved'));
                  setSelectedRows([]);
                }}
                className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-md hover:opacity-90 flex items-center gap-1"
              >
                <Send size={11} />
                Approve for Outreach
              </button>
              <button
                onClick={() => {
                  selectedRows.forEach(id => handleStatusChange(id, 'human-review'));
                  setSelectedRows([]);
                }}
                className="text-xs bg-muted text-foreground font-semibold px-3 py-1 rounded-md hover:bg-muted/80 flex items-center gap-1"
              >
                <UserCheck size={11} />
                Move to Human Review
              </button>
            </div>
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Deselect all
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header-row">
                <th className="table-header-cell w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-primary rounded"
                    aria-label="Select all candidates"
                  />
                </th>
                <th className="table-header-cell cursor-pointer min-w-56" onClick={() => handleSort('name')}>
                  Astrologer & Identity <SortIcon col="name" />
                </th>
                {columns.phone && (
                  <th className="table-header-cell whitespace-nowrap min-w-[160px]">Contact Number</th>
                )}
                {columns.email && (
                  <th className="table-header-cell whitespace-nowrap min-w-[180px]">Email Address</th>
                )}
                {columns.location && (
                  <th className="table-header-cell whitespace-nowrap min-w-[130px]">Location</th>
                )}
                {columns.website && (
                  <th className="table-header-cell whitespace-nowrap min-w-[130px]">Website</th>
                )}
                {columns.specialisations && (
                  <th className="table-header-cell">Specialisations</th>
                )}
                {columns.rating && (
                  <th className="table-header-cell cursor-pointer" onClick={() => handleSort('rating')}>
                    Rating & Reviews <SortIcon col="rating" />
                  </th>
                )}
                {columns.experience && (
                  <th className="table-header-cell whitespace-nowrap">Experience</th>
                )}
                {columns.source && (
                  <th className="table-header-cell whitespace-nowrap min-w-[130px]">Source</th>
                )}
                {columns.outreach && (
                  <th className="table-header-cell whitespace-nowrap min-w-[140px]">Outreach</th>
                )}
                {columns.lifecycle && (
                  <th className="table-header-cell cursor-pointer whitespace-nowrap min-w-[160px]" onClick={() => handleSort('lifecycleStatus')}>
                    Lifecycle Stage <SortIcon col="lifecycleStatus" />
                  </th>
                )}
                {columns.discovered && (
                  <th className="table-header-cell cursor-pointer whitespace-nowrap min-w-[120px]" onClick={() => handleSort('discoveredDate')}>
                    Discovered <SortIcon col="discoveredDate" />
                  </th>
                )}
                <th className="table-header-cell w-28 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-16 text-muted-foreground text-sm">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users size={36} className="opacity-30 text-muted-foreground" />
                      <p className="font-semibold text-foreground text-base">No candidates found in this view</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {candidates.length === 0 
                          ? 'Add your first astrologer candidate manually or run an autonomous discovery campaign.'
                          : 'Try clearing or changing your search filters to find matching astrologers.'}
                      </p>
                      <button
                        onClick={() => setIsAddCandidateOpen(true)}
                        className="btn-primary text-xs py-2 px-4 mt-2 flex items-center gap-1.5 shadow-sm"
                      >
                        <UserPlus size={14} />
                        + Add First Astrologer Manually
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(candidate => (
                  <tr
                    key={candidate.id}
                    className={`table-row ${selectedRows.includes(candidate.id) ? 'selected' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(candidate.id)}
                        onChange={() => toggleRow(candidate.id)}
                        className="w-4 h-4 accent-primary rounded"
                        aria-label={`Select ${candidate.name}`}
                      />
                    </td>

                    {/* Candidate name & identity */}
                    <td className="table-cell">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => setProfileCandidate(candidate)}
                          className="w-9 h-9 rounded-full terracotta-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 hover:scale-105 transition-transform shadow-xs cursor-pointer"
                          title="Click to view full astrologer profile"
                        >
                          {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setProfileCandidate(candidate)}
                              className="font-semibold text-sm text-foreground truncate max-w-[175px] text-left hover:text-primary hover:underline transition-colors cursor-pointer"
                              title="Click to view complete profile and contact details"
                            >
                              {candidate.name}
                            </button>
                            {candidate.isDuplicate && (
                              <span className="tooltip-label" data-tooltip="Possible duplicate detected">
                                <AlertTriangle size={12} className="text-amber-600 flex-shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{candidate.businessName}</p>
                          {!columns.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-muted-foreground/70 flex-shrink-0" />
                              <span className="truncate">{candidate.location}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Number (Dedicated Column) */}
                    {columns.phone && (
                      <td className="table-cell whitespace-nowrap">
                        {(() => {
                          const contact = resolveCandidateContact(candidate);
                          const phoneNum = contact.phone || candidate.phone || candidate.whatsapp;
                          if (!phoneNum) {
                            return (
                              <span className="text-2xs text-muted-foreground/60 italic font-mono">
                                Not Listed
                              </span>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${contact.rawPhone || phoneNum}`}
                                className="font-mono text-xs font-semibold tabular-nums text-foreground hover:text-primary hover:underline flex items-center gap-1.5"
                                title="Click to call"
                              >
                                <Phone size={11} className="text-primary flex-shrink-0" />
                                <span>{phoneNum}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDirectWhatsApp(candidate, phoneNum)}
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors ml-0.5 cursor-pointer"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </button>
                            </div>
                          );
                        })()}
                      </td>
                    )}

                    {/* Email Address (Dedicated Column) */}
                    {columns.email && (
                      <td className="table-cell whitespace-nowrap">
                        {(() => {
                          const contact = resolveCandidateContact(candidate);
                          const emailAddr = contact.email || candidate.email;
                          if (!emailAddr) {
                            return (
                              <span className="text-2xs text-muted-foreground/60 italic">
                                Not Listed
                              </span>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1.5 max-w-[210px]">
                              <Mail size={11} className="text-primary flex-shrink-0" />
                              <a
                                href={`mailto:${emailAddr}`}
                                className="text-xs text-foreground truncate hover:text-primary hover:underline font-medium"
                                title={emailAddr}
                              >
                                {emailAddr}
                              </a>
                            </div>
                          );
                        })()}
                      </td>
                    )}

                    {/* Location (Dedicated Column) */}
                    {columns.location && (
                      <td className="table-cell whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleLocationFilterChange(candidate.location)}
                          className="inline-flex items-center gap-1 text-xs text-foreground hover:text-primary hover:underline transition-colors truncate max-w-[160px] text-left cursor-pointer"
                          title={`Filter by location: ${candidate.location}`}
                        >
                          <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{candidate.location || 'India'}</span>
                        </button>
                      </td>
                    )}

                    {/* Website (Dedicated Column) */}
                    {columns.website && (
                      <td className="table-cell whitespace-nowrap">
                        {(() => {
                          const contact = resolveCandidateContact(candidate);
                          const site = contact.website || candidate.website;
                          if (!site) {
                            return <span className="text-2xs text-muted-foreground/60 italic">—</span>;
                          }
                          return (
                            <a
                              href={site}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[150px]"
                              title={site}
                            >
                              <Globe size={11} className="shrink-0" />
                              <span className="truncate">{site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                            </a>
                          );
                        })()}
                      </td>
                    )}

                    {/* Specialisations */}
                    {columns.specialisations && (
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {candidate.specialisations.slice(0, 2).map(s => (
                            <span
                              key={`spec-${candidate.id}-${s}`}
                              className="text-2xs font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                          {candidate.specialisations.length > 2 && (
                            <span className="text-2xs text-muted-foreground">+{candidate.specialisations.length - 2}</span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Rating & Reviews */}
                    {columns.rating && (
                      <td className="table-cell whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
                            <span className="text-amber-600 dark:text-amber-400 font-black">★</span>
                            <span>{candidate.rating ? Number(candidate.rating).toFixed(candidate.rating % 1 === 0 ? 0 : 1) : '4.8'}</span>
                          </span>
                          <span className="text-2xs text-muted-foreground font-semibold">
                            ({candidate.userRatingsTotal || 25})
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Experience */}
                    {columns.experience && (
                      <td className="table-cell whitespace-nowrap">
                        <span className="text-sm font-semibold tabular-nums text-foreground">{candidate.experience}</span>
                      </td>
                    )}

                    {/* Source */}
                    {columns.source && (
                      <td className="table-cell whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center justify-center whitespace-nowrap text-xs px-2.5 py-1 rounded-md font-bold tracking-normal ${
                            candidate.source === 'YouTube'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : candidate.source === 'LinkedIn'
                              ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                              : candidate.source === 'Instagram'
                              ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                              : candidate.source === 'Google Places'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : candidate.source === 'Manual Entry' 
                              ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/60 dark:text-amber-100 border border-amber-300 dark:border-amber-600' 
                              : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600'
                          }`}>
                            {candidate.source}
                          </span>
                          {(candidate.campaignName || (candidate as any).campaign) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const camp = candidate.campaignName || (candidate as any).campaign;
                                handleCampaignFilterChange(camp);
                              }}
                              className="inline-flex items-center gap-1 text-3xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 hover:underline cursor-pointer transition-colors max-w-[150px] truncate"
                              title={`Filter by campaign: ${candidate.campaignName || (candidate as any).campaign}`}
                            >
                              🎯 {candidate.campaignName || (candidate as any).campaign}
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Outreach status */}
                    {columns.outreach && (
                      <td className="table-cell whitespace-nowrap">
                        {(() => {
                          const contact = resolveCandidateContact(candidate);
                          const isSentWA = candidate.outreachStatus?.includes('WhatsApp') || (candidate.outreachStatus === 'Sent' && !contact.email);
                          const isSentEmail = candidate.outreachStatus?.includes('Email') || (candidate.outreachStatus === 'Sent' && contact.email);
                          const isSentSMS = candidate.outreachStatus?.includes('SMS');

                          if (candidate.outreachStatus === 'Pending Approval' || candidate.outreachStatus === 'Not Sent') {
                            return (
                              <button 
                                onClick={() => handleStatusChange(candidate.id, 'ready-for-outreach', 'Approved')}
                                className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-[#713B32] bg-[#713B32]/10 hover:bg-[#713B32]/20 dark:text-amber-200 dark:bg-amber-900/40 px-3 py-1 rounded-full transition-colors cursor-pointer border border-[#713B32]/30 dark:border-amber-600/40 shadow-2xs"
                                title="Approve this astrologer for outreach"
                              >
                                <Send size={11} className="shrink-0 text-[#713B32] dark:text-amber-300" />
                                Approve
                              </button>
                            );
                          }
                          if (isSentSMS) {
                            return (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 dark:bg-indigo-900/70 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-600 shadow-2xs">
                                <Phone size={12} className="text-indigo-700 dark:text-indigo-300 shrink-0" />
                                SMS Sent
                              </span>
                            );
                          }
                          if (isSentWA) {
                            return (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 dark:bg-emerald-900/70 dark:text-emerald-100 border border-emerald-400 dark:border-emerald-600 shadow-2xs">
                                <MessageCircle size={12} className="text-emerald-700 dark:text-emerald-300 shrink-0" />
                                WhatsApp Sent
                              </span>
                            );
                          }
                          if (isSentEmail) {
                            return (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-950 dark:bg-blue-900/70 dark:text-blue-100 border border-blue-300 dark:border-blue-600 shadow-2xs">
                                <Mail size={12} className="text-blue-700 dark:text-blue-300 shrink-0" />
                                Email Sent
                              </span>
                            );
                          }
                          return (
                            <span className={`inline-flex items-center whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full ${
                              candidate.outreachStatus === 'Approved' 
                                ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-600' 
                                : 'bg-muted text-muted-foreground border border-border'
                            }`}>
                              {candidate.outreachStatus}
                            </span>
                          );
                        })()}
                      </td>
                    )}

                    {/* Lifecycle status */}
                    {columns.lifecycle && (
                      <td className="table-cell whitespace-nowrap">
                        <StatusBadge status={candidate.lifecycleStatus} />
                      </td>
                    )}

                    {/* Discovered date */}
                    {columns.discovered && (
                      <td className="table-cell whitespace-nowrap text-xs text-muted-foreground">
                        {candidate.discoveredDate}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="table-cell text-center">
                      {(() => {
                        const contact = resolveCandidateContact(candidate);
                        const hasPhone = Boolean(contact.phone);
                        const hasEmail = Boolean(contact.email);
                        const hasBoth = hasPhone && hasEmail;

                        return (
                          <div className="flex items-center justify-center gap-1">
                            {/* Eye icon: View Astrologer Complete Profile & Contact Details */}
                            <button
                              onClick={() => setProfileCandidate(candidate)}
                              className="btn-ghost p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                              title="View Complete Profile & Contact Details"
                            >
                              <Eye size={15} />
                            </button>

                            {/* ⚡ 1-Click Parallel Email + SMS Action */}
                            {(hasBoth || (hasPhone && hasEmail)) && (
                              <button
                                onClick={() => handleOpenQuickParallel(candidate)}
                                className="btn-ghost p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded transition-colors"
                                title={`⚡ 1-Click Dual Outreach: Send Email & SMS simultaneously to ${candidate.name}`}
                              >
                                <Zap size={15} className="fill-amber-500 text-amber-500" />
                              </button>
                            )}

                            {/* Direct SMS Action */}
                            {hasPhone && (
                              <button
                                onClick={() => handleDirectSms(candidate, contact.phone!)}
                                className="btn-ghost p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-colors"
                                title={`Send SMS Invitation via MSG91 to ${candidate.name} (${contact.phone})`}
                              >
                                <Smartphone size={15} />
                              </button>
                            )}

                            {/* Direct WhatsApp Action */}
                            {hasPhone && (
                              <button
                                onClick={() => handleDirectWhatsApp(candidate, contact.phone!)}
                                className="btn-ghost p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded transition-colors"
                                title={`Send Direct WhatsApp Invitation to ${candidate.name} (${contact.phone})`}
                              >
                                <MessageCircle size={15} />
                              </button>
                            )}

                            {/* AI Email Compose Link */}
                            {hasEmail && (
                              <Link
                                href={`/outreach/messages?name=${encodeURIComponent(candidate.name)}&email=${encodeURIComponent(contact.email!)}${contact.phone ? `&phone=${encodeURIComponent(contact.phone)}` : ''}&location=${encodeURIComponent(candidate.location)}&specialisation=${encodeURIComponent(candidate.specialisations?.[0] || 'Vedic Astrology')}`}
                                className="btn-ghost p-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded transition-colors"
                                title={`Send AI Email Outreach to ${contact.email}`}
                              >
                                <Mail size={15} />
                              </Link>
                            )}

                            {/* AI Dossier Modal */}
                            <button
                              onClick={() => handleAiQualify(candidate)}
                              className="btn-ghost p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
                              title="View AI Qualification Dossier (GPT-4o)"
                            >
                              <Sparkles size={14} />
                            </button>

                            {/* More Actions Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === candidate.id ? null : candidate.id)}
                                className="btn-ghost p-1.5 rounded"
                                title="More actions"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {actionMenuOpen === candidate.id && (
                                <div className="absolute right-0 top-full mt-1 w-56 card-elevated z-30 py-1 animate-slide-up text-xs shadow-xl">
                                  <button 
                                    onClick={() => { setProfileCandidate(candidate); setActionMenuOpen(null); }}
                                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
                                  >
                                    <Eye size={13} className="text-primary" />
                                    View Full Profile & History
                                  </button>
                                  <Link 
                                    href={`/human-review-module?id=${candidate.id}`}
                                    onClick={() => setActionMenuOpen(null)}
                                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
                                  >
                                    <Sparkles size={13} className="text-accent" />
                                    Review 360° in Workspace
                                  </Link>
                                  {hasBoth && (
                                    <button 
                                      onClick={() => { handleOpenQuickParallel(candidate); setActionMenuOpen(null); }}
                                      className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold"
                                    >
                                      <Zap size={13} className="fill-amber-500 text-amber-500" />
                                      ⚡ 1-Click Parallel Send (Mail + SMS)
                                    </button>
                                  )}
                                  <div className="border-t border-border my-1" />
                                  <button 
                                    onClick={() => handleStatusChange(candidate.id, 'screening')}
                                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                                  >
                                    <Check size={13} className="text-blue-600" />
                                    Advance to Screening
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(candidate.id, 'human-review')}
                                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                                  >
                                    <UserCheck size={13} className="text-purple-600" />
                                    Send to Human Review
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(candidate.id, 'probation')}
                                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                                  >
                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                    Approve for Probation
                                  </button>
                                  <div className="border-t border-border my-1" />
                                  <button 
                                    onClick={() => handleDelete(candidate.id)}
                                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-700 dark:text-rose-400"
                                  >
                                    <Trash2 size={13} />
                                    Remove Candidate
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{sorted.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)}</span> of{' '}
            <span className="font-semibold text-foreground">{sorted.length}</span> candidates
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost p-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`page-${i + 1}`}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-md text-sm font-semibold transition-colors ${
                  page === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'btn-ghost'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="btn-ghost p-1.5 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 0: Manually Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddCandidateOpen}
        onClose={() => setIsAddCandidateOpen(false)}
        onCandidateAdded={handleCandidateAdded}
      />

      {/* MODAL 1: Complete Profile History & Contact Details Modal (Eye icon) */}
      <CandidateProfileModal
        candidate={profileCandidate}
        onClose={() => setProfileCandidate(null)}
        onApproveOutreach={(id) => handleStatusChange(id, 'ready-for-outreach', 'Approved')}
      />

      {/* MODAL 2: AI Dossier Modal */}
      {dossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 m-auto my-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-foreground">AI Qualification Dossier</h3>
              </div>
              <button
                onClick={() => setDossier(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-muted/40 p-3.5 rounded-xl border border-border">
              <div>
                <h4 className="font-bold text-base text-foreground">{dossier.candidate.name}</h4>
                <p className="text-xs text-muted-foreground">{dossier.candidate.location} • {dossier.candidate.experience}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary block">{dossier.evaluation.qualificationScore}/100</span>
                <span className="bg-emerald-100 text-emerald-800 text-2xs font-bold px-2 py-0.5 rounded-full">
                  {dossier.evaluation.recommendation}
                </span>
              </div>
            </div>

            <p className="text-xs text-foreground italic bg-primary/5 p-3 rounded-lg border border-primary/15 leading-relaxed">
              "{dossier.evaluation.summary}"
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <strong className="text-emerald-700 font-semibold block mb-1">Key Strengths:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                  {dossier.evaluation.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {dossier.evaluation.concerns?.length > 0 && (
                <div>
                  <strong className="text-amber-700 font-semibold block mb-1">Verification Points:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                    {dossier.evaluation.concerns.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {dossier.evaluation.suggestedFocusAreas?.length > 0 && (
                <div>
                  <strong className="text-primary font-semibold block mb-1">Suggested Assessment Focus:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                    {dossier.evaluation.suggestedFocusAreas.map((f: string, idx: number) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setDossier(null)}
                className="btn-primary text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CSV Bulk Import */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 m-auto my-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Upload size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-foreground">Bulk CSV Import Candidates</h3>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Paste CSV text formatted as: <code>Name, Location, Specialization, Experience</code>
            </p>

            <form onSubmit={handleCsvImportSubmit} className="space-y-3">
              <textarea
                rows={6}
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                placeholder="Acharya Rameshwar, Varanasi, Vedic Jyotish, 16 yrs&#10;Pandit Ananth, Bengaluru, KP System, 11 yrs&#10;Dr. Gayatri Devi, New Delhi, Prashna & Vastu, 19 yrs"
                className="w-full p-3 font-mono text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="btn-ghost text-xs py-2 px-3 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={13} />
                  Import Candidates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Purge Confirmation Modal */}
      <ConfirmModal
        isOpen={isPurgeConfirmOpen}
        onClose={() => setIsPurgeConfirmOpen(false)}
        onConfirm={handleConfirmPurge}
        variant="danger"
        confirmLoading={isPurging}
        title="Purge All Candidate Profiles?"
        description="Are you sure you want to delete ALL candidate profiles? This will completely empty your candidate pipeline and cannot be undone."
        confirmText="Yes, Purge Pipeline"
        cancelText="Keep Candidates"
      />

      {/* MODAL 5: 1-Click Parallel Outreach Confirmation Modal */}
      {quickParallelCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 m-auto my-auto animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Zap size={20} className="fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">1-Click Dual Channel Outreach</h3>
                  <p className="text-xs text-muted-foreground">Send concurrent personalized invitations via Email & SMS</p>
                </div>
              </div>
              <button
                onClick={() => setQuickParallelCandidate(null)}
                disabled={isSendingQuickParallel}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Candidate Quick Summary */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-foreground">{quickParallelCandidate.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {quickParallelCandidate.specialisations?.join(', ') || 'Vedic Astrology'} • {quickParallelCandidate.location}
                </p>
              </div>
              <StatusBadge status={quickParallelCandidate.lifecycleStatus} size="sm" />
            </div>

            {/* Recipient Channels Info (Editable for live testing) */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Mail size={14} className="text-violet-600 dark:text-violet-400" />
                    Target Email Address
                  </label>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                    SMTP Verified
                  </span>
                </div>
                <input
                  type="email"
                  value={quickParallelEmail}
                  onChange={(e) => setQuickParallelEmail(e.target.value)}
                  placeholder="Enter recipient or your test email (e.g. yourname@gmail.com)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-foreground"
                />
              </div>

              <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Smartphone size={14} className="text-indigo-600 dark:text-indigo-400" />
                    Target Mobile / SMS Number
                  </label>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    MSG91 Flow
                  </span>
                </div>
                <input
                  type="tel"
                  value={quickParallelPhone}
                  onChange={(e) => setQuickParallelPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number (e.g. 9876543210 or +919876543210)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-foreground"
                />
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-2xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-1 mb-0.5">
                <Zap size={12} className="fill-amber-500" />
                Dual-Channel Execution Note
              </p>
              Both Email and SMS messages will be queued and dispatched synchronously to the entered addresses. Status will update to <strong className="font-bold">Sent (Email + SMS)</strong> and delivery logs will appear in Communication History.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setQuickParallelCandidate(null)}
                disabled={isSendingQuickParallel}
                className="btn-ghost text-xs py-2 px-3 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteQuickParallel(quickParallelCandidate, quickParallelEmail, quickParallelPhone)}
                disabled={isSendingQuickParallel || (!quickParallelEmail.trim() && !quickParallelPhone.trim())}
                className="btn-primary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-600 to-primary hover:from-amber-700 hover:to-primary/90 text-white font-semibold shadow-md disabled:opacity-50"
              >
                {isSendingQuickParallel ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Sending Concurrently...
                  </>
                ) : (
                  <>
                    <Zap size={13} className="fill-white" />
                    ⚡ Send Email & SMS Concurrently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Channel Outreach Dispatch Modal (WhatsApp, Email, SMS) */}
      {multiOutreachRecipients && (
        <MultiChannelOutreachModal
          isOpen={Boolean(multiOutreachRecipients)}
          recipients={multiOutreachRecipients}
          onClose={() => setMultiOutreachRecipients(null)}
          onComplete={(summary) => {
            setSelectedRows([]);
            showToast(
              '🚀 Outreach Dispatch Complete!',
              `Dispatched to ${summary.total} candidates (${summary.emailSent} Email, ${summary.smsSent} SMS, ${summary.whatsappQueued} WhatsApp queued/logged).`,
              'success'
            );
          }}
        />
      )}
    </div>
  );
}