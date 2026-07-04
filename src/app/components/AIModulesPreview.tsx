'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, Music, Triangle, Flame, Heart, Gift, Moon, Compass, Lock, ArrowRight } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const modules = [
  { id: 'ai-gem', icon: Gem, title: 'Gemstone Advice', desc: 'Ruby for Sun strength', color: 'text-red-400', preview: 'Wear Ruby on Sunday', locked: false, href: '/services/gemstone' },
  { id: 'ai-mantra', icon: Music, title: 'Mantra Guidance', desc: 'Om Namah Shivaya', color: 'text-blue-400', preview: '108 times at dawn', locked: false, href: '/services/mantra' },
  { id: 'ai-yantra', icon: Triangle, title: 'Yantra Remedy', desc: 'Sri Yantra', color: 'text-green-400', preview: 'East wall placement', locked: true, href: '/services/yantra' },
  { id: 'ai-homam', icon: Flame, title: 'Homam Planner', desc: 'Navagraha Homam', color: 'text-orange-400', preview: 'Saturday morning', locked: true, href: '/services/homa' },
  { id: 'ai-ishta', icon: Heart, title: 'Ishta Devata', desc: 'Lord Vishnu', color: 'text-pink-400', preview: 'Daily puja guide', locked: true, href: '/services/ishta-devata' },
  { id: 'ai-charity', icon: Gift, title: 'Charity Planner', desc: 'Donate black sesame', color: 'text-violet-400', preview: 'Saturday donations', locked: true, href: '/services/charity' },
  { id: 'ai-fasting', icon: Moon, title: 'Fasting Planner', desc: 'Ekadashi fast', color: 'text-cyan-400', preview: 'Monthly calendar', locked: true, href: '/services/fasting' },
  { id: 'ai-muhurtha', icon: Compass, title: 'Muhurtham', desc: 'Marriage date finder', color: 'text-amber-400', preview: '12 auspicious dates', locked: true, href: '/services/muhurtham' },
];

export default function AIModulesPreview() {
  return (
    <section className="py-20 cosmic-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-[#8B1A2A]/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl" />
      </div>
      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-accent/30 text-accent mb-4">
            ✦ Vedic Insights
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Personal <span className="text-gradient-gold">Cosmic Guide</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            8 sacred remedy modules powered by Swiss Ephemeris — delivering precise Vedic guidance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules?.map((mod, i) => {
            const Icon = mod?.icon;
            return (
              <motion.div
                key={mod?.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-card rounded-2xl p-5 border border-white/10 card-hover group relative overflow-hidden"
              >
                {mod?.locked && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Lock size={24} className="text-[#C9952B]" />
                    <p className="text-sm font-semibold text-white text-center px-4">Premium Feature</p>
                    <Link href={mod?.href} className="px-4 py-2 rounded-xl text-xs font-semibold gold-gradient-bg text-white">
                      Learn More
                    </Link>
                  </div>
                )}
                <div className={`w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4 icon-hover-animate ${mod?.color}`}>
                  <Icon size={20} />
                </div>
                {mod?.locked && <Lock size={12} className="absolute top-4 right-4 text-white/40" />}
                <h3 className="font-semibold text-white text-sm mb-1">{mod?.title}</h3>
                <p className="text-xs text-white/50 mb-3">{mod?.desc}</p>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/70">{mod?.preview}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/ai-recommendations-screen" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow text-base">
            ✦ Explore All Remedies
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}