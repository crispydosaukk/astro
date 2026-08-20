'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowUpDown, Award, Globe, Users, Star, Sparkles, Search } from 'lucide-react';

export interface AstrologerFilterState {
  sortBy: string;
  skills: string[];
  languages: string[];
  gender: string;
  countries: string[];
  topAstrologer: string;
}

export const defaultFilterState: AstrologerFilterState = {
  sortBy: 'popularity',
  skills: [],
  languages: [],
  gender: 'all',
  countries: [],
  topAstrologer: 'all',
};

export interface DynamicFilterOption {
  name: string;
  count?: number;
}

interface AstrologerFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: AstrologerFilterState;
  onApply: (newState: AstrologerFilterState) => void;
  onReset: () => void;
  dynamicSkills?: DynamicFilterOption[];
  dynamicLanguages?: DynamicFilterOption[];
  dynamicCountries?: DynamicFilterOption[];
  dynamicGenders?: { id: string; label: string; count?: number }[];
}

const filterTabs = [
  { id: 'sorting', label: 'Sorting', icon: ArrowUpDown },
  { id: 'skill', label: 'Skill / Talent', icon: Sparkles },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'gender', label: 'Gender', icon: Users },
  { id: 'country', label: 'Country / City', icon: Globe },
  { id: 'topAstrologers', label: 'Top Astrologers', icon: Award },
];

const sortingOptions = [
  { id: 'popularity', label: 'Popularity' },
  { id: 'exp-high', label: 'Experience: High to Low' },
  { id: 'exp-low', label: 'Experience: Low to High' },
  { id: 'orders-high', label: 'Total Orders: High to Low' },
  { id: 'orders-low', label: 'Total Orders: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'rating-high', label: 'Rating: High to Low' },
];

const fallbackSkills = [
  'Vedic Astrology',
  'Kundli / Prashna',
  'Love & Relationship',
  'Career & Business',
  'Marriage & Gun Milan',
  'Health & Medical Astrology',
  'Tarot Reading',
  'Numerology',
  'KP Astrology',
  'Vastu Shastra',
  'Nadi Astrology',
  'Lal Kitab',
  'Palmistry',
  'Face Reading',
  'Psychic Reading',
];

const fallbackLanguages = [
  'English',
  'Hindi',
  'Sanskrit',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Odia',
  'Marwadi',
];

const fallbackCountries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'United Arab Emirates (UAE)',
  'Malaysia',
  'Other International',
];

const topAstrologerOptions = [
  { id: 'all', label: 'All Astrologers' },
  { id: 'celebrity', label: 'Celebrity & Verified Astrologers' },
  { id: 'rising-star', label: 'Top Rated Astrologers (4.8+)' },
  { id: 'master', label: 'Senior Masters (> 15 Yrs Experience)' },
  { id: 'online-now', label: 'Available Online Now' },
];

export default function AstrologerFilterModal({
  isOpen,
  onClose,
  filterState,
  onApply,
  onReset,
  dynamicSkills = [],
  dynamicLanguages = [],
  dynamicCountries = [],
  dynamicGenders = [],
}: AstrologerFilterModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('sorting');
  const [draftFilters, setDraftFilters] = useState<AstrologerFilterState>(filterState);
  const [tabSearch, setTabSearch] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync draft state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filterState);
      setTabSearch('');
    }
  }, [isOpen, filterState]);

  if (!mounted || !isOpen) return null;

  // Derive final lists combining dynamic data with fallbacks
  const effectiveSkills: DynamicFilterOption[] =
    dynamicSkills.length > 0
      ? dynamicSkills
      : fallbackSkills.map((s) => ({ name: s }));

  const effectiveLanguages: DynamicFilterOption[] =
    dynamicLanguages.length > 0
      ? dynamicLanguages
      : fallbackLanguages.map((l) => ({ name: l }));

  const effectiveCountries: DynamicFilterOption[] =
    dynamicCountries.length > 0
      ? dynamicCountries
      : fallbackCountries.map((c) => ({ name: c }));

  const effectiveGenders =
    dynamicGenders.length > 0
      ? [{ id: 'all', label: 'All Genders' }, ...dynamicGenders]
      : [
          { id: 'all', label: 'All Genders' },
          { id: 'male', label: 'Male' },
          { id: 'female', label: 'Female' },
        ];

  // Filtering for right panel search
  const filteredSkills = effectiveSkills.filter((sk) =>
    sk.name.toLowerCase().includes(tabSearch.toLowerCase())
  );
  const filteredLanguages = effectiveLanguages.filter((l) =>
    l.name.toLowerCase().includes(tabSearch.toLowerCase())
  );
  const filteredCountries = effectiveCountries.filter((c) =>
    c.name.toLowerCase().includes(tabSearch.toLowerCase())
  );

  const handleToggleSkill = (skill: string) => {
    setDraftFilters((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const handleToggleLanguage = (lang: string) => {
    setDraftFilters((prev) => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang],
      };
    });
  };

  const handleToggleCountry = (country: string) => {
    setDraftFilters((prev) => {
      const exists = prev.countries.includes(country);
      return {
        ...prev,
        countries: exists ? prev.countries.filter((c) => c !== country) : [...prev.countries, country],
      };
    });
  };

  const handleApplyClick = () => {
    onApply(draftFilters);
    onClose();
  };

  const handleResetClick = () => {
    setDraftFilters(defaultFilterState);
    onReset();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" /> FILTERS
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: 2 Columns */}
          <div className="flex flex-1 min-h-[380px] max-h-[460px] overflow-hidden">
            {/* Left Tabs Sidebar */}
            <div className="w-40 sm:w-44 border-r border-border bg-muted/30 py-2 flex flex-col shrink-0 overflow-y-auto">
              {filterTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                let activeCountInTab = 0;
                if (tab.id === 'skill') activeCountInTab = draftFilters.skills.length;
                if (tab.id === 'language') activeCountInTab = draftFilters.languages.length;
                if (tab.id === 'country') activeCountInTab = draftFilters.countries.length;
                if (tab.id === 'gender' && draftFilters.gender !== 'all') activeCountInTab = 1;
                if (tab.id === 'topAstrologers' && draftFilters.topAstrologer !== 'all')
                  activeCountInTab = 1;
                if (tab.id === 'sorting' && draftFilters.sortBy !== 'popularity')
                  activeCountInTab = 1;

                const TabIcon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setTabSearch('');
                    }}
                    className={`flex items-center justify-between px-4 py-3 text-xs font-bold transition-all text-left relative ${
                      isActive
                        ? 'bg-card text-foreground font-extrabold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TabIcon
                        size={15}
                        className={isActive ? 'text-[#FACC15]' : 'text-muted-foreground'}
                      />
                      <span className="truncate">{tab.label}</span>
                    </div>

                    {activeCountInTab > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FACC15] text-black text-[9px] font-black flex items-center justify-center shrink-0">
                        {activeCountInTab}
                      </span>
                    )}

                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FACC15] rounded-r" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Tab Content */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col">
              {/* Search within tab if applicable */}
              {['skill', 'language', 'country'].includes(activeTab) && (
                <div className="relative mb-4 shrink-0">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={tabSearch}
                    onChange={(e) => setTabSearch(e.target.value)}
                    placeholder={`Search ${filterTabs.find((t) => t.id === activeTab)?.label}...`}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FACC15]"
                  />
                </div>
              )}

              {/* Sorting Tab */}
              {activeTab === 'sorting' && (
                <div className="space-y-1">
                  {sortingOptions.map((opt) => {
                    const isSelected = draftFilters.sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setDraftFilters((prev) => ({ ...prev, sortBy: opt.id }))
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                          isSelected
                            ? 'bg-[#FACC15]/15 text-foreground font-bold border border-[#FACC15]/30'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#FACC15] bg-[#FACC15] text-black'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skill' && (
                <div className="space-y-1">
                  {filteredSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No skills found
                    </p>
                  ) : (
                    filteredSkills.map((sk) => {
                      const isChecked = draftFilters.skills.includes(sk.name);
                      return (
                        <button
                          key={sk.name}
                          type="button"
                          onClick={() => handleToggleSkill(sk.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                            isChecked
                              ? 'bg-[#FACC15]/15 text-foreground font-bold border border-[#FACC15]/30'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'border-[#FACC15] bg-[#FACC15] text-black'
                                  : 'border-muted-foreground/40'
                              }`}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="truncate">{sk.name}</span>
                          </div>
                          {sk.count !== undefined && sk.count > 0 && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({sk.count})
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* Languages Tab */}
              {activeTab === 'language' && (
                <div className="space-y-1">
                  {filteredLanguages.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No languages found
                    </p>
                  ) : (
                    filteredLanguages.map((lg) => {
                      const isChecked = draftFilters.languages.includes(lg.name);
                      return (
                        <button
                          key={lg.name}
                          type="button"
                          onClick={() => handleToggleLanguage(lg.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                            isChecked
                              ? 'bg-[#FACC15]/15 text-foreground font-bold border border-[#FACC15]/30'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'border-[#FACC15] bg-[#FACC15] text-black'
                                  : 'border-muted-foreground/40'
                              }`}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="truncate">{lg.name}</span>
                          </div>
                          {lg.count !== undefined && lg.count > 0 && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({lg.count})
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* Gender Tab */}
              {activeTab === 'gender' && (
                <div className="space-y-1">
                  {effectiveGenders.map((gen) => {
                    const isSelected = draftFilters.gender === gen.id;
                    return (
                      <button
                        key={gen.id}
                        type="button"
                        onClick={() =>
                          setDraftFilters((prev) => ({ ...prev, gender: gen.id }))
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                          isSelected
                            ? 'bg-[#FACC15]/15 text-foreground font-bold border border-[#FACC15]/30'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{gen.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#FACC15] bg-[#FACC15] text-black'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Country Tab */}
              {activeTab === 'country' && (
                <div className="space-y-1">
                  {filteredCountries.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No countries found
                    </p>
                  ) : (
                    filteredCountries.map((c) => {
                      const isChecked = draftFilters.countries.includes(c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleToggleCountry(c.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                            isChecked
                              ? 'bg-[#FACC15]/15 text-foreground font-bold border border-[#FACC15]/30'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'border-[#FACC15] bg-[#FACC15] text-black'
                                  : 'border-muted-foreground/40'
                              }`}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="truncate">{c.name}</span>
                          </div>
                          {c.count !== undefined && c.count > 0 && (
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ({c.count})
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* Top Astrologers Tab */}
              {activeTab === 'topAstrologers' && (
                <div className="space-y-1">
                  {topAstrologerOptions.map((opt) => {
                    const isSelected = draftFilters.topAstrologer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setDraftFilters((prev) => ({ ...prev, topAstrologer: opt.id }))
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                          isSelected
                            ? 'bg-[#FACC15]/15 text-foreground font-bold border border-[#FACC15]/30'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#FACC15] bg-[#FACC15] text-black'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetClick}
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApplyClick}
              className="px-8 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              Apply
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
