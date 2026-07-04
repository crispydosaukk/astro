'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Star, Clock, Calendar, Compass } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const panchangData = [
  { icon: Sun, label: 'Tithi', value: 'Shukla Saptami', sub: 'Ends 11:45 PM', color: 'text-amber-400' },
  { icon: Star, label: 'Nakshatra', value: 'Punarvasu', sub: 'Until 08:30 PM', color: 'text-purple-400' },
  { icon: Compass, label: 'Yoga', value: 'Siddha Yoga', sub: 'Auspicious', color: 'text-green-400' },
  { icon: Moon, label: 'Karana', value: 'Bava', sub: 'Till 12:30 PM', color: 'text-blue-400' },
  { icon: Calendar, label: 'Vara', value: 'Guruvar', sub: 'Thursday', color: 'text-amber-400' },
  { icon: Clock, label: 'Rahu Kalam', value: '01:30 – 03:00 PM', sub: 'Avoid this time', color: 'text-red-400' },
];

export default function PanchangWidget() {
  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Today&apos;s Panchang</h2>
            <p className="text-sm text-muted-foreground mt-1">Thursday, 3 July 2026 · Ashadha Shukla Saptami · IST</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">Live Update</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {panchangData?.map((item, i) => {
            const Icon = item?.icon;
            return (
              <motion.div
                key={`panchang-${item?.label}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-light dark:glass-card rounded-2xl p-4 border border-border card-hover"
              >
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 icon-hover-animate ${item?.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-xs font-500 text-muted-foreground uppercase tracking-wide mb-1">{item?.label}</div>
                <div className="text-sm font-semibold text-foreground">{item?.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item?.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}