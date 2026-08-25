'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  AIPromptItem,
  AIPromptSettingsData,
  DEFAULT_AI_PROMPTS,
  DEFAULT_GLOBAL_AI_CONFIG,
  GlobalAIConfig,
} from '@/lib/aiPromptSettings';

interface PromptOption {
  id: string;
  category: string;
  name: string;
  icon: string;
  description: string;
}

const PROMPT_OPTIONS: PromptOption[] = [
  {
    id: 'kundli-general',
    category: 'Services',
    name: 'Janam Kundli & Horoscope Reports',
    icon: '🌟',
    description: 'Free Janam Kundli, Birth Chart analysis, and Life Path reports',
  },
  {
    id: 'kundli-matching',
    category: 'Services',
    name: 'Kundli Matching & 36 Gun Milan',
    icon: '💍',
    description: 'Marriage compatibility and Ashtakoot Gun Milan reports',
  },
  {
    id: 'horoscope-love',
    category: 'Services',
    name: 'Love & Relationship Horoscope',
    icon: '💖',
    description: 'Love life, 7th house Kalatra, and marriage timing forecast',
  },
  {
    id: 'horoscope-finance',
    category: 'Services',
    name: 'Wealth & Financial Astrology',
    icon: '💰',
    description: '2nd House (Dhana), investments, and money growth forecast',
  },
  {
    id: 'horoscope-health',
    category: 'Services',
    name: 'Health & Vitality Horoscope',
    icon: '🩺',
    description: 'Ayur-Jyotish, Lagna vitality, and wellness alignment',
  },
  {
    id: 'remedy-vastu',
    category: 'Remedies',
    name: 'Vastu Shastra Consultation',
    icon: '🏡',
    description: '8-Direction spatial audit and non-demolition remedies',
  },
  {
    id: 'remedy-mantra',
    category: 'Remedies',
    name: 'Mantra Shakti & Japa Sadhana',
    icon: '🕉️',
    description: 'Prescribed Beej mantras, counts, and daily japa methodology',
  },
  {
    id: 'remedy-gemstone',
    category: 'Remedies',
    name: 'Gemstones (Ratna Therapy)',
    icon: '💎',
    description: 'Benefactor gemstones, carat weights, metals, and wearing rituals',
  },
  {
    id: 'remedy-rudraksha',
    category: 'Remedies',
    name: 'Sacred Mukhi Rudraksha',
    icon: '📿',
    description: 'Mukhi combinations, planetary shields, and energization rules',
  },
  {
    id: 'remedy-homa',
    category: 'Remedies',
    name: 'Vedic Homa & Hawan Puja',
    icon: '🔥',
    description: 'Sacred Agni rituals and Navagraha shanti instructions',
  },
  {
    id: 'panchang-daily',
    category: 'Panchang',
    name: 'Daily Panchang & Muhurat',
    icon: '🗓️',
    description: 'Daily Tithi, Nakshatra, Abhijit Muhurat, and Rahu Kaal guidance',
  },
];

export default function AdminAIPrompts() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<string>('kundli-general');
  const [prompts, setPrompts] = useState<Record<string, AIPromptItem>>(DEFAULT_AI_PROMPTS);
  const [config, setConfig] = useState<GlobalAIConfig>(DEFAULT_GLOBAL_AI_CONFIG);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-prompts');
      if (res.ok) {
        const data: AIPromptSettingsData = await res.json();
        if (data.prompts) setPrompts(data.prompts);
        if (data.config) setConfig(data.config);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentOption = PROMPT_OPTIONS.find((o) => o.id === selectedServiceId) || PROMPT_OPTIONS[0];
  const currentPrompt = prompts[selectedServiceId] || DEFAULT_AI_PROMPTS[selectedServiceId] || DEFAULT_AI_PROMPTS['kundli-general'];

  const promptText = currentPrompt.extraDirectives || currentPrompt.systemPrompt || '';

  const handlePromptChange = (val: string) => {
    setPrompts((prev) => ({
      ...prev,
      [selectedServiceId]: {
        ...prev[selectedServiceId],
        extraDirectives: val,
        systemPrompt: prev[selectedServiceId]?.systemPrompt || val,
        isCustomized: true,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/ai-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          prompts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save prompt');

      setSuccessMessage(`Prompt for "${currentOption.name}" saved successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm(`Reset prompt for "${currentOption.name}" to default?`)) {
      const defaultItem = DEFAULT_AI_PROMPTS[selectedServiceId];
      if (defaultItem) {
        setPrompts((prev) => ({
          ...prev,
          [selectedServiceId]: {
            ...defaultItem,
            isCustomized: false,
          },
        }));
        setSuccessMessage(`Reset to default prompt.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#713B32]" />
        <p className="text-sm text-[#6B5E55]">Loading AI Prompts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Simple Header */}
      <div className="bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE4D5] text-[#713B32] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-[#B88A44]" /> AI Prompt Manager
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292522]">
          Services, Remedies &amp; Panchang Prompts
        </h1>
        <p className="text-sm text-[#6B5E55] leading-relaxed">
          Select any service, remedy, or panchang module below and simply enter the prompt instructions you want OpenAI to follow when generating customer reports and predictions.
        </p>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Check size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Prompt Setting Box */}
      <div className="bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Select Service / Remedy / Panchang */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider block">
            1. Select Service or Remedy
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] text-sm font-bold text-[#292522] focus:ring-2 focus:ring-[#B88A44] outline-none cursor-pointer"
          >
            <optgroup label="⭐ Astrology & Horoscope Services">
              {PROMPT_OPTIONS.filter((o) => o.category === 'Services').map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="🌿 8 Sacred Vedic Remedies">
              {PROMPT_OPTIONS.filter((o) => o.category === 'Remedies').map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="🗓️ Panchang & Auspicious Timings">
              {PROMPT_OPTIONS.filter((o) => o.category === 'Panchang').map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.name}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-xs text-[#6B5E55]">
            Currently editing prompt for: <strong className="text-[#292522]">{currentOption.name}</strong> ({currentOption.description})
          </p>
        </div>

        {/* Step 2: Prompt Instructions */}
        <div className="space-y-2 pt-2 border-t border-[#E5D9C8]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider">
              2. Enter Prompt Instructions for {currentOption.name}
            </label>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B5E55] hover:text-[#713B32] transition-colors"
            >
              <RotateCcw size={12} /> Reset to Default
            </button>
          </div>

          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder={`Enter the instructions for ${currentOption.name}. E.g.: Analyze the Lagna, active Mahadasha, give practical remedies, include auspicious gemstone and daily chanting mantra with procedure.`}
            className="w-full p-4 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] text-sm text-[#292522] leading-relaxed focus:ring-2 focus:ring-[#B88A44] outline-none"
          />

          <p className="text-xs text-[#6B5E55] leading-relaxed">
            💡 <em>Tip:</em> You can type in plain English. When customers generate reports for <strong>{currentOption.name}</strong>, OpenAI will follow these exact prompt instructions.
          </p>
        </div>

        {/* Step 3: Save Button */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5D9C8]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving Prompt...' : `Save Prompt for ${currentOption.name}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
