'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Settings, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useForm } from 'react-hook-form';
import { useDiscovery } from '../DiscoveryContext';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

interface CampaignFormData {
  name: string;
  location: string;
  country: string;
  specialisations: string[];
  minExperience: number;
  targetCount: number;
  sources: string[];
  startImmediately: boolean;
}

const availableSpecialisations = [
  'Vedic Astrology',
  'KP Astrology',
  'Nadi Astrology',
  'Lal Kitab',
  'Tarot',
  'Numerology',
  'Palmistry',
  'Vastu',
  'Face Reading',
  'Reiki',
  'Angel Reading',
  'Prashna',
  'Psychic Reading',
  'Pendulum Dowsing',
  'Other'
];

export interface SearchSourceOption {
  id: string;
  label: string;
  badge: string;
  icon: React.ReactNode;
}

const searchSourcesList: SearchSourceOption[] = [
  {
    id: 'Google Places',
    label: 'Google Places',
    badge: 'Maps & Business',
    icon: (
      <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    id: 'YouTube',
    label: 'YouTube',
    badge: 'Video & Channels',
    icon: (
      <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: 'LinkedIn',
    label: 'LinkedIn',
    badge: 'Professional Network',
    icon: (
      <svg className="w-4 h-4 text-sky-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.92 0-1.66-.74-1.66-1.66a1.66 1.66 0 0 1 1.66-1.66c.92 0 1.66.74 1.66 1.66 0 .92-.74 1.66-1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
      </svg>
    ),
  },
  {
    id: 'Instagram',
    label: 'Instagram',
    badge: 'Social & Creators',
    icon: (
      <svg className="w-4 h-4 text-pink-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'Justdial & Sulekha',
    label: 'Justdial & Sulekha',
    badge: 'Directories',
    icon: (
      <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
  {
    id: 'Astrology Directories',
    label: 'Astrology Directories',
    badge: 'Associations',
    icon: (
      <svg className="w-4 h-4 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 'Yellow Pages',
    label: 'Yellow Pages',
    badge: 'Listings',
    icon: (
      <svg className="w-4 h-4 text-orange-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

const allSpecialisations = availableSpecialisations.filter(s => s !== 'Other');
const defaultCategories = ['Vedic Astrology'];
const defaultSources = searchSourcesList.map(s => s.id);

export default function CampaignHeader() {
  const { campaigns, createCampaign, isExecuting } = useDiscovery();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(defaultCategories);
  const [otherSpec, setOtherSpec] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const runningCount = campaigns.filter(c => c.status === 'running').length;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CampaignFormData>({
    defaultValues: {
      name: '',
      location: 'New Delhi, Delhi, India',
      country: 'India',
      specialisations: defaultCategories,
      minExperience: 5,
      targetCount: 50,
      sources: defaultSources,
      startImmediately: true,
    },
  });

  // Auto-check all search sources/platforms below (Google Places, YouTube, LinkedIn, Instagram, Justdial, Directories, Yellow Pages)
  React.useEffect(() => {
    if (modalOpen) {
      setSelectedSpecs(defaultCategories);
      setValue('specialisations', defaultCategories);
      setValue('sources', defaultSources);
      setOtherSpec('');
    }
  }, [modalOpen, setValue]);

  const locationValue = watch('location') || '';

  React.useEffect(() => {
    register('location', { required: 'Target location is required' });
  }, [register]);

  const toggleSpecialisation = (spec: string) => {
    let updated: string[];
    if (selectedSpecs.includes(spec)) {
      if (selectedSpecs.length === 1) return; // keep at least one
      updated = selectedSpecs.filter(s => s !== spec);
    } else {
      updated = [...selectedSpecs, spec];
    }
    setSelectedSpecs(updated);
    setValue('specialisations', updated);

    const currentName = watch('name');
    const loc = watch('location');
    if (loc && (!currentName || currentName.includes('Discovery'))) {
      const cityName = loc.split(',')[0].trim();
      setValue('name', `${cityName} ${updated.join(' & ')} Discovery`);
    }
  };

  const handlePurgeAll = () => {
    setIsPurgeConfirmOpen(true);
  };

  const handleConfirmPurge = async () => {
    setIsPurging(true);
    try {
      const res = await fetch('/api/admin/purge-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setToastMsg('All campaigns and candidates have been deleted!');
        setTimeout(() => {
          setToastMsg(null);
          window.location.reload();
        }, 1500);
      } else {
        setToastMsg(data.error || 'Failed to purge data');
        setTimeout(() => setToastMsg(null), 4000);
      }
    } catch (err: any) {
      setToastMsg('Error purging data: ' + err.message);
      setTimeout(() => setToastMsg(null), 4000);
    } finally {
      setIsPurging(false);
      setIsPurgeConfirmOpen(false);
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    let finalSpecs = [...selectedSpecs];
    if (finalSpecs.includes('Other')) {
      finalSpecs = finalSpecs.filter(s => s !== 'Other');
      if (otherSpec.trim()) {
        finalSpecs.push(otherSpec.trim());
      }
    }

    if (finalSpecs.length === 0) {
      alert('Please select at least one specialisation.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({
        name: data.name,
        location: data.location,
        specialisation: finalSpecs.join(', '),
        specialisations: finalSpecs,
        targetCount: Number(data.targetCount),
        minAiScore: 0,
        minExperience: Number(data.minExperience),
        sources: data.sources && data.sources.length > 0 ? data.sources : defaultSources,
        startImmediately: data.startImmediately,
      });

      setToastMsg(`Campaign "${data.name}" created successfully!`);
      setTimeout(() => setToastMsg(null), 4000);
      setModalOpen(false);
      reset();
      setSelectedSpecs(defaultCategories);
      setValue('sources', defaultSources);
      setOtherSpec('');
    } catch (err: any) {
      alert(`Failed to create campaign: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSources = watch('sources') || [];

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Search Agent: Online
          </div>
          <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200">
            <span className={`w-2 h-2 rounded-full ${runningCount > 0 ? 'bg-blue-500 animate-pulse' : 'bg-blue-400'}`} />
            {runningCount} Job{runningCount !== 1 ? 's' : ''} Active
          </div>
          <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-semibold">
            Google Places • YouTube • LinkedIn • Instagram
          </div>
          {toastMsg && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fadeIn flex items-center gap-1">
              <CheckCircle2 size={12} /> {toastMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePurgeAll}
            disabled={isPurging}
            className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5"
            title="Delete all campaigns and candidate profiles from Firestore"
          >
            {isPurging ? 'Purging Data...' : 'Delete All Data'}
          </button>
          <Link href="/search-sources" className="btn-secondary text-sm py-2 flex items-center gap-1.5">
            <Settings size={13} />
            Search Sources
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm py-2 flex items-center gap-1.5"
          >
            <Plus size={13} />
            New Campaign
          </button>
        </div>
      </div>

      {/* New Campaign Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Discovery Campaign"
        subtitle="Select multiple specialisations to discover real astrologers via Google Places, YouTube, LinkedIn, Instagram & Directories"
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Campaign Name *</label>
              <input
                {...register('name', { required: 'Campaign name is required' })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-medium"
                placeholder="e.g. Hyderabad KP & Vedic Astrologers Discovery"
              />
              {errors.name && <p className="text-2xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target City / Location *</label>
              <LocationAutocomplete
                value={locationValue}
                onChange={(val) => {
                  setValue('location', val, { shouldValidate: true });
                  const currentName = watch('name');
                  if (!currentName && val) {
                    const cityName = val.split(',')[0].trim();
                    setValue('name', `${cityName} ${selectedSpecs.join(' & ')} Discovery`, { shouldValidate: true });
                  }
                }}
                placeholder="Search city / location (e.g. Hyderabad, Telangana)..."
                error={errors.location?.message}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Count</label>
              <input
                type="number"
                {...register('targetCount', { min: 5, max: 500 })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                placeholder="50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Min Experience (Years)</label>
              <input
                type="number"
                {...register('minExperience', { min: 1, max: 50 })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                placeholder="5"
              />
            </div>
          </div>

          {/* Multiple Specialisations Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">
                Target Specialisations * ({selectedSpecs.length} selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecs(allSpecialisations);
                    setValue('specialisations', allSpecialisations);
                  }}
                  className="text-2xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Select All Categories
                </button>
                <span className="text-muted-foreground text-2xs">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecs(['Vedic Astrology']);
                    setValue('specialisations', ['Vedic Astrology']);
                  }}
                  className="text-2xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear (Keep 1)
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/20 border border-border rounded-xl">
              {availableSpecialisations.map(spec => {
                const isSelected = selectedSpecs.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialisation(spec)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-background text-foreground border-border hover:border-primary/40 hover:bg-muted/40'
                    }`}
                  >
                    <span>{spec}</span>
                    {isSelected && <span className="text-xs font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedSpecs.includes('Other') && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={otherSpec}
                  onChange={e => setOtherSpec(e.target.value)}
                  placeholder="Specify other specialisation (e.g. Gemology, Western Astrology, Graphology)..."
                  className="input-field text-xs w-full py-2 px-3 border border-border rounded-lg bg-background text-foreground focus:ring-1 focus:ring-primary"
                  required={selectedSpecs.length === 1 && selectedSpecs.includes('Other')}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">
                Search Sources & Platforms ({selectedSources.length} active)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue('sources', defaultSources);
                  }}
                  className="text-2xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Select All Sources
                </button>
                <span className="text-muted-foreground text-2xs">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setValue('sources', ['Google Places', 'YouTube', 'LinkedIn']);
                  }}
                  className="text-2xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {searchSourcesList.map(src => {
                const isChecked = selectedSources.includes(src.id);
                return (
                  <label
                    key={src.id}
                    className={`flex items-center gap-2.5 text-xs text-foreground cursor-pointer p-2.5 border rounded-xl transition-all ${
                      isChecked
                        ? 'border-primary/50 bg-primary/5 shadow-2xs'
                        : 'border-border hover:border-primary/30 hover:bg-muted/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={src.id}
                      {...register('sources')}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {src.icon}
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-xs">{src.label}</p>
                        <p className="text-3xs text-muted-foreground truncate">{src.badge}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles size={13} /> Start Discovery Immediately
              </p>
              <p className="text-2xs text-muted-foreground">Automatically query Google Places, YouTube, LinkedIn, Instagram & Directories upon creation</p>
            </div>
            <input
              type="checkbox"
              {...register('startImmediately')}
              defaultChecked={true}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-sm py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isExecuting}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create & Launch Campaign'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Purge Confirmation Modal */}
      <ConfirmModal
        isOpen={isPurgeConfirmOpen}
        onClose={() => setIsPurgeConfirmOpen(false)}
        onConfirm={handleConfirmPurge}
        variant="danger"
        confirmLoading={isPurging}
        title="Delete All Campaigns & Candidate Data?"
        description="Are you sure you want to delete ALL campaigns, candidate profiles, and search records? This will completely reset your database and cannot be undone."
        confirmText="Yes, Purge Everything"
        cancelText="Cancel"
      />
    </>
  );
}