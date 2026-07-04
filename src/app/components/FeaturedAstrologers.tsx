'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Video, Phone, Clock, ArrowRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

const astrologers = [
  {
    id: 'ast-001',
    name: 'Pt. Rajendra Sharma',
    specialty: 'Vedic & KP Astrology',
    experience: '18 yrs',
    rating: 4.9,
    reviews: 2847,
    price: '₹25/min',
    languages: ['Hindi', 'English'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&h=200&fit=crop',
    badge: 'Top Rated',
  },
  {
    id: 'ast-002',
    name: 'Jyotishi Meera Devi',
    specialty: 'Nadi & Tamil Astrology',
    experience: '22 yrs',
    rating: 4.8,
    reviews: 3124,
    price: '₹30/min',
    languages: ['Tamil', 'English'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    badge: 'Expert',
  },
  {
    id: 'ast-003',
    name: 'Acharya Vikram Joshi',
    specialty: 'Lal Kitab & Vastu',
    experience: '15 yrs',
    rating: 4.7,
    reviews: 1893,
    price: '₹20/min',
    languages: ['Hindi', 'Gujarati'],
    status: 'busy',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    badge: null,
  },
  {
    id: 'ast-004',
    name: 'Dr. Priya Nair',
    specialty: 'Numerology & Tarot',
    experience: '10 yrs',
    rating: 4.8,
    reviews: 1567,
    price: '₹18/min',
    languages: ['Malayalam', 'English'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    badge: 'Rising Star',
  },
];

export default function FeaturedAstrologers() {
  return (
    <section id="astrologers" className="py-20 bg-muted/20">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 mb-3">
              Expert Astrologers
            </span>
            <h2 className="text-4xl font-bold text-foreground">
              Talk to the <span className="text-gradient-gold">Best</span>
            </h2>
            <p className="text-muted-foreground mt-2">Verified experts with thousands of consultations</p>
          </div>
          <Link href="/consultation-booking-screen" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:border-accent/50 text-sm font-medium hover:text-accent transition-all">
            View All <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {astrologers?.map((ast, i) => (
            <motion.div
              key={ast?.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-light dark:glass-card rounded-2xl p-5 border border-border card-hover group"
            >
              {/* Avatar + status */}
              <div className="relative mb-4">
                <AppImage
                  src={ast?.image}
                  alt={`${ast?.name} - professional astrologer specializing in ${ast?.specialty}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${ast?.status === 'online' ? 'bg-green-400' : 'bg-amber-400'}`} />
                {ast?.badge && (
                  <span className="absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full font-semibold bg-accent text-accent-foreground">
                    {ast?.badge}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-foreground text-sm mb-0.5">{ast?.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{ast?.specialty}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {ast?.experience}
                </span>
                <span className="flex items-center gap-1 text-accent">
                  <Star size={10} fill="currentColor" /> {ast?.rating} ({ast?.reviews?.toLocaleString()})
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {ast?.languages?.map((lang) => (
                  <span key={`lang-${ast?.id}-${lang}`} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-accent tabular-nums">{ast?.price}</span>
                <span className={`text-xs font-medium ${ast?.status === 'online' ? 'text-green-400' : 'text-amber-400'}`}>
                  {ast?.status === 'online' ? '● Online' : '● Busy'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/consultation-booking-screen" className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all">
                  <Video size={12} /> Video
                </Link>
                <Link href="/consultation-booking-screen" className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all">
                  <Phone size={12} /> Call
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}