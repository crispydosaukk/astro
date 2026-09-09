'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Settings, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { useDiscovery } from '../DiscoveryContext';
import LocationAutocomplete from '@/components/ui/LocationAutocomplete';

interface CampaignFormData {
  name: string;
  location: string;
  country: string;
  specialisation: string;
  targetCount: number;
  minExperience: number;
  minAiScore: number;
  sources: string[];
  startImmediately: boolean;
}

const specialisations = [
  'Vedic Jyotish', 
  'KP System', 
  'Nadi Astrology', 
  'Prashna Kundali', 
  'Numerology', 
  'Vastu Shastra', 
  'Lal Kitab'
];

const searchSourcesList = ['Google Places', 'Web Search', 'Approved Directories', 'Social Profiles'];

export default function CampaignHeader() {
  const { campaigns, createCampaign, isExecuting } = useDiscovery();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      location: '',
      country: 'India',
      specialisation: 'Vedic Jyotish',
      minAiScore: 80,
      minExperience: 5,
      targetCount: 50,
      sources: ['Google Places', 'Web Search'],
      startImmediately: true,
    },
  });

  const locationValue = watch('location') || '';

  React.useEffect(() => {
    register('location', { required: 'Target location is required' });
  }, [register]);

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    try {
      await createCampaign({
        name: data.name,
        location: data.location,
        specialisation: data.specialisation,
        targetCount: Number(data.targetCount),
        minAiScore: Number(data.minAiScore),
        minExperience: Number(data.minExperience),
        sources: data.sources || ['Google Places'],
        startImmediately: data.startImmediately,
      });

      setToastMsg(`Campaign "${data.name}" created successfully!`);
      setTimeout(() => setToastMsg(null), 4000);
      setModalOpen(false);
      reset();
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
            Discovery Agent: Online (GPT-4o)
          </div>
          <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200">
            <span className={`w-2 h-2 rounded-full ${runningCount > 0 ? 'bg-blue-500 animate-pulse' : 'bg-blue-400'}`} />
            {runningCount} Job{runningCount !== 1 ? 's' : ''} Active
          </div>
          <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs font-semibold">
            Google Places + Web Search Active
          </div>
          {toastMsg && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fadeIn flex items-center gap-1">
              <CheckCircle2 size={12} /> {toastMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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
        subtitle="Configure parameters to discover astrologers via Google Places & GPT-4o"
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Campaign Name *</label>
              <input
                {...register('name', { required: 'Campaign name is required' })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-medium"
                placeholder="e.g. Pune KP Astrologers Discovery"
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
                    const currentSpec = watch('specialisation') || 'Astrologers';
                    setValue('name', `${cityName} ${currentSpec} Discovery`, { shouldValidate: true });
                  }
                }}
                placeholder="Search city / location (e.g. Hyderabad, Telangana)..."
                error={errors.location?.message}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Specialisation *</label>
              <select
                {...register('specialisation')}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
              >
                {specialisations.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Min AI Score Threshold (0-100)</label>
              <input
                type="number"
                {...register('minAiScore', { min: 50, max: 100 })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                placeholder="80"
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

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Search Sources</label>
            <div className="grid grid-cols-2 gap-2">
              {searchSourcesList.map(src => (
                <label key={src} className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-2 border border-border rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    value={src}
                    {...register('sources')}
                    defaultChecked={src === 'Google Places' || src === 'Web Search'}
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
              <p className="text-2xs text-muted-foreground">Automatically query Google Places & GPT-4o upon creation</p>
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
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isExecuting}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Create & Launch Campaign'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}