'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Building2, 
  Star, 
  Award, 
  Plus, 
  Check, 
  Layers, 
  FileText
} from 'lucide-react';
import { Candidate, saveCandidateToFirestore } from '@/lib/firebase/candidateService';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateAdded: (newCandidate: Candidate) => void;
}

const POPULAR_SPECIALISATIONS = [
  'Vedic Jyotish',
  'KP System',
  'Nadi Astrology',
  'Numerology',
  'Vastu Shastra',
  'Prashna',
  'Muhurtha',
  'Lal Kitab',
  'Gemology',
  'Palmistry',
  'Tarot Reading',
  'Kundali Matching',
  'Remedial Astrology'
];

const LIFECYCLE_OPTIONS = [
  { value: 'discovered', label: 'Discovered (New Lead)' },
  { value: 'ai-qualified', label: 'AI Qualified' },
  { value: 'ready-for-outreach', label: 'Ready for Outreach' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'human-review', label: 'Human Review' },
  { value: 'probation', label: 'Probation' },
  { value: 'verified', label: 'Verified Astrologer' }
];

const OUTREACH_OPTIONS = [
  'Not Sent',
  'Pending Approval',
  'Approved',
  'Sent',
  'Contacted'
];

export default function AddCandidateModal({
  isOpen,
  onClose,
  onCandidateAdded,
}: AddCandidateModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Vedic Jyotish']);
  const [customSpecInput, setCustomSpecInput] = useState('');
  const [experienceYears, setExperienceYears] = useState('10');
  const [website, setWebsite] = useState('');
  const [rating, setRating] = useState('4.8');
  const [userRatingsTotal, setUserRatingsTotal] = useState('30');
  const [lifecycleStatus, setLifecycleStatus] = useState('discovered');
  const [outreachStatus, setOutreachStatus] = useState('Pending Approval');
  const [profileSummary, setProfileSummary] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSpecialisation = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      if (selectedSpecs.length > 1) {
        setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
      }
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleAddCustomSpec = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customSpecInput.trim();
    if (trimmed && !selectedSpecs.includes(trimmed)) {
      setSelectedSpecs([...selectedSpecs, trimmed]);
      setCustomSpecInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Astrologer Name is required.');
      return;
    }

    const trimmedLocation = location.trim() || 'India';
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanBusiness = businessName.trim() || `${trimmedName} Astrology Kendra`;
    const expString = experienceYears.includes('yr') ? experienceYears : `${experienceYears} yrs`;

    const candidateId = `cand-manual-${Date.now().toString().slice(-6)}`;
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const newCandidate: Candidate = {
      id: candidateId,
      name: trimmedName,
      businessName: cleanBusiness,
      location: trimmedLocation,
      specialisations: selectedSpecs.length > 0 ? selectedSpecs : ['Vedic Jyotish'],
      aiScore: 85,
      source: 'Manual Entry',
      outreachStatus: outreachStatus,
      applicationStatus: null,
      lifecycleStatus: lifecycleStatus,
      discoveredDate: todayFormatted,
      isDuplicate: false,
      experience: expString,
      phone: cleanPhone || undefined,
      email: cleanEmail || undefined,
      address: address.trim() || undefined,
      website: website.trim() || undefined,
      profileSummary: profileSummary.trim() || `${trimmedName} is a professional astrologer based in ${trimmedLocation}, specializing in ${selectedSpecs.join(', ')}.`,
      rating: parseFloat(rating) || 4.8,
      userRatingsTotal: parseInt(userRatingsTotal) || 25,
      history: [
        {
          stage: 'Manual Registration',
          timestamp: todayFormatted,
          notes: `Manually added to candidate pipeline with ${selectedSpecs.join(', ')} specialisations.`,
          actor: 'Recruitment Admin',
          status: 'success'
        },
        {
          stage: 'Initial Pipeline Stage',
          timestamp: todayFormatted,
          notes: `Set initial stage to ${lifecycleStatus.toUpperCase()}.`,
          actor: 'Recruitment Admin',
          status: 'info'
        }
      ]
    };

    setIsSubmitting(true);
    try {
      await saveCandidateToFirestore(newCandidate);
      onCandidateAdded(newCandidate);
      onClose();
    } catch (err: any) {
      console.warn('Error saving candidate to Firestore (saving locally):', err);
      // Still add locally so user flow is not broken if offline
      onCandidateAdded(newCandidate);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-card border border-border rounded-2xl max-w-3xl w-full m-auto my-auto shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl terracotta-gradient flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Add New Astrologer Candidate</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manually record credentials, contact numbers, address & specialisations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
              <X size={14} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Astrologer & Business Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Building2 size={14} className="text-primary flex-shrink-0" />
              <span>1. Astrologer & Practice Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Astrologer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pandit Raghunath Sharma"
                  className="input-field text-sm py-2.5"
                />
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Business / Ashram / Sansthan Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sri Raghunath Jyotish Kendra"
                  className="input-field text-sm py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Numbers & Email */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Phone size={14} className="text-primary flex-shrink-0" />
              <span>2. Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Phone / WhatsApp Number
                </label>
                <div className="flex rounded-lg border border-border bg-card overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="flex items-center justify-center px-3 bg-muted/40 border-r border-border text-muted-foreground">
                    <Phone size={14} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Email Address
                </label>
                <div className="flex rounded-lg border border-border bg-card overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="flex items-center justify-center px-3 bg-muted/40 border-r border-border text-muted-foreground">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pandit.raghunath@gmail.com"
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Website / Portfolio / Profile URL
                </label>
                <div className="flex rounded-lg border border-border bg-card overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="flex items-center justify-center px-3 bg-muted/40 border-r border-border text-muted-foreground">
                    <Globe size={14} />
                  </div>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://raghunathjyotish.in"
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Location & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <MapPin size={14} className="text-primary flex-shrink-0" />
              <span>3. Location & Physical Address</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  City / State / Region <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Varanasi, Uttar Pradesh"
                  className="input-field text-sm py-2.5"
                />
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Full Street Address & Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14/B, Kashi Vishwanath Marg, Godowlia, Varanasi 221001"
                  className="input-field text-sm py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Specialisations & Expertise */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Award size={14} className="text-primary flex-shrink-0" />
              <span>4. Specialisations & Experience</span>
            </h3>
            
            <div>
              <label className="label-field text-xs font-semibold mb-2 block">
                Select Astrological Specialisations:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {POPULAR_SPECIALISATIONS.map((spec) => {
                  const isSelected = selectedSpecs.includes(spec);
                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => toggleSpecialisation(spec)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs' 
                          : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {isSelected ? <Check size={11} className="stroke-[3]" /> : <Plus size={11} />}
                      {spec}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Specialisation */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={customSpecInput}
                  onChange={(e) => setCustomSpecInput(e.target.value)}
                  onKeyDown={handleAddCustomSpec}
                  placeholder="Type custom specialisation & press enter…"
                  className="input-field text-xs py-2 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSpec}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="text"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 15 yrs"
                  className="input-field text-sm py-2.5"
                />
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Public Rating (out of 5.0)
                </label>
                <div className="flex rounded-lg border border-border bg-card overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="flex items-center justify-center px-3 bg-muted/40 border-r border-border text-amber-500">
                    <Star size={14} className="fill-amber-500" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="4.8"
                    className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Review / Testimonial Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={userRatingsTotal}
                  onChange={(e) => setUserRatingsTotal(e.target.value)}
                  placeholder="e.g. 30"
                  className="input-field text-sm py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Pipeline & Lifecycle Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Layers size={14} className="text-primary flex-shrink-0" />
              <span>5. Pipeline & Lifecycle Status</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Lifecycle Stage
                </label>
                <select
                  value={lifecycleStatus}
                  onChange={(e) => setLifecycleStatus(e.target.value)}
                  className="input-field text-sm py-2.5"
                >
                  {LIFECYCLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field text-xs font-semibold mb-1.5">
                  Outreach Status
                </label>
                <select
                  value={outreachStatus}
                  onChange={(e) => setOutreachStatus(e.target.value)}
                  className="input-field text-sm py-2.5"
                >
                  {OUTREACH_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Bio & Profile Notes */}
          <div className="space-y-2">
            <label className="label-field text-xs font-semibold flex items-center gap-2 mb-1.5">
              <FileText size={14} className="text-primary flex-shrink-0" />
              <span>Candidate Profile Bio & Background Notes</span>
            </label>
            <textarea
              rows={3}
              value={profileSummary}
              onChange={(e) => setProfileSummary(e.target.value)}
              placeholder="e.g. Acharya has extensive client experience across North India. Holds traditional shastri degree in Jyotish from Sampurnanand Sanskrit University."
              className="w-full p-3 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost text-xs py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Astrologer…
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Add Candidate to Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
