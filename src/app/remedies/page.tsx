'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Music, Triangle, Flame, Heart, Moon, Compass, Gift, CircleDot } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';

const remediesList = [
  {
    id: 'svc-gemstone',
    title: 'Gemstone Advice',
    description: 'Personalized gemstone recommendations based on your planetary analysis and birth chart to strengthen weak planets.',
    image: '/assets/images/remedies/remedies_gemstone_1785738400359.png',
    href: '/remedies/gemstone',
    icon: Gem,
    color: 'text-amber-400',
  },
  {
    id: 'svc-mantra',
    title: 'Mantra Guidance',
    description: 'Sacred mantras tailored to strengthen your weak planets and amplify positive energies through sound vibration.',
    image: '/assets/images/remedies/remedies_mantra_1785738410624.png',
    href: '/remedies/mantra',
    icon: Music,
    color: 'text-blue-400',
  },
  {
    id: 'svc-yantra',
    title: 'Yantra Recommendations',
    description: 'Sacred geometric tools for specific planetary remedies and energy balancing in your home and life.',
    image: '/assets/images/remedies/remedies_yantra_1785738431966.png',
    href: '/remedies/yantra',
    icon: Triangle,
    color: 'text-green-400',
  },
  {
    id: 'svc-homam',
    title: 'Homam & Puja',
    description: 'Recommended fire rituals and pujas for planetary appeasement, spiritual growth, and divine blessings.',
    image: '/assets/images/remedies/remedies_homam_1785738443734.png',
    href: '/remedies/homa',
    icon: Flame,
    color: 'text-orange-400',
  },
  {
    id: 'svc-ishta',
    title: 'Ishta Devata',
    description: 'Discover your personal deity and daily worship practices tailored to your spiritual journey and birth chart.',
    image: '/assets/images/remedies/remedies_ishta_1785738453810.png',
    href: '/remedies/ishta-devata',
    icon: Heart,
    color: 'text-pink-400',
  },
  {
    id: 'svc-muhurtha',
    title: 'Muhurtham Generator',
    description: 'Find the most auspicious time for marriage, business, travel, and other major life events using Vedic astrology.',
    image: '/assets/images/remedies/remedies_muhurtham_1785738473891.png',
    href: '/remedies/muhurtham',
    icon: Moon,
    color: 'text-violet-400',
  },
  {
    id: 'svc-vastu',
    title: 'Interactive Vastu',
    description: 'Room-by-room Vastu analysis with practical remedies to enhance the positive energy of your home and workplace.',
    image: '/assets/images/remedies/remedies_vastu_1785738485180.png',
    href: '/remedies/vastu',
    icon: Compass,
    color: 'text-teal-400',
  },
  {
    id: 'svc-charity',
    title: 'Charity Planner',
    description: 'Karma-aligned giving schedule based on your planetary positions and doshas to clear karmic debts.',
    image: '/assets/images/remedies/remedies_charity_1785738494717.png',
    href: '/remedies/charity',
    icon: Gift,
    color: 'text-purple-400',
  },
  {
    id: 'svc-rudraksha',
    title: 'Rudraksha Recommendations',
    description: 'Sacred beads to shield against negative energies and harmonize your planetary doshas effectively.',
    image: '/assets/images/remedies/remedies_homam_1785738443734.png', // Reusing homam image as placeholder
    href: '/remedies/rudraksha',
    icon: CircleDot,
    color: 'text-orange-400',
  },
];

export default function RemediesPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/remedies/remedies_banner_1785738389383.png"
            alt="Vedic Remedies Banner"
            fill
            className="object-cover opacity-30 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        
        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
              Complete Vedic Healing
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Transform Your Life With <br />
              <span className="text-gradient-gold">Sacred Remedies</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our 9 powerful Vedic remedy modules designed to balance planetary energies, remove obstacles, and propel your spiritual and material growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Remedies Grid Section */}
      <section className="py-20 lg:py-28 bg-background relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {remediesList.map((remedy, index) => {
              const Icon = remedy.icon;
              return (
                <motion.div
                  key={remedy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative flex flex-col glass-card border border-white/5 rounded-3xl overflow-hidden hover:border-[#C9952B]/30 transition-all duration-500"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    <Image
                      src={remedy.image}
                      alt={remedy.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  </div>
                  
                  <div className="flex flex-col flex-grow p-6 relative -mt-10">
                    <div className={`w-12 h-12 rounded-2xl bg-card border border-white/10 flex items-center justify-center shadow-xl mb-4 z-10 ${remedy.color}`}>
                      <Icon size={22} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-[#C9952B] transition-colors">
                      {remedy.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">
                      {remedy.description}
                    </p>
                    
                    <Link
                      href={remedy.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors mt-auto"
                    >
                      Explore Remedy <ArrowRight size={16} className="text-[#C9952B] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
