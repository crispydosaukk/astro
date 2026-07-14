'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Star, Clock, Calendar, Compass } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { getHomepageContent, HomepageContent, defaultHomepageContent } from '@/lib/cms';


export default function PanchangWidget() {
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);

  useEffect(() => {
    async function fetchContent() {
      const data = await getHomepageContent();
      setContent(data);
    }
    fetchContent();
  }, []);

  const panchangData = [
    { icon: Sun, label: 'Tithi', value: content.panchang.tithiValue, sub: content.panchang.tithiSub, color: 'text-amber-400' },
    { icon: Star, label: 'Nakshatra', value: content.panchang.nakshatraValue, sub: content.panchang.nakshatraSub, color: 'text-purple-400' },
    { icon: Compass, label: 'Yoga', value: content.panchang.yogaValue, sub: content.panchang.yogaSub, color: 'text-green-400' },
    { icon: Moon, label: 'Karana', value: content.panchang.karanaValue, sub: content.panchang.karanaSub, color: 'text-blue-400' },
    { icon: Calendar, label: 'Vara', value: content.panchang.varaValue, sub: content.panchang.varaSub, color: 'text-amber-400' },
    { icon: Clock, label: 'Rahu Kalam', value: content.panchang.rahuKalamValue, sub: content.panchang.rahuKalamSub, color: 'text-red-400' },
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Today&apos;s Panchang</h2>
            <p className="text-sm text-muted-foreground mt-1">{content.panchang.dateLabel}</p>
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