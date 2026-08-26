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

  const detectCurrentLocation = async (manual = false) => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setSelectedCoords({ lat: latitude.toString(), lon: longitude.toString() });

          // Reverse geocode via free Nominatim OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'AstroParihar-LocationService/1.0' } }
          );
          const data = await res.json();
          if (data && data.address) {
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state_district ||
              'Detected Location';
            const state = data.address.state || '';
            const country = data.address.country || 'India';
            const fullLoc = [city, state, country].filter(Boolean).join(', ');

            setQuery(fullLoc);
            onChange(fullLoc, {
              lat: latitude.toString(),
              lon: longitude.toString(),
              country: data.address.country_code?.toUpperCase() || 'IN',
            });
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        } finally {
          setIsLocating(false);
          setShowDropdown(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (manual) console.log('Location permission denied or unavailable');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setShowDropdown(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val || val.trim().length < 2) {
      setSuggestions(POPULAR_CITIES);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=6&accept-language=en`,
          { headers: { 'User-Agent': 'AstroParihar-LocationService/1.0' } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
        } else {
          setSuggestions(
            POPULAR_CITIES.filter((c) => c.display_name.toLowerCase().includes(val.toLowerCase()))
          );
        }
      } catch (err) {
        console.error('Location search error:', err);
        setSuggestions(
          POPULAR_CITIES.filter((c) => c.display_name.toLowerCase().includes(val.toLowerCase()))
        );
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
        <label className="block text-xs font-bold text-[#6B5E55] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#713B32]" /> {label}
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
          className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm outline-none focus:border-[#B88A44] transition-colors shadow-sm ${className}`}
        />
        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#713B32]" />

        <button
          type="button"
          onClick={() => detectCurrentLocation(true)}
          title="Detect Current Location"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#713B32] hover:bg-[#EDE4D5] transition-colors"
        >
          {isLocating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} className="hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {selectedCoords?.lat && (
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono">
          <Globe size={11} /> Coordinates: {Number(selectedCoords.lat).toFixed(2)}° N,{' '}
          {Number(selectedCoords.lon).toFixed(2)}° E
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute z-[100] left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] shadow-2xl space-y-0.5 p-2 text-left">
          <button
            type="button"
            onClick={() => detectCurrentLocation(true)}
            className="w-full px-3 py-2 text-left rounded-xl bg-[#EDE4D5] hover:bg-[#EDE4D5]/80 text-[#713B32] font-bold text-xs flex items-center justify-between transition-colors border border-[#E5D9C8] mb-1"
          >
            <div className="flex items-center gap-2">
              <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
              <span>Use Current Location</span>
            </div>
            <span className="text-[10px] text-[#713B32]/80">GPS Auto-Detect</span>
          </button>

          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] border-b border-[#E5D9C8] flex justify-between items-center">
            <span>Location Suggestions</span>
            <span className="text-[9px] text-[#6B5E55]/80">OpenStreetMap API</span>
          </div>

          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[#6B5E55] text-center">
              No matching cities found. Type exact city name.
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectCity(item)}
                className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F8F3EA] transition-colors flex items-center justify-between text-xs text-[#292522] group"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MapPin
                    size={13}
                    className="text-[#713B32] shrink-0 group-hover:scale-110 transition-transform"
                  />
                  <span className="truncate font-medium">{item.display_name}</span>
                </div>
                {item.lat && (
                  <span className="text-[10px] font-mono text-[#6B5E55] shrink-0">
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
