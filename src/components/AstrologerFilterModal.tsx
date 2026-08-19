'use client';

import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>('sorting');
  const [draftFilters, setDraftFilters] = useState<AstrologerFilterState>(filterState);
  const [tabSearch, setTabSearch] = useState<string>('');

  // Sync draft state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filterState);
      setTabSearch('');
    }
  }, [isOpen, filterState]);

  if (!isOpen) return null;

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
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
                if (tab.id === 'topAstrologers' && draftFilters.topAstrologer !== 'all') activeCountInTab = 1;
                if (tab.id === 'sorting' && draftFilters.sortBy !== 'popularity') activeCountInTab = 1;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setTabSearch('');
                    }}
                    className={`text-left px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-medium transition-all flex items-center justify-between relative ${
                      isActive
                        ? 'bg-muted text-foreground font-bold border-l-4 border-yellow-400 dark:border-[#FACC15]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-4 border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {activeCountInTab > 0 && (
                      <span className="w-4 h-4 rounded-full bg-yellow-400 text-black text-[10px] font-black flex items-center justify-center shrink-0 ml-1">
                        {activeCountInTab}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Options Content */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-3 flex flex-col">
              {/* Search within tab (for Skill, Language, Country) */}
              {(activeTab === 'skill' || activeTab === 'language' || activeTab === 'country') && (
                <div className="relative mb-2 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={tabSearch}
                    onChange={(e) => setTabSearch(e.target.value)}
                    placeholder={`Search registered ${activeTab}...`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs outline-none focus:border-yellow-400"
                  />
                </div>
              )}

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {/* 1. Sorting */}
                {activeTab === 'sorting' && (
                  <>
                    {sortingOptions.map((opt) => {
                      const isSelected = draftFilters.sortBy === opt.id;
                      return (
                        <label
                          key={opt.id}
                          onClick={() => setDraftFilters({ ...draftFilters, sortBy: opt.id })}
                          className="flex items-center gap-3 cursor-pointer py-1.5 group select-none text-xs sm:text-sm text-foreground/90 hover:text-foreground transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-400 text-black'
                                : 'border-muted-foreground/40 group-hover:border-foreground'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                          </div>
                          <span className={isSelected ? 'font-semibold text-foreground' : ''}>
                            {opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </>
                )}

                {/* 2. Dynamic Skills / Talents */}
                {activeTab === 'skill' && (
                  <>
                    {filteredSkills.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No matching registered skills found.</p>
                    ) : (
                      filteredSkills.map((item) => {
                        const isSelected = draftFilters.skills.includes(item.name);
                        return (
                          <label
                            key={item.name}
                            onClick={() => handleToggleSkill(item.name)}
                            className="flex items-center justify-between cursor-pointer py-1.5 group select-none text-xs sm:text-sm text-foreground/90 hover:text-foreground transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-yellow-400 bg-yellow-400 text-black'
                                    : 'border-muted-foreground/40 group-hover:border-foreground'
                                }`}
                              >
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                              <span className={isSelected ? 'font-semibold text-foreground' : ''}>
                                {item.name}
                              </span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                {item.count}
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </>
                )}

                {/* 3. Dynamic Languages */}
                {activeTab === 'language' && (
                  <>
                    {filteredLanguages.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No matching languages found.</p>
                    ) : (
                      filteredLanguages.map((item) => {
                        const isSelected = draftFilters.languages.includes(item.name);
                        return (
                          <label
                            key={item.name}
                            onClick={() => handleToggleLanguage(item.name)}
                            className="flex items-center justify-between cursor-pointer py-1.5 group select-none text-xs sm:text-sm text-foreground/90 hover:text-foreground transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-yellow-400 bg-yellow-400 text-black'
                                    : 'border-muted-foreground/40 group-hover:border-foreground'
                                }`}
                              >
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                              <span className={isSelected ? 'font-semibold text-foreground' : ''}>
                                {item.name}
                              </span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                {item.count}
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </>
                )}

                {/* 4. Dynamic Gender */}
                {activeTab === 'gender' && (
                  <>
                    {effectiveGenders.map((g) => {
                      const isSelected = draftFilters.gender === g.id;
                      return (
                        <label
                          key={g.id}
                          onClick={() => setDraftFilters({ ...draftFilters, gender: g.id })}
                          className="flex items-center justify-between cursor-pointer py-1.5 group select-none text-xs sm:text-sm text-foreground/90 hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-yellow-400 bg-yellow-400 text-black'
                                  : 'border-muted-foreground/40 group-hover:border-foreground'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                            </div>
                            <span className={isSelected ? 'font-semibold text-foreground' : ''}>
                              {g.label}
                            </span>
                          </div>
                          {g.count !== undefined && g.count > 0 && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                              {g.count}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </>
                )}

                {/* 5. Dynamic Countries / Cities */}
                {activeTab === 'country' && (
                  <>
                    {filteredCountries.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No matching countries or locations found.</p>
                    ) : (
                      filteredCountries.map((item) => {
                        const isSelected = draftFilters.countries.includes(item.name);
                        return (
                          <label
                            key={item.name}
                            onClick={() => handleToggleCountry(item.name)}
                            className="flex items-center justify-between cursor-pointer py-1.5 group select-none text-xs sm:text-sm text-foreground/90 hover:text-foreground transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-yellow-400 bg-yellow-400 text-black'
                                    : 'border-muted-foreground/40 group-hover:border-foreground'
                                }`}
                              >
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                              <span className={isSelected ? 'font-semibold text-foreground' : ''}>
                                {item.name}
                              </span>
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                {item.count}
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </>
                )}

                {/* 6. Top Astrologers */}
                {activeTab === 'topAstrologers' && (
                  <>
                    {topAstrologerOptions.map((topOpt) => {
                      const isSelected = draftFilters.topAstrologer === topOpt.id;
                      return (
                        <label
                          key={topOpt.id}
                          onClick={() => setDraftFilters({ ...draftFilters, topAstrologer: topOpt.id })}
                          className="flex items-center gap-3 cursor-pointer py-1.5 group select-none text-xs sm:text-sm text-foreground/90 hover:text-foreground transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-400 text-black'
                                : 'border-muted-foreground/40 group-hover:border-foreground'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                          </div>
                          <span className={isSelected ? 'font-semibold text-foreground' : ''}>
                            {topOpt.label}
                          </span>
                        </label>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
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
    </AnimatePresence>
  );
}
