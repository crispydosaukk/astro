'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRY_CODES } from '@/lib/countryCodes';

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
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find(c => c.code === value) ?? COUNTRY_CODES[0];

  useEffect(() => { setMounted(true); }, []);

  const handleOpen = () => {
    if (disabled || !triggerRef.current) return;

    // Use getBoundingClientRect + window.scrollY for document-relative absolute positioning
    // This avoids the CSS transform / animate-slide-up breaking position:fixed
    const rect = triggerRef.current.getBoundingClientRect();
    const DROPDOWN_H = 300;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top: number;
    if (spaceBelow < DROPDOWN_H && rect.top > DROPDOWN_H) {
      // Not enough space below → open upward
      top = rect.top + window.scrollY - DROPDOWN_H - 4;
    } else {
      // Open downward
      top = rect.bottom + window.scrollY + 4;
    }

    setMenuStyle({
      position: 'absolute',
      top,
      left: rect.left + window.scrollX,
      width: 264,
      zIndex: 99999,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 60);
    const onOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setIsOpen(false);
      setSearchQuery('');
    };
    document.addEventListener('mousedown', onOutside);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', onOutside); };
  }, [isOpen]);

  const filtered = COUNTRY_CODES.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.country.toLowerCase().includes(q) || c.code.includes(q) || c.iso.toLowerCase().includes(q);
  });

  const menu = (
    <div
      ref={menuRef}
      style={{ ...menuStyle, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
    >
      <div className="p-2 border-b border-border bg-muted/30">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search country or code..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto p-1 text-xs">
        {filtered.length > 0 ? filtered.map(c => {
          const isSel = c.code === value && c.iso === selected.iso;
          return (
            <button
              key={c.code + c.iso}
              type="button"
              onClick={() => { onChange(c.code); setIsOpen(false); setSearchQuery(''); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${isSel ? 'bg-primary/15 text-primary font-bold' : 'text-foreground hover:bg-muted/60'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                <span className="truncate text-xs">{c.country}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span className="font-mono text-2xs text-muted-foreground">{c.code}</span>
                {isSel && <Check size={11} className="text-primary" />}
              </div>
            </button>
          );
        }) : (
          <div className="p-3 text-center text-2xs text-muted-foreground italic">No countries match &ldquo;{searchQuery}&rdquo;</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={handleOpen}
        className={`flex items-center gap-1.5 px-2.5 py-2 bg-muted/50 border-r border-border hover:bg-muted/80 transition-colors text-xs font-semibold text-foreground select-none flex-shrink-0 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {icon}
        <span className="text-sm leading-none" title={selected.country}>{selected.flag}</span>
        <span className="font-mono text-xs">{selected.code}</span>
        <ChevronDown size={11} className={`text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {mounted && isOpen && !disabled && createPortal(menu, document.body)}
    </>
  );
}
