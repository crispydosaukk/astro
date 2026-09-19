'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRY_CODES, CountryCode } from '@/lib/countryCodes';

interface CountryCodeDropdownProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  ariaLabel?: string;
}

export default function CountryCodeDropdown({
  value,
  onChange,
  disabled = false,
  icon,
  ariaLabel = 'Select country code',
}: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCountries = COUNTRY_CODES.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.country.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-2 bg-muted/50 border-r border-border hover:bg-muted/80 transition-colors text-xs font-semibold text-foreground select-none h-full ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {icon}
        <span className="text-sm leading-none" title={selectedCountry.country}>
          {selectedCountry.flag}
        </span>
        <span className="font-mono text-xs">{selectedCountry.code}</span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-64 max-w-[85vw] bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/30 text-xs">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(c => {
                const isSelected = c.code === value && c.iso === selectedCountry.iso;
                return (
                  <button
                    key={c.code + c.iso}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/15 text-primary font-bold'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                      <span className="truncate">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                      {isSelected && <Check size={13} className="text-primary" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-2xs text-muted-foreground italic">
                No countries match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
