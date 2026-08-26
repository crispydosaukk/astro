'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Gem, Check, ArrowRight, ChevronDown, ChevronUp, Lock, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ServiceReportForm from '@/components/ServiceReportForm';
import PremiumSection from '@/components/PremiumSection';
import DynamicPageContent from '@/components/DynamicPageContent';
import {
  getServicePageContent,
  GemstoneServiceContent,
  defaultGemstoneContent,
  getHomepageContent,
  HomepageContent,
} from '@/lib/cms';

export default function GemstoneServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [content, setContent] = useState<GemstoneServiceContent | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [data, homeData] = await Promise.all([
        getServicePageContent('gemstone', defaultGemstoneContent),
        getHomepageContent(),
      ]);
      setHomepageContent(homeData);
      setContent(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/assets/images/remedies/remedies_gemstone_1785738400359.png"
            alt="Gemstone Advice Background"
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
                <Link href="/" className="hover:text-[#F6D075] transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/remedies" className="hover:text-[#F6D075] transition-colors">
                  Remedies
                </Link>
                <span>/</span>
                <span className="text-[#F6D075] font-semibold">Gemstone Advice</span>
              </div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 shadow-xl shadow-black/20 backdrop-blur-md">
                  <Gem size={15} className="text-[#F6D075] animate-pulse" />
                  {content.hero.tag || 'Sacred Gemstone Therapy'}
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
                  <Gem size={18} />
                  <span>{content.hero.primaryBtnText || 'Get My Gemstone Report'}</span>
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
                  Therapeutic Benefits
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#292522] mb-6">
                  {content.benefitsTitle || 'How Gemstones Channel Planetary Power'}
                </h2>
                <div className="space-y-4">
                  {content.benefits.map((b, i) => (
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
                Only natural, unheated, certified gemstones produce measurable cosmic radiation
                benefits.
              </p>
            </div>

            <div className="bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-3">
                  Navaratna Quick Grid
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#292522] mb-4">
                  9 Sacred Planetary Jewels
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {content.gemstones.slice(0, 6).map((g, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 bg-[#F8F3EA] border border-[#E5D9C8] text-center space-y-1 shadow-sm"
                    >
                      <div className="text-2xl mb-1">💎</div>
                      <p className="text-xs font-bold text-[#292522]">{g?.planet}</p>
                      <p className="text-[11px] font-semibold text-[#713B32]">
                        {g?.gem?.split(' ')?.[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#281123] to-[#150914] text-white border border-[#B88A44]/40 space-y-1 text-center shadow-md">
                <p className="text-xs text-[#F6D075] font-bold uppercase tracking-wider">
                  Exact Carat Weight & Activation Day
                </p>
                <p className="text-xs text-white/80">
                  Calculated specifically for your Lagna and 9th House lord in your full report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gemstone Table */}
      <section className="pt-14 pb-8 lg:pt-16 lg:pb-10 bg-[#FFFDFC] border-t border-[#E5D9C8]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
              Prescription Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              {content.chartTitle || 'Navaratna Astrological Chart'}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5D9C8] shadow-md">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#EDE4D5] border-b border-[#E5D9C8] text-xs font-bold text-[#713B32] uppercase">
                  <th className="px-5 py-4">Planet</th>
                  <th className="px-5 py-4">Primary Gemstone</th>
                  <th className="px-5 py-4">Ideal Metal</th>
                  <th className="px-5 py-4">Wearing Finger</th>
                  <th className="px-5 py-4">Auspicious Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D9C8]">
                {content.gemstones.map((g, i) => (
                  <tr key={i} className="hover:bg-[#F8F3EA] transition-colors">
                    <td className="px-5 py-4 font-bold text-[#713B32]">{g?.planet}</td>
                    <td className="px-5 py-4 text-xs sm:text-sm font-bold text-[#292522]">
                      {g?.gem}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-[#6B5E55]">{g?.metal}</td>
                    <td className="px-5 py-4 text-xs text-[#6B5E55]">{g?.finger}</td>
                    <td className="px-5 py-4 text-xs text-[#6B5E55]">{g?.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dynamic Content */}
      <DynamicPageContent pageId="remedies-gemstone" />

      <PremiumSection data={content.premiumDetails} />

      <div id="get-report">
        <ServiceReportForm
          titleText="Get Your"
          highlightText="Gemstone Recommendation"
          subtitle="Enter your birth details to receive a precise gemstone recommendation"
          buttonText="Unlock Full Report — Upgrade to Premium"
          Icon={Gem}
          serviceId="svc-gemstone"
          premiumInfo="Full gemstone analysis with metal, finger, mantra, and precautions requires Premium membership"
        />
      </div>

      {/* FAQs Section */}
      <section className="py-16 lg:py-20 bg-[#F8F3EA] border-t border-[#E5D9C8]">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              {content.faqTitle || 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-3">
            {content.faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#E5D9C8] bg-[#FFFDFC] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F8F3EA] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-[#292522] text-sm sm:text-base">{faq?.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={18} className="text-[#B88A44] shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-[#6B5E55] shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-xs sm:text-sm text-[#6B5E55] leading-relaxed border-t border-[#E5D9C8]">
                    {faq?.a}
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
