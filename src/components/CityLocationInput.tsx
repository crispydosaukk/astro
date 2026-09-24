'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface CityLocationInputProps {
  value: string;
  onChange: (city: string, details?: { lat?: string; lon?: string; country?: string }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
}

const POPULAR_CITIES = [
  { mainText: 'Bengaluru', secondaryText: 'Karnataka, India', description: 'Bengaluru, Karnataka, India', lat: '12.9716', lon: '77.5946' },
  { mainText: 'New Delhi', secondaryText: 'Delhi, India', description: 'New Delhi, Delhi, India', lat: '28.6139', lon: '77.2090' },
  { mainText: 'Mumbai', secondaryText: 'Maharashtra, India', description: 'Mumbai, Maharashtra, India', lat: '19.0760', lon: '72.8777' },
  { mainText: 'Hyderabad', secondaryText: 'Telangana, India', description: 'Hyderabad, Telangana, India', lat: '17.3850', lon: '78.4867' },
  { mainText: 'Chennai', secondaryText: 'Tamil Nadu, India', description: 'Chennai, Tamil Nadu, India', lat: '13.0827', lon: '80.2707' },
  { mainText: 'Kolkata', secondaryText: 'West Bengal, India', description: 'Kolkata, West Bengal, India', lat: '22.5726', lon: '88.3639' },
  { mainText: 'Pune', secondaryText: 'Maharashtra, India', description: 'Pune, Maharashtra, India', lat: '18.5204', lon: '73.8567' },
  { mainText: 'Ahmedabad', secondaryText: 'Gujarat, India', description: 'Ahmedabad, Gujarat, India', lat: '23.0225', lon: '72.5714' },
  { mainText: 'Jaipur', secondaryText: 'Rajasthan, India', description: 'Jaipur, Rajasthan, India', lat: '26.9124', lon: '75.7873' },
  { mainText: 'Varanasi', secondaryText: 'Uttar Pradesh, India', description: 'Varanasi, Uttar Pradesh, India', lat: '25.3176', lon: '82.9739' },
  { mainText: 'London', secondaryText: 'United Kingdom', description: 'London, UK', lat: '51.5074', lon: '-0.1278' },
  { mainText: 'Dubai', secondaryText: 'United Arab Emirates', description: 'Dubai, United Arab Emirates', lat: '25.2048', lon: '55.2708' },
  { mainText: 'New York', secondaryText: 'NY, United States', description: 'New York, NY, United States', lat: '40.7128', lon: '-74.0060' },
];

export default function CityLocationInput({
  value,
  onChange,
  placeholder = 'Type city name e.g. Bengaluru, India',
  required = false,
  className = '',
  label,
}: CityLocationInputProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<any[]>(POPULAR_CITIES);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle outside click to close dropdown
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
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Reverse geocode via free Nominatim/Google fallback
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'AstroParihar-LocationService/1.0' } }
          );
          const data = await res.json();
          if (data && data.address) {
            const city =
              data.address.city ||
              data.address.town ||
              data.address.suburb ||
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

    if (!val || val.trim().length < 1) {
      setSuggestions(POPULAR_CITIES);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location-autocomplete?query=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.predictions) && data.predictions.length > 0) {
          setSuggestions(data.predictions);
        } else {
          // Fallback to local filtering of popular cities
          const matches = POPULAR_CITIES.filter(
            (c) =>
              c.mainText.toLowerCase().includes(val.toLowerCase()) ||
              c.secondaryText.toLowerCase().includes(val.toLowerCase()) ||
              c.description.toLowerCase().includes(val.toLowerCase())
          );
          setSuggestions(matches);
        }
      } catch (err) {
        console.error('Google Places location search error:', err);
        const matches = POPULAR_CITIES.filter(
          (c) =>
            c.mainText.toLowerCase().includes(val.toLowerCase()) ||
            c.secondaryText.toLowerCase().includes(val.toLowerCase())
        );
        setSuggestions(matches);
      } finally {
        setIsSearching(false);
      }
    }, 200);
  };

  const handleSelectCity = async (item: any) => {
    const cityName = item.description || (item.mainText ? `${item.mainText}, ${item.secondaryText}` : item);
    setQuery(cityName);
    setShowDropdown(false);

    let lat = item.lat;
    let lon = item.lon;

    // If item has a placeId, fetch exact coordinates silently from Google Places Details API
    if (item.placeId && !item.placeId.startsWith('curated-')) {
      try {
        const detailsRes = await fetch(`/api/location-autocomplete?placeId=${encodeURIComponent(item.placeId)}`);
        const detailsData = await detailsRes.json();
        if (detailsData.success && detailsData.lat && detailsData.lon) {
          lat = detailsData.lat;
          lon = detailsData.lon;
        }
      } catch (err) {
        console.warn('Coordinates lookup error:', err);
      }
    }

    onChange(cityName, { lat, lon });
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
          title="Detect Current Location via GPS"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#713B32] hover:bg-[#EDE4D5] transition-colors"
        >
          {isLocating ? (
            <Loader2 size={16} className="animate-spin text-[#C9952B]" />
          ) : (
            <Navigation size={16} className="hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute z-[100] left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] shadow-2xl space-y-0.5 p-2 text-left">
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
            <span className="text-[9px] text-[#C9952B] font-bold flex items-center gap-1">
              <MapPin size={10} /> Google Maps
            </span>
          </div>

          {isSearching ? (
            <div className="p-4 text-center text-xs text-[#6B5E55] flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#C9952B]" size={14} /> Searching places...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[#6B5E55] text-center">
              No matching places found. Try another city or locality.
            </div>
          ) : (
            suggestions.map((item, idx) => {
              const mainText = item.mainText || item.display_name?.split(',')[0] || item.description?.split(',')[0];
              const secondaryText = item.secondaryText || item.display_name?.split(',').slice(1).join(',').trim() || item.description?.split(',').slice(1).join(',').trim();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCity(item)}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F8F3EA] transition-colors flex items-center justify-between text-xs text-[#292522] group"
                >
                  <div className="flex items-start gap-2.5 truncate pr-2">
                    <MapPin
                      size={14}
                      className="text-[#713B32] shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                    />
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-xs text-[#292522] truncate">
                        {mainText}
                      </span>
                      {secondaryText && (
                        <span className="text-[11px] text-[#6B5E55] truncate">
                          {secondaryText}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
