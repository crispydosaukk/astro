'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, DollarSign, Activity } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const rashis = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const rashiSymbols: Record<string, string> = { Mesha: '♈', Vrishabha: '♉', Mithuna: '♊', Karka: '♋', Simha: '♌', Kanya: '♍', Tula: '♎', Vrishchika: '♏', Dhanu: '♐', Makara: '♑', Kumbha: '♒', Meena: '♓' };

const horoscopeData = {
  overall: 4,
  love: 3,
  career: 5,
  finance: 3,
  health: 4,
  prediction: "Jupiter\'s favorable aspect on your 10th house brings excellent opportunities in career today. A long-awaited recognition or promotion may come your way. In relationships, Venus in your 7th house suggests a warm and romantic evening with your partner. Financially, avoid impulsive purchases — wait until Saturday for major transactions. Health is good but avoid spicy food.",
  luckyNumber: 7,
  luckyColor: 'Golden Yellow',
  luckyTime: '11:00 AM – 1:00 PM',
  favourable: 'Career, Networking, Travel',
  unfavourable: 'Financial speculation, Arguments',
};

export default function DailyHoroscope() {
  const [selectedRashi, setSelectedRashi] = useState('Mithuna');

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Daily Horoscope</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live · 3 Jul 2026
          </div>
        </div>

        {/* Rashi selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {rashis.map((rashi) => (
            <button
              key={`rashi-${rashi}`}
              onClick={() => setSelectedRashi(rashi)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedRashi === rashi ? 'gold-gradient-bg text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <span className="text-base">{rashiSymbols[rashi]}</span>
              {rashi}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gold-gradient-bg flex items-center justify-center text-3xl shadow-lg">
            {rashiSymbols[selectedRashi]}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{selectedRashi}</h3>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={`overall-star-${i}`} className={`w-3 h-3 rounded-full ${i < horoscopeData.overall ? 'bg-accent' : 'bg-muted'}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-2">Overall {horoscopeData.overall}/5</span>
            </div>
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: Heart, label: 'Love', score: horoscopeData.love, color: 'bg-pink-500' },
            { icon: Briefcase, label: 'Career', score: horoscopeData.career, color: 'bg-blue-500' },
            { icon: DollarSign, label: 'Finance', score: horoscopeData.finance, color: 'bg-green-500' },
            { icon: Activity, label: 'Health', score: horoscopeData.health, color: 'bg-amber-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={`score-${item.label}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.score}/5</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.score / 5) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{horoscopeData.prediction}</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Lucky Number', value: horoscopeData.luckyNumber.toString() },
            { label: 'Lucky Color', value: horoscopeData.luckyColor },
            { label: 'Lucky Time', value: horoscopeData.luckyTime },
          ].map((item) => (
            <div key={`lucky-${item.label}`} className="rounded-xl bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}