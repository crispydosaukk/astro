'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Moon, Check, ArrowRight, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import ServiceReportForm from '@/components/ServiceReportForm';
import DynamicPageContent from '@/components/DynamicPageContent';

const fastTypes = [
  {
    name: 'Ekadashi Fast',
    deity: 'Lord Vishnu',
    day: 'Bi-monthly (11th lunar day)',
    benefit: 'Removes sins, pleases Vishnu',
    food: 'Fruits, milk, sabudana',
  },
  {
    name: 'Monday Fast',
    deity: 'Lord Shiva',
    day: 'Every Monday',
    benefit: 'Fulfills wishes, marriage blessings',
    food: 'One meal, no salt',
  },
  {
    name: 'Saturday Fast',
    deity: 'Lord Shani',
    day: 'Every Saturday',
    benefit: 'Reduces Saturn afflictions',
    food: 'Black sesame, oil-free food',
  },
  {
    name: 'Navratri Fast',
    deity: 'Goddess Durga',
    day: '9 days twice yearly',
    benefit: 'Divine protection, prosperity',
    food: 'Fruits, sendha namak only',
  },
  {
    name: 'Pradosh Fast',
    deity: 'Lord Shiva',
    day: 'Bi-monthly (13th lunar day)',
    benefit: 'Removes obstacles, health',
    food: 'One meal after sunset',
  },
  {
    name: 'Purnima Fast',
    deity: 'Lord Vishnu/Moon',
    day: 'Full moon day monthly',
    benefit: 'Mental peace, prosperity',
    food: 'Fruits and milk only',
  },
];

const benefits = [
  'Aligns your fasting practice with your specific planetary needs',
  'Maximizes spiritual benefits through correct timing and deity',
  'Provides a personalized monthly fasting calendar',
  'Includes food guidelines specific to each fast type',
  'Sends reminders for upcoming fasting dates',
];

export default function FastingServicePage() {
  const content = {
    hero: {
      tag: "Vedic Wisdom",
      titleLine1: "Align With",
      titleLine2: "The Cosmos",
      description: "Discover the power of Vedic fasting tailored to your astrological chart. Enhance your spiritual journey, remove planetary afflictions, and bring harmony to your life.",
      primaryBtnText: "Get Fasting Plan",
      secondaryBtnText: "Consult Astrologer"
    }
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: 'How is my fasting schedule determined?',
      a: 'Based on your birth chart, we identify which planets need strengthening or pacifying. The fasting schedule is then aligned with those planetary deities and their auspicious days.',
    },
    {
      q: 'Can I fast if I have health conditions?',
      a: 'Yes, but always consult your doctor first. We provide modified fasting options that are spiritually effective while being gentle on the body.',
    },
    {
      q: 'What if I miss a fast?',
      a: 'Missing a fast occasionally is fine. Simply resume on the next occurrence. Consistency over time is more important than perfection.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/assets/images/remedies/remedies_banner_1785738389383.png"
            alt="Vedic Fasting Planner Background"
            fill
            className="object-cover object-center lg:object-right scale-100"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#170b16]/95 via-[#230f20]/85 to-[#170b16]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d1a] via-transparent to-[#150914]/50" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/30 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/20 blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 w-full">
            <div className="max-w-3xl space-y-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                <Link href="/" className="hover:text-[#F6D075] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/remedies" className="hover:text-[#F6D075] transition-colors">Remedies</Link>
                <span>/</span>
                <span className="text-[#F6D075] font-semibold">Vrata & Fasting Guide</span>
              </div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 shadow-xl shadow-black/20 backdrop-blur-md">
                  <Moon size={15} className="text-[#F6D075] animate-pulse" />
                  {content.hero.tag || 'Vedic Vrata Sadhana'}
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-lg">
                  {content.hero.titleLine1} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    {content.hero.titleLine2}
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  {content.hero.description}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-3"
              >
                <a
                  href="#get-report"
                  className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 text-sm sm:text-base cursor-pointer"
                >
                  <Moon size={18} />
                  <span>{content.hero.primaryBtnText || 'Get My Fasting Plan'}</span>
                </a>
                <Link
                  href="/talk-to-astrologer"
                  className="px-7 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-sm text-sm sm:text-base shadow-md cursor-pointer"
                >
                  {content.hero.secondaryBtnText || 'Consult Astrologer'}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-[#F8F3EA] text-[#292522]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <div className="bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-3">
                  Spiritual & Bio-Rhythmic Alignment
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#292522] mb-6">
                  Benefits of Vedic Fasting (Vrata)
                </h2>
                <div className="space-y-4">
                  {benefits?.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8]"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                        ✓
                      </div>
                      <p className="text-sm font-medium text-[#292522] leading-relaxed">{b}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#6B5E55] pt-4 border-t border-[#E5D9C8]">
                Fasting clears physical toxins (Ama) and balances planetary subtle energies across your bio-rhythm.
              </p>
            </div>

            <div className="bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-3">
                  Calendar Preview
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#292522] mb-4">Sample Monthly Fasting Schedule</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Jul 8', fast: 'Ekadashi Vrata', deity: 'Lord Vishnu', status: 'Optimal' },
                    { date: 'Jul 14', fast: 'Somvar Vrata', deity: 'Lord Shiva', status: 'Optimal' },
                    { date: 'Jul 21', fast: 'Pradosh Vrata', deity: 'Lord Shiva', status: 'Optimal' },
                  ]?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#281123] to-[#150914] text-[#F6D075] flex flex-col items-center justify-center text-xs font-bold shadow-sm">
                          <span>{item?.date.split(' ')[0]}</span>
                          <span className="text-sm font-extrabold">{item?.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#292522]">{item?.fast}</p>
                          <p className="text-xs text-[#713B32] font-semibold">{item?.deity}</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                        {item?.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5D9C8] flex items-center justify-between text-xs text-[#713B32] font-bold">
                <span className="flex items-center gap-1.5"><Lock size={14} /> Full individualized report generated below</span>
                <span>Tithi Precision</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Fasts */}
      <section className="pt-14 pb-8 lg:pt-16 lg:pb-10 bg-[#FFFDFC] border-t border-[#E5D9C8]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
              Vedic Vratas
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              Popular Vedic Fasts & Observances
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fastTypes?.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border border-[#E5D9C8] bg-[#F8F3EA] p-6 space-y-2 shadow-sm hover:shadow-md hover:border-[#B88A44] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] flex items-center justify-center text-lg font-bold text-[#713B32] shadow-sm">
                  <Moon size={20} className="text-[#B88A44]" />
                </div>
                <h3 className="font-bold text-[#292522] text-lg">{f?.name}</h3>
                <p className="text-xs font-bold text-[#713B32]">{f?.deity}</p>
                <p className="text-xs text-[#6B5E55]">📅 {f?.day}</p>
                <p className="text-xs text-[#6B5E55]">✨ {f?.benefit}</p>
                <p className="text-xs font-medium text-[#292522] pt-2 border-t border-[#E5D9C8]">🍎 {f?.food}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Educational Content */}
      <DynamicPageContent pageId="remedies-fasting" />

      <div id="get-report">
        <ServiceReportForm
          titleText="Get Your"
          highlightText="Fasting Plan"
          subtitle="Enter your birth details for a personalized fasting recommendation"
          buttonText="Unlock Full Fasting Plan"
          Icon={Moon}
          premiumInfo="Full fasting calendar with monthly reminders, food guides, and spiritual practices requires Premium membership"
        />
      </div>

      {/* FAQ */}
      <section className="py-16 bg-[#F8F3EA] border-t border-[#E5D9C8]">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
              Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs?.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-[#E5D9C8] bg-[#FFFDFC] shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F8F3EA] transition-colors"
                >
                  <span className="font-bold text-[#292522] text-sm sm:text-base">{faq?.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={18} className="text-[#713B32] shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-[#6B5E55] shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-1 border-t border-[#E5D9C8]/60">
                    <p className="text-sm text-[#6B5E55] leading-relaxed font-medium">{faq?.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
