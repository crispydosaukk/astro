'use client';
import React, { useState } from 'react';
import { Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { RASHIS } from '@/lib/vedicAstrologyEngine';

export interface VedicSquareChartProps {
  chartData: any;
  chartType?: 'D1' | 'D9';
  title?: string;
  defaultStyle?: 'south-indian' | 'north-indian';
}

// 12 Signs in South Indian Clockwise Perimeter Order
// Starting from top-left (Pisces), then Aries, Taurus, Gemini...
const SOUTH_INDIAN_BOXES = [
  // Row 0
  { row: 1, col: 1, signIdx: 11, signName: 'Pisces', sanskrit: 'मीन', signNumber: 12 },
  { row: 1, col: 2, signIdx: 0, signName: 'Aries', sanskrit: 'मेष', signNumber: 1 },
  { row: 1, col: 3, signIdx: 1, signName: 'Taurus', sanskrit: 'वृषभ', signNumber: 2 },
  { row: 1, col: 4, signIdx: 2, signName: 'Gemini', sanskrit: 'मिथुन', signNumber: 3 },
  // Row 1
  { row: 2, col: 4, signIdx: 3, signName: 'Cancer', sanskrit: 'कर्क', signNumber: 4 },
  // Row 2
  { row: 3, col: 4, signIdx: 4, signName: 'Leo', sanskrit: 'सिंह', signNumber: 5 },
  // Row 3
  { row: 4, col: 4, signIdx: 5, signName: 'Virgo', sanskrit: 'कन्या', signNumber: 6 },
  { row: 4, col: 3, signIdx: 6, signName: 'Libra', sanskrit: 'तुला', signNumber: 7 },
  { row: 4, col: 2, signIdx: 7, signName: 'Scorpio', sanskrit: 'वृश्चिक', signNumber: 8 },
  { row: 4, col: 1, signIdx: 8, signName: 'Sagittarius', sanskrit: 'धनु', signNumber: 9 },
  // Left column going up
  { row: 3, col: 1, signIdx: 9, signName: 'Capricorn', sanskrit: 'मकर', signNumber: 10 },
  { row: 2, col: 1, signIdx: 10, signName: 'Aquarius', sanskrit: 'कुम्भ', signNumber: 11 },
];

// Planet display color map
const PLANET_COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  Sun: { text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  Surya: { text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  Moon: { text: 'text-slate-100', bg: 'bg-white/20', border: 'border-white/40' },
  Chandra: { text: 'text-slate-100', bg: 'bg-white/20', border: 'border-white/40' },
  Mars: { text: 'text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  Mangal: { text: 'text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  Mercury: { text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  Budh: { text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  Jupiter: { text: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' },
  Guru: { text: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' },
  Venus: { text: 'text-pink-300', bg: 'bg-pink-500/20', border: 'border-pink-500/40' },
  Shukra: { text: 'text-pink-300', bg: 'bg-pink-500/20', border: 'border-pink-500/40' },
  Saturn: { text: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
  Shani: { text: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
  Rahu: { text: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-500/40' },
  Ketu: { text: 'text-violet-300', bg: 'bg-violet-500/20', border: 'border-violet-500/40' },
};

function getPlanetStyle(name: string) {
  const cleanName = name.split(' ')[0];
  return (
    PLANET_COLOR_MAP[cleanName] || {
      text: 'text-amber-200',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
    }
  );
}

export default function VedicSquareChart({
  chartData,
  chartType = 'D1',
  title,
  defaultStyle = 'south-indian',
}: VedicSquareChartProps) {
  const [chartStyle, setChartStyle] = useState<'south-indian' | 'north-indian'>(defaultStyle);

  if (!chartData) return null;

  const isD1 = chartType === 'D1';

  // 1. Resolve Ascendant (Lagna) Sign Index
  let lagnaSignIdx = 0;
  if (isD1) {
    if (chartData.lagnaIndex !== undefined) {
      lagnaSignIdx = chartData.lagnaIndex;
    } else if (chartData.ascendantSignNumber) {
      lagnaSignIdx = chartData.ascendantSignNumber - 1;
    } else if (chartData.ascendant) {
      const found = RASHIS.findIndex((r) =>
        chartData.ascendant.toLowerCase().includes(r.shortName.toLowerCase())
      );
      if (found >= 0) lagnaSignIdx = found;
    }
  } else {
    // D9 Navamsha Lagna
    if (chartData.d9LagnaSignIdx !== undefined) {
      lagnaSignIdx = chartData.d9LagnaSignIdx;
    } else if (chartData.d9Houses?.[0]) {
      const found = RASHIS.findIndex((r) =>
        chartData.d9Houses[0].sign?.toLowerCase().includes(r.shortName.toLowerCase())
      );
      if (found >= 0) lagnaSignIdx = found;
    }
  }

  // 2. Resolve Planets per sign (0 to 11)
  const planetsBySign: Record<
    number,
    Array<{ name: string; degree?: string; status?: string; isLagna?: boolean }>
  > = {};
  for (let i = 0; i < 12; i++) {
    planetsBySign[i] = [];
  }

  // Add Lagna marker
  planetsBySign[lagnaSignIdx].push({
    name: 'Asc (Lagna)',
    degree: '',
    status: 'Lagna',
    isLagna: true,
  });

  if (isD1) {
    if (Array.isArray(chartData.planetaryDegrees)) {
      chartData.planetaryDegrees.forEach((p: any) => {
        const signIdx = p.signIdx !== undefined ? p.signIdx : 0;
        if (planetsBySign[signIdx]) {
          planetsBySign[signIdx].push({
            name: p.planet.split(' ')[0],
            degree: p.degree,
            status: p.status,
          });
        }
      });
    }
  } else {
    // D9 Navamsha planets
    if (Array.isArray(chartData.d9Planets)) {
      chartData.d9Planets.forEach((p: any) => {
        if (planetsBySign[p.signIdx]) {
          planetsBySign[p.signIdx].push({
            name: p.name,
            degree: '',
          });
        }
      });
    } else if (Array.isArray(chartData.d9Houses)) {
      chartData.d9Houses.forEach((h: any) => {
        const signIdx = (lagnaSignIdx + (h.houseNumber - 1)) % 12;
        if (h.planets && h.planets !== 'Empty' && h.planets !== 'No Planets') {
          const names = h.planets.split(',').map((s: string) => s.trim());
          names.forEach((pName: string) => {
            if (planetsBySign[signIdx]) {
              planetsBySign[signIdx].push({ name: pName });
            }
          });
        }
      });
    }
  }

  const chartHeading =
    title ||
    (isD1
      ? 'D1 Rashi Chakra (Main Birth Chart)'
      : 'D9 Navamsha Chakra (Spiritual & Marriage Strength)');

  const devoteeName = chartData.name || 'Devotee';
  const dob = chartData.dob || '';
  const tob = chartData.tob || '';
  const pob = chartData.pob || '';

  return (
    <div className="space-y-4">
      {/* Top Controls: Title & Chart Style Switcher */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Compass className="text-[#C9952B]" size={20} />
            {chartHeading}
          </h3>
          <p className="text-xs text-muted-foreground">
            Authentic Vedic square chart powered by precision Lahiri Ephemeris
          </p>
        </div>

        {/* Style Switcher Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setChartStyle('south-indian')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              chartStyle === 'south-indian'
                ? 'gold-gradient-bg text-white shadow-md font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔲 South Indian (Square)
          </button>
          <button
            type="button"
            onClick={() => setChartStyle('north-indian')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              chartStyle === 'north-indian'
                ? 'gold-gradient-bg text-white shadow-md font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            💠 North Indian (Diamond)
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. SOUTH INDIAN SQUARE CHART (4x4 Grid - Matching User Image) */}
      {/* ============================================================ */}
      {chartStyle === 'south-indian' && (
        <div className="w-full max-w-[680px] mx-auto bg-gradient-to-br from-[#121217] to-[#0A0A0E] border-2 border-[#C9952B]/40 rounded-3xl p-3 sm:p-4 shadow-2xl relative overflow-hidden">
          {/* Subtle Sacred Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="text-[180px] font-serif text-[#C9952B]">ॐ</span>
          </div>

          <div className="grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2 aspect-square w-full">
            {/* The 12 Outer Perimeter Boxes */}
            {SOUTH_INDIAN_BOXES.map((box) => {
              const planets = planetsBySign[box.signIdx] || [];
              const isLagnaBox = box.signIdx === lagnaSignIdx;

              // Grid position styling
              const gridPosStyle = {
                gridRowStart: box.row,
                gridColumnStart: box.col,
              };

              return (
                <div
                  key={box.signName}
                  style={gridPosStyle}
                  className={`relative p-2 sm:p-2.5 rounded-2xl flex flex-col justify-between transition-all border ${
                    isLagnaBox
                      ? 'bg-[#C9952B]/15 border-[#C9952B] shadow-[0_0_15px_rgba(201,149,43,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-[#C9952B]/40'
                  }`}
                >
                  {/* Top: Sign Header */}
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[10px] sm:text-xs font-bold ${
                        isLagnaBox ? 'text-[#C9952B]' : 'text-muted-foreground'
                      }`}
                    >
                      {box.signName}{' '}
                      <span className="text-[9px] opacity-70">({box.signNumber})</span>
                    </span>

                    {/* Lagna Badge */}
                    {isLagnaBox && (
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#C9952B] text-black shadow-sm tracking-wider">
                        ASC
                      </span>
                    )}
                  </div>

                  {/* Middle / Bottom: Occupying Planets */}
                  <div className="flex flex-wrap gap-1 mt-1 content-end">
                    {planets.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/30 italic">Empty</span>
                    ) : (
                      planets.map((p, idx) => {
                        if (p.isLagna) {
                          return (
                            <span
                              key={idx}
                              className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-[#C9952B]/30 border border-[#C9952B] text-[#FBBF24]"
                            >
                              Lagna
                            </span>
                          );
                        }

                        const pStyle = getPlanetStyle(p.name);
                        const isExalted = p.status?.includes('Exalted');
                        const isOwn = p.status?.includes('Own');

                        return (
                          <span
                            key={idx}
                            title={`${p.name} ${p.degree || ''} (${p.status || ''})`}
                            className={`text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${pStyle.bg} ${pStyle.border} ${pStyle.text}`}
                          >
                            <span>{p.name}</span>
                            {p.degree && (
                              <span className="text-[8px] opacity-75 hidden sm:inline">
                                {p.degree.split(' ')[0]}
                              </span>
                            )}
                            {isExalted && (
                              <span className="text-[8px] font-bold text-amber-300 ml-0.5">↑</span>
                            )}
                            {isOwn && (
                              <span className="text-[8px] font-bold text-emerald-300 ml-0.5">★</span>
                            )}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

            {/* Center Information Box (Col 2-3, Row 2-3) */}
            <div
              style={{
                gridColumnStart: 2,
                gridColumnEnd: 4,
                gridRowStart: 2,
                gridRowEnd: 4,
              }}
              className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col justify-center items-center text-center bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-[#C9952B]/30 shadow-inner space-y-1.5 sm:space-y-2 z-10 backdrop-blur-sm"
            >
              <div className="w-8 h-8 rounded-full bg-[#C9952B]/20 border border-[#C9952B]/40 flex items-center justify-center text-[#C9952B] font-bold text-sm shadow-sm">
                ॐ
              </div>

              <div>
                <h4 className="font-extrabold text-xs sm:text-base text-foreground tracking-wide">
                  {devoteeName}
                </h4>
                <p className="text-[10px] sm:text-xs text-[#C9952B] font-semibold">
                  {isD1 ? 'D1 Rashi Chakra' : 'D9 Navamsha Chakra'}
                </p>
              </div>

              {(dob || tob || pob) && (
                <div className="text-[9px] sm:text-[11px] text-muted-foreground leading-tight space-y-0.5 pt-0.5">
                  <p>
                    {dob} {tob ? `• ${tob}` : ''}
                  </p>
                  {pob && <p className="truncate max-w-[180px] sm:max-w-[220px]">{pob}</p>}
                </div>
              )}

              <div className="pt-1 flex flex-wrap justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-foreground">
                  Lagna: <strong className="text-[#C9952B]">{RASHIS[lagnaSignIdx]?.name}</strong>
                </span>
                {chartData.moonSign && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-foreground">
                    Moon: <strong>{chartData.moonSign}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. NORTH INDIAN DIAMOND CHART (Traditional Sacred Geometry) */}
      {/* ============================================================ */}
      {chartStyle === 'north-indian' && (
        <div className="w-full max-w-[620px] mx-auto bg-gradient-to-br from-[#121217] to-[#0A0A0E] border-2 border-[#C9952B]/40 rounded-3xl p-3 sm:p-5 shadow-2xl relative">
          <div className="relative aspect-square w-full max-w-[560px] mx-auto">
            {/* SVG Diamond Grid */}
            <svg viewBox="0 0 400 400" className="w-full h-full stroke-[#C9952B]/60 fill-none stroke-[1.5]">
              {/* Outer boundary */}
              <rect x="10" y="10" width="380" height="380" className="stroke-[#C9952B]" strokeWidth="2" />
              {/* Diagonals */}
              <line x1="10" y1="10" x2="390" y2="390" />
              <line x1="390" y1="10" x2="10" y2="390" />
              {/* Inner Diamond */}
              <polygon points="200,10 390,200 200,390 10,200" className="stroke-[#C9952B]" strokeWidth="2" />
            </svg>

            {/* 12 House Overlays for North Indian Chart */}
            {[
              { houseNum: 1, pos: 'top-[16%] left-[50%] -translate-x-1/2 -translate-y-1/2', signIdx: lagnaSignIdx },
              { houseNum: 2, pos: 'top-[8%] left-[26%] -translate-x-1/2 -translate-y-1/2', signIdx: (lagnaSignIdx + 1) % 12 },
              { houseNum: 3, pos: 'top-[26%] left-[8%] -translate-x-1/2 -translate-y-1/2', signIdx: (lagnaSignIdx + 2) % 12 },
              { houseNum: 4, pos: 'top-[50%] left-[18%] -translate-x-1/2 -translate-y-1/2', signIdx: (lagnaSignIdx + 3) % 12 },
              { houseNum: 5, pos: 'bottom-[26%] left-[8%] -translate-x-1/2 translate-y-1/2', signIdx: (lagnaSignIdx + 4) % 12 },
              { houseNum: 6, pos: 'bottom-[8%] left-[26%] -translate-x-1/2 translate-y-1/2', signIdx: (lagnaSignIdx + 5) % 12 },
              { houseNum: 7, pos: 'bottom-[16%] left-[50%] -translate-x-1/2 translate-y-1/2', signIdx: (lagnaSignIdx + 6) % 12 },
              { houseNum: 8, pos: 'bottom-[8%] right-[26%] translate-x-1/2 translate-y-1/2', signIdx: (lagnaSignIdx + 7) % 12 },
              { houseNum: 9, pos: 'bottom-[26%] right-[8%] translate-x-1/2 translate-y-1/2', signIdx: (lagnaSignIdx + 8) % 12 },
              { houseNum: 10, pos: 'top-[50%] right-[18%] translate-x-1/2 -translate-y-1/2', signIdx: (lagnaSignIdx + 9) % 12 },
              { houseNum: 11, pos: 'top-[26%] right-[8%] translate-x-1/2 -translate-y-1/2', signIdx: (lagnaSignIdx + 10) % 12 },
              { houseNum: 12, pos: 'top-[8%] right-[26%] translate-x-1/2 -translate-y-1/2', signIdx: (lagnaSignIdx + 11) % 12 },
            ].map(({ houseNum, pos, signIdx }) => {
              const planets = planetsBySign[signIdx]?.filter((p) => !p.isLagna) || [];
              const signNumber = RASHIS[signIdx]?.signNumber || 1;

              return (
                <div
                  key={houseNum}
                  className={`absolute ${pos} flex flex-col items-center justify-center text-center pointer-events-auto p-1 max-w-[70px] sm:max-w-[90px]`}
                >
                  {/* Sign Number */}
                  <span className="text-[10px] sm:text-xs font-bold text-[#C9952B] leading-none mb-0.5">
                    {signNumber}
                  </span>

                  {/* House Label */}
                  <span className="text-[8px] text-muted-foreground/60 leading-none">H{houseNum}</span>

                  {/* Planets */}
                  <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                    {houseNum === 1 && (
                      <span className="text-[9px] font-extrabold px-1 rounded bg-[#C9952B] text-black">
                        Asc
                      </span>
                    )}
                    {planets.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] sm:text-[10px] font-bold text-foreground px-1 py-0.2 rounded bg-white/10"
                      >
                        {p.name.slice(0, 2)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-3 text-xs text-muted-foreground">
            North Indian Diamond format • 1st House (Lagna) is placed in top diamond
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9952B]" />
          <strong>Asc (Lagna)</strong>: Ascendant House
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-400 font-bold">↑</span> Exalted (Uccha)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-bold">★</span> Own Sign (Swakshetra)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-rose-400 font-bold">↓</span> Debilitated (Neecha)
        </span>
      </div>
    </div>
  );
}
