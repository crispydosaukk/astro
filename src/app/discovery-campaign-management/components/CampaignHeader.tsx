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
  'Vedic Jyotish', 
  'KP Astrology', 
  'Nadi Astrology', 
  'Prashna Kundali', 
  'Numerology', 
  'Vastu Shastra', 
  'Lal Kitab',
  'Tarot Reading',
  'Western Astrology', 
  'Gemology'
];

const searchSourcesList = [
  'Google Places', 
  'Justdial & Sulekha', 
  'Astrology Directories', 
  'Yellow Pages'
];

export default function CampaignHeader() {
  const { campaigns, createCampaign, isExecuting } = useDiscovery();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Vedic Jyotish']);
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
      specialisations: ['Vedic Jyotish'],
      minExperience: 5,
      targetCount: 50,
      sources: ['Google Places', 'Justdial & Sulekha'],
      startImmediately: true,
    },
  });

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
    if (selectedSpecs.length === 0) {
      alert('Please select at least one specialisation.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({
        name: data.name,
        location: data.location,
        specialisation: selectedSpecs.join(', '),
        specialisations: selectedSpecs,
        targetCount: Number(data.targetCount),
        minAiScore: 0,
        minExperience: Number(data.minExperience),
        sources: data.sources || ['Google Places', 'Justdial & Sulekha'],
        startImmediately: data.startImmediately,
      });

      setToastMsg(`Campaign "${data.name}" created successfully!`);
      setTimeout(() => setToastMsg(null), 4000);
      setModalOpen(false);
      reset();
      setSelectedSpecs(['KP Astrology']);
    } catch (err: any) {
      alert(`Failed to create campaign: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Google Places + Justdial / Sulekha
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
        subtitle="Select multiple specialisations to discover real astrologers via Google Places & Directories"
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
              <span className="text-2xs text-primary font-medium">Select one or more branches</span>
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
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Search Sources</label>
            <div className="grid grid-cols-2 gap-2">
              {searchSourcesList.map(src => (
                <label key={src} className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-2 border border-border rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    value={src}
                    {...register('sources')}
                    defaultChecked={src === 'Google Places' || src === 'Justdial & Sulekha'}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>{src}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles size={13} /> Start Discovery Immediately
              </p>
              <p className="text-2xs text-muted-foreground">Automatically query Google Places, Justdial & Sulekha upon creation</p>
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