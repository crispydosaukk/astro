'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { SupportedLanguage } from '@/lib/applyTranslations';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  native: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
  { code: 'te', label: 'తెలుగు', native: 'Telugu' },
  { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
  { code: 'kn', label: 'ಕನ್ನಡ', native: 'Kannada' },
];

interface LanguageDropdownProps {
  value: SupportedLanguage;
  onChange: (code: SupportedLanguage) => void;
  className?: string;
  buttonClassName?: string;
  id?: string;
  ariaLabel?: string;
}

export default function LanguageDropdown({
  value,
  onChange,
  className = '',
  buttonClassName = '',
  id = 'language-dropdown',
  ariaLabel = 'Select language',
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = LANGUAGE_OPTIONS.find(l => l.code === value) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const DROPDOWN_H = 240;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top: number;
    if (spaceBelow < DROPDOWN_H && rect.top > DROPDOWN_H) {
      // Open upward if no space below
      top = rect.top + window.scrollY - DROPDOWN_H - 6;
    } else {
      // Open downward
      top = rect.bottom + window.scrollY + 6;
    }

    // Keep dropdown inside viewport horizontally
    let left = rect.left + window.scrollX;
    const DROPDOWN_W = 230;
    if (left + DROPDOWN_W > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - DROPDOWN_W - 16 + window.scrollX);
    }

    setMenuStyle({
      position: 'absolute',
      top,
      left,
      width: DROPDOWN_W,
      zIndex: 99999,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const menu = (
    <div
      ref={menuRef}
      style={{
        ...menuStyle,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.16)',
      }}
      className="animate-in fade-in-0 zoom-in-95 duration-100 dark:!bg-card dark:!border-border"
    >
      <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
        <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider">
          Select Language · భాష
        </span>
        <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
          5 Options
        </span>
      </div>

      <div className="p-1.5 space-y-1">
        {LANGUAGE_OPTIONS.map(opt => {
          const isSelected = opt.code === value;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                onChange(opt.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                  : 'hover:bg-muted/60 text-foreground font-medium'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {opt.label}
                </span>
                <span className="text-2xs text-muted-foreground">
                  ({opt.native})
                </span>
              </div>
              {isSelected && <Check size={15} className="text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`px-3 py-1.5 rounded-xl border border-primary/30 hover:border-primary/60 bg-card hover:bg-muted/50 text-foreground text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs select-none ${
          isOpen ? 'ring-2 ring-primary/30 border-primary' : ''
        } ${buttonClassName}`}
      >
        <span className="text-sm flex-shrink-0">🌐</span>
        <span className="font-extrabold text-xs">
          {selected.label}
        </span>
        <span className="text-3xs text-muted-foreground hidden sm:inline">
          ({selected.native})
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {mounted && isOpen && typeof window !== 'undefined' && createPortal(menu, document.body)}
    </div>
  );
}
