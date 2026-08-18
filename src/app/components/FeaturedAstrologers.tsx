'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Video, Phone, Clock, ArrowRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export default function FeaturedAstrologers() {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const q = query(collection(db, 'astrologers'), where('status', '==', 'approved'), limit(4));
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const skillsList = data.skills
            ? data.skills.split(',').map((s: string) => s.trim())
            : ['Vedic Astrology'];
          return {
            id: docSnap.id,
            name: data.name || 'Pt. Astrologer',
            specialties: skillsList,
            experience: `${data.experienceYears || data.experience || 12} yrs experience`,
            rating: Number(data.rating) || 4.9,
            reviews: Number(data.reviewsCount || data.reviews) || 2847,
            price: Number(data.amount) || 20,
            languages: data.languages ? data.languages.split(',').map((l: string) => l.trim()) : ['English'],
            status: data.isOnline !== undefined ? (data.isOnline ? 'online' : 'offline') : 'online',
            image:
              data.profileImageUrl ||
              data.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'A')}&background=random`,
            badge: data.badge || 'Top Rated',
          };
        });
        setAstrologers(fetchedData);
      } catch (error) {
        console.error('Failed to fetch featured astrologers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologers();
  }, []);

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
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-3">
              Verified Expert Astrologers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Talk to India's <span className="text-gradient-gold">Best Astrologers</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect instantly for career, marriage, health, and life guidance.
            </p>
          </div>
          <Link
            href="/talk-to-astrologer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:border-[#C9952B]/50 text-sm font-semibold hover:text-[#C9952B] transition-all bg-card shadow-sm"
          >
            View All Astrologers <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass-card rounded-3xl p-6 h-72 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {astrologers.map((ast, i) => (
              <motion.div
                key={ast.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-light dark:glass-card rounded-3xl p-6 border border-white/10 hover:border-[#C9952B]/40 transition-all duration-300 card-hover flex flex-col justify-between"
              >
                <div>
                  {/* Top Avatar & Name Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <AppImage
                          src={ast.image}
                          alt={ast.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                            ast.status === 'online' ? 'bg-green-400' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-snug">{ast.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{ast.experience}</p>
                        <div className="flex items-center gap-1 text-xs text-[#C9952B] font-semibold mt-1">
                          <Star size={12} fill="currentColor" />
                          <span>{ast.rating}</span>
                          <span className="text-muted-foreground text-[10px]">
                            ({ast.reviews.toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </div>

                    {ast.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/30 flex-shrink-0">
                        {ast.badge}
                      </span>
                    )}
                  </div>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {ast.specialties.slice(0, 3).map((spec: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-foreground/80 border border-white/5 font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Rate & Languages */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mb-4 text-xs">
                    <span className="text-base font-bold text-[#C9952B] tabular-nums">
                      ₹{ast.price}/min
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {ast.languages.slice(0, 2).map((lang: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/astrologer/${ast.id}`}
                    className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-[#C9952B] bg-white/5 border border-white/10 hover:border-[#C9952B]/40 transition-colors"
                  >
                    View Full Profile →
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/astrologer/${ast.id}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <Video size={13} className="text-[#C9952B]" /> Video
                    </Link>
                    <Link
                      href={`/astrologer/${ast.id}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold gold-gradient-bg text-white hover:opacity-90 transition-opacity shadow-md shadow-[#C9952B]/20"
                    >
                      <Phone size={13} /> Call
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
