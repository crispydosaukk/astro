'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Check, Globe, Navigation, Loader2 } from 'lucide-react';

interface CityLocationInputProps {
  value: string;
  onChange: (city: string, details?: { lat?: string; lon?: string; country?: string }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
}

const POPULAR_CITIES = [
  { display_name: 'Bengaluru, Karnataka, India', lat: '12.9716', lon: '77.5946' },
  { display_name: 'New Delhi, Delhi, India', lat: '28.6139', lon: '77.2090' },
  { display_name: 'Mumbai, Maharashtra, India', lat: '19.0760', lon: '72.8777' },
  { display_name: 'Hyderabad, Telangana, India', lat: '17.3850', lon: '78.4867' },
  { display_name: 'Chennai, Tamil Nadu, India', lat: '13.0827', lon: '80.2707' },
  { display_name: 'Kolkata, West Bengal, India', lat: '22.5726', lon: '88.3639' },
  { display_name: 'Pune, Maharashtra, India', lat: '18.5204', lon: '73.8567' },
  { display_name: 'Ahmedabad, Gujarat, India', lat: '23.0225', lon: '72.5714' },
  { display_name: 'Jaipur, Rajasthan, India', lat: '26.9124', lon: '75.7873' },
  { display_name: 'London, Greater London, United Kingdom', lat: '51.5074', lon: '-0.1278' },
  { display_name: 'New York, NY, United States', lat: '40.7128', lon: '-74.0060' },
  { display_name: 'Dubai, United Arab Emirates', lat: '25.2048', lon: '55.2708' },
];

export default function CityLocationInput({
  value,
  onChange,
  placeholder = 'Type city name e.g. Bengaluru, India',
  required = false,
  className = '',
  label,
}: CityLocationInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat?: string; lon?: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Auto-detect location on mount if geolocation is available
  useEffect(() => {
    if (!value || value === 'New Delhi, Delhi, India') {
      detectCurrentLocation(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const detectCurrentLocation = (userInitiated = true) => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude.toString();
          const lon = pos.coords.longitude.toString();

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();

          if (data && data.display_name) {
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county || data.display_name.split(',')[0];
            const state = address.state || '';
            const country = address.country || 'India';

            const formatted = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

            setQuery(formatted);
            setSelectedCoords({ lat, lon });
            onChange(formatted, { lat, lon, country });
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        if (userInitiated) {
          console.warn('Geolocation permission denied or unavailable:', err.message);
        }
        setIsLocating(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (val.trim().length < 2) {
      setSuggestions(POPULAR_CITIES);
      setShowDropdown(true);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=6`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setSuggestions(data);
        } else {
          setSuggestions(
            POPULAR_CITIES.filter((c) => c.display_name.toLowerCase().includes(val.toLowerCase()))
          );
        }
      } catch (err) {
        console.error('Location search error:', err);
        setSuggestions(POPULAR_CITIES.filter((c) => c.display_name.toLowerCase().includes(val.toLowerCase())));
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectCity = (cityItem: any) => {
    const cityName = cityItem.display_name || cityItem;
    setQuery(cityName);
    setSelectedCoords({ lat: cityItem.lat, lon: cityItem.lon });
    onChange(cityName, { lat: cityItem.lat, lon: cityItem.lon });
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#C9952B]" /> {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          required={required}
          value={query}
          onFocus={() => {
            if (suggestions.length === 0) setSuggestions(POPULAR_CITIES);
            setShowDropdown(true);
          }}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B] transition-colors ${className}`}
        />
        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9952B]" />

        <button
          type="button"
          onClick={() => detectCurrentLocation(true)}
          title="Detect Current Location"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#C9952B] hover:bg-[#C9952B]/20 transition-colors"
        >
          {isLocating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} className="hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {selectedCoords?.lat && (
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
          <Globe size={11} /> Coordinates: {Number(selectedCoords.lat).toFixed(2)}° N, {Number(selectedCoords.lon).toFixed(2)}° E
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute z-[100] left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-slate-950/95 border border-[#C9952B]/50 backdrop-blur-xl shadow-2xl shadow-black/90 space-y-0.5 p-1.5 text-left">
          <button
            type="button"
            onClick={() => detectCurrentLocation(true)}
            className="w-full px-3 py-2 text-left rounded-xl bg-[#C9952B]/15 hover:bg-[#C9952B]/30 text-[#C9952B] font-bold text-xs flex items-center justify-between transition-colors border border-[#C9952B]/30 mb-1"
          >
            <div className="flex items-center gap-2">
              <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
              <span>Use Current Location</span>
            </div>
            <span className="text-[10px] text-amber-300">GPS Auto-Detect</span>
          </button>

          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C9952B] border-b border-white/5 flex justify-between items-center">
            <span>Location Suggestions</span>
            <span className="text-[9px] text-muted-foreground">OpenStreetMap Maps API</span>
          </div>

          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">
              No matching cities found. Type exact city name.
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectCity(item)}
                className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#C9952B]/20 transition-colors flex items-center justify-between text-xs text-foreground group"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MapPin size={13} className="text-[#C9952B] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{item.display_name}</span>
                </div>
                {item.lat && (
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {Number(item.lat).toFixed(1)}°, {Number(item.lon).toFixed(1)}°
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
