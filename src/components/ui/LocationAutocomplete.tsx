'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Check } from 'lucide-react';

export interface LocationPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  source: 'google' | 'curated';
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  error?: string;
  autoFocus?: boolean;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'e.g. Hyderabad, Telangana',
  required = false,
  className = '',
  id,
  error,
  autoFocus = false,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [predictions, setPredictions] = useState<LocationPrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recommendations with debouncing
  const fetchRecommendations = async (query: string) => {
    if (!query || query.trim().length < 1) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/discovery/location-autocomplete?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.predictions) && data.predictions.length > 0) {
        setPredictions(data.predictions);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.warn('Location recommendation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    onChange(nextVal);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchRecommendations(nextVal);
    }, 200);
  };

  const handleSelectPrediction = (prediction: LocationPrediction) => {
    const selectedLocation = prediction.description;
    setInputValue(selectedLocation);
    onChange(selectedLocation);
    setIsOpen(false);
    setPredictions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) {
      if (e.key === 'ArrowDown' && inputValue.trim()) {
        fetchRecommendations(inputValue);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
        e.preventDefault();
        handleSelectPrediction(predictions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground flex items-center">
          {isLoading ? (
            <Loader2 size={15} className="animate-spin text-primary" />
          ) : (
            <MapPin size={15} className="text-primary/80" />
          )}
        </div>

        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
            else if (inputValue.trim()) fetchRecommendations(inputValue);
          }}
          onKeyDown={handleKeyDown}
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 pr-8 py-2 text-sm border rounded-lg bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
            error ? 'border-red-500 ring-1 ring-red-500/20' : 'border-border'
          } ${className}`}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            title="Clear location"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {error && <p className="text-2xs text-red-600 mt-1">{error}</p>}

      {/* Autocomplete Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-slide-up">
          <div className="px-3 py-1.5 bg-muted/40 border-b border-border flex items-center justify-between">
            <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin size={11} className="text-primary" /> Google Maps Locations
            </span>
            <span className="text-2xs text-muted-foreground font-medium">Click to select</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
            {predictions.map((p, idx) => {
              const isHighlighted = idx === highlightedIndex;
              const isCurrent = inputValue.toLowerCase() === p.description.toLowerCase() || 
                                inputValue.toLowerCase() === p.mainText.toLowerCase();

              return (
                <button
                  key={p.placeId || idx}
                  type="button"
                  onClick={() => handleSelectPrediction(p)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors ${
                    isHighlighted ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <MapPin
                    size={15}
                    className={`mt-0.5 flex-shrink-0 ${
                      isHighlighted ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">
                      {p.mainText}
                    </p>
                    {p.secondaryText && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {p.secondaryText}
                      </p>
                    )}
                  </div>
                  {isCurrent && (
                    <Check size={14} className="text-emerald-600 flex-shrink-0 mt-0.5 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
