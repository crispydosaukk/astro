'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Eye } from 'lucide-react';
import Link from 'next/link';

const planets = [
  { id: 'sun', name: 'Sun (Surya)', position: 'Mithuna 15°22\'', house: '1st', status: 'Strong', statusColor: 'text-green-400' },
  { id: 'moon', name: 'Moon (Chandra)', position: 'Karka 28°45\'', house: '2nd', status: 'Strong', statusColor: 'text-green-400' },
  { id: 'mars', name: 'Mars (Mangal)', position: 'Simha 7°12\'', house: '3rd', status: 'Average', statusColor: 'text-amber-400' },
  { id: 'mercury', name: 'Mercury (Budha)', position: 'Mithuna 22°33\'', house: '1st', status: 'Strong', statusColor: 'text-green-400' },
  { id: 'jupiter', name: 'Jupiter (Guru)', position: 'Vrishabha 4°55\'', house: '12th', status: 'Weak', statusColor: 'text-red-400' },
  { id: 'venus', name: 'Venus (Shukra)', position: 'Karka 19°08\'', house: '2nd', status: 'Average', statusColor: 'text-amber-400' },
  { id: 'saturn', name: 'Saturn (Shani)', position: 'Kumbha 11°40\'', house: '9th', status: 'Strong', statusColor: 'text-green-400' },
  { id: 'rahu', name: 'Rahu', position: 'Mesha 2°18\'', house: '11th', status: 'Average', statusColor: 'text-amber-400' },
  { id: 'ketu', name: 'Ketu', position: 'Tula 2°18\'', house: '5th', status: 'Average', statusColor: 'text-amber-400' },
];

export default function KundliSummary() {
  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Kundli Summary</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Arjun Sharma · 15 Mar 1992, 06:30 AM · Mumbai</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-muted transition-all icon-hover-animate" title="Download Kundli PDF">
            <Download size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted transition-all icon-hover-animate" title="Share Kundli">
            <Share2 size={16} className="text-muted-foreground" />
          </button>
          <Link href="/ai-recommendations-screen" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold gold-gradient-bg text-white">
            <Eye size={12} /> Full Analysis
          </Link>
        </div>
      </div>
      {/* Key details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
        {[
          { label: 'Lagna', value: 'Mithuna', sub: 'Gemini Ascendant' },
          { label: 'Rashi', value: 'Karka ♋', sub: 'Moon Sign' },
          { label: 'Nakshatra', value: 'Punarvasu', sub: 'Pada 4' },
          { label: 'Dasha', value: 'Rahu-Jupiter', sub: 'Until 2027' },
        ]?.map((item) => (
          <div key={`kundli-${item?.label}`} className="bg-card p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">{item?.label}</div>
            <div className="text-sm font-bold text-foreground">{item?.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item?.sub}</div>
          </div>
        ))}
      </div>
      {/* Planetary table */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Planetary Positions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-500 text-muted-foreground uppercase tracking-wide">Planet</th>
                <th className="text-left py-2 text-xs font-500 text-muted-foreground uppercase tracking-wide">Position</th>
                <th className="text-left py-2 text-xs font-500 text-muted-foreground uppercase tracking-wide">House</th>
                <th className="text-left py-2 text-xs font-500 text-muted-foreground uppercase tracking-wide">Strength</th>
              </tr>
            </thead>
            <tbody>
              {planets?.map((planet, i) => (
                <motion.tr
                  key={planet?.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-2.5 font-medium text-foreground">{planet?.name}</td>
                  <td className="py-2.5 text-muted-foreground font-mono text-xs">{planet?.position}</td>
                  <td className="py-2.5 text-muted-foreground">{planet?.house}</td>
                  <td className="py-2.5">
                    <span className={`text-xs font-semibold ${planet?.statusColor}`}>{planet?.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}