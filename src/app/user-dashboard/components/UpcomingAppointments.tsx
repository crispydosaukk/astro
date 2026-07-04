'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, Clock, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const appointments = [
  {
    id: 'apt-001',
    astrologer: 'Pt. Rajendra Sharma',
    type: 'Video',
    date: 'Sun, 6 Jul',
    time: '3:00 PM IST',
    duration: '45 min',
    status: 'confirmed',
    avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=80&h=80&fit=crop',
  },
  {
    id: 'apt-002',
    astrologer: 'Jyotishi Meera Devi',
    type: 'Call',
    date: 'Wed, 9 Jul',
    time: '11:00 AM IST',
    duration: '30 min',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop',
  },
];

export default function UpcomingAppointments() {
  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Upcoming Consultations</h2>
        <Link href="/consultation-booking-screen" className="text-xs text-accent hover:underline flex items-center gap-1">
          Book New <ArrowRight size={10} />
        </Link>
      </div>
      <div className="p-5 space-y-4">
        {appointments?.map((apt, i) => (
          <motion.div
            key={apt?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
          >
            <AppImage
              src={apt?.avatar}
              alt={`${apt?.astrologer} - astrologer profile photo`}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground truncate">{apt?.astrologer}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${apt?.status === 'confirmed' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {apt?.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {apt?.type === 'Video' ? <Video size={10} /> : <Phone size={10} />} {apt?.type}
                </span>
                <span className="flex items-center gap-1"><Calendar size={10} /> {apt?.date}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {apt?.time}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {appointments?.length === 0 && (
          <div className="text-center py-6">
            <Calendar size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming consultations</p>
            <Link href="/consultation-booking-screen" className="text-xs text-accent hover:underline mt-1 inline-block">Book your first session</Link>
          </div>
        )}
      </div>
    </div>
  );
}