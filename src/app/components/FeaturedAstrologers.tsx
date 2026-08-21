'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useCurrency } from '@/lib/CurrencyContext';

const fallbackFeaturedAstrologers = [
  {
    id: 'dr-anil-sharma',
    name: 'Dr. Anil Sharma',
    specialties: ['Vedic Astrology'],
    experience: '25+ Years Exp.',
    rating: 4.9,
    reviews: 1287,
    price: 25,
    languages: ['Hindi', 'English'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&h=600&fit=crop&crop=face',
    badge: 'VERIFIED',
  },
  {
    id: 'prof-meera-iyer',
    name: 'Prof. Meera Iyer',
    specialties: ['KP Astrology'],
    experience: '18+ Years Exp.',
    rating: 4.8,
    reviews: 956,
    price: 20,
    languages: ['English', 'Tamil', 'Hindi'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=face',
    badge: 'VERIFIED',
  },
  {
    id: 'acharya-r-vedant',
    name: 'Acharya R. Vedant',
    specialties: ['Vastu & Astrology'],
    experience: '20+ Years Exp.',
    rating: 4.9,
    reviews: 1103,
    price: 30,
    languages: ['Hindi', 'Sanskrit', 'English'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face',
    badge: 'VERIFIED',
  },
  {
    id: 'dr-kavya-nair',
    name: 'Dr. Kavya Nair',
    specialties: ['Vedic Astrology'],
    experience: '15+ Years Exp.',
    rating: 4.8,
    reviews: 789,
    price: 22,
    languages: ['Malayalam', 'English', 'Hindi'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=face',
    badge: 'VERIFIED',
  },
  {
    id: 'astro-rohit-verma',
    name: 'Astro Rohit Verma',
    specialties: ['Vedic & KP Astrology'],
    experience: '12+ Years Exp.',
    rating: 4.7,
    reviews: 654,
    price: 18,
    languages: ['Hindi', 'English'],
    status: 'online',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=face',
    badge: 'VERIFIED',
  },
];

export default function FeaturedAstrologers() {
  const [astrologers, setAstrologers] = useState<any[]>(fallbackFeaturedAstrologers);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const q = query(collection(db, 'astrologers'), where('status', '==', 'approved'), limit(5));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fetchedData = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const skillsList = data.skills
              ? data.skills.split(',').map((s: string) => s.trim())
              : ['Vedic Astrology'];
            return {
              id: docSnap.id,
              name: data.name || 'Pt. Astrologer',
              specialties: skillsList,
              experience: `${data.experienceYears || data.experience || 12}+ Years Exp.`,
              rating: Number(data.rating) || 4.9,
              reviews: Number(data.reviewsCount || data.reviews) || 2847,
              price: Number(data.amount) || 20,
              languages: data.languages ? data.languages.split(',').map((l: string) => l.trim()) : ['English', 'Hindi'],
              status: data.isOnline !== undefined ? (data.isOnline ? 'online' : 'offline') : 'online',
              image:
                data.profileImageUrl ||
                data.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'A')}&background=random`,
              badge: data.badge || 'VERIFIED',
            };
          });
          setAstrologers(fetchedData);
        } else {
          setAstrologers(fallbackFeaturedAstrologers);
        }
      } catch (error) {
        console.error('Failed to fetch featured astrologers:', error);
        setAstrologers(fallbackFeaturedAstrologers);
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologers();
  }, []);

  return (
    <section id="astrologers" className="py-8 bg-[#F8F3EA]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] mb-3">
              Verified Expert Astrologers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#292522]">
              Talk to India's <span className="text-gradient-gold">Best Astrologers</span>
            </h2>
            <p className="text-sm text-[#6B5E55] mt-1">
              Connect instantly for career, marriage, health, and life guidance.
            </p>
          </div>
          <Link
            href="/talk-to-astrologer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E5D9C8] hover:border-[#713B32] text-sm font-bold text-[#292522] hover:text-[#713B32] transition-all bg-[#FFFDFC] shadow-sm"
          >
            View All Astrologers <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="rounded-2xl p-4 h-80 animate-pulse bg-[#EDE4D5]/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {astrologers.map((ast, i) => (
              <motion.div
                key={ast.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#FFFDFC] rounded-2xl border border-[#E5D9C8] hover:border-[#B88A44] transition-all duration-300 shadow-sm hover:shadow-xl card-hover flex flex-col overflow-hidden group w-full"
              >
                {/* Profile Image (Complete Image Visible) */}
                <div className="relative w-full aspect-[4/3] bg-[#F8F3EA] p-2 overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      ast.image && typeof ast.image === 'string' && ast.image.trim() !== ''
                        ? ast.image
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name || 'Astrologer')}&background=713B32&color=fff&size=512`
                    }
                    alt={ast.name}
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name || 'Astrologer')}&background=713B32&color=fff&size=512`;
                    }}
                  />
                  {/* Verified Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-[#15803d] text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow-md flex items-center gap-1">
                    VERIFIED
                  </div>

                  {/* Online Status Pill */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold backdrop-blur-md ${
                        ast.status === 'online'
                          ? 'bg-black/60 text-green-400 border border-green-500/30'
                          : 'bg-black/60 text-gray-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          ast.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                        }`}
                      />
                      {ast.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Content Section (Centered, Clean & Balanced) */}
                <div className="p-3 sm:p-3.5 text-center flex-1 flex flex-col justify-between space-y-1.5">
                  <div className="space-y-1">
                    {/* Name */}
                    <h3 className="font-bold text-[#292522] text-sm leading-tight truncate capitalize">
                      {ast.name}
                    </h3>

                    {/* Specialty */}
                    <p className="text-[11px] text-[#6B5E55] font-medium truncate capitalize">
                      {Array.isArray(ast.specialties) ? ast.specialties.join(', ') : ast.specialties}
                    </p>

                    {/* Experience */}
                    <p className="text-[11px] text-[#6B5E55]/80">
                      {ast.experience}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#292522] pt-0.5">
                      <Star size={12} fill="#D8B66A" className="text-[#B88A44] flex-shrink-0" />
                      <span>{ast.rating}</span>
                      <span className="text-[#6B5E55] font-normal text-[11px]">
                        ({ast.reviews.toLocaleString()})
                      </span>
                    </div>

                    {/* Price & Languages */}
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B5E55] pt-1 border-t border-[#E5D9C8] mt-1">
                      <span className="font-bold text-[#713B32] text-xs tabular-nums">
                        {formatPrice(ast.price || 20)}/min
                      </span>
                      {ast.languages && ast.languages.length > 0 && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="truncate max-w-[90px]">{ast.languages.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Consult Now Button */}
                  <div className="pt-1.5">
                    <Link
                      href={`/astrologer/${ast.id}`}
                      className="w-full inline-flex items-center justify-center py-2 px-3 rounded-full font-bold text-[11px] sm:text-xs text-white uppercase tracking-wider bg-[#713B32] hover:bg-[#552B24] shadow-sm hover:shadow transition-all active:scale-[0.98]"
                    >
                      CONSULT NOW
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
