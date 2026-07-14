'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, Music, Triangle, Flame, Heart, Moon, Compass, ArrowRight, Gift } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { getHomepageContent, HomepageContent, defaultHomepageContent } from '@/lib/cms';

const iconMap: Record<string, any> = {
  Gem, Music, Triangle, Flame, Heart, Moon, Compass, Gift
};


const services = [
  {
    id: 'svc-gemstone',
    icon: Gem,
    title: 'Gemstone Advice',
    description: 'Personalized gemstone recommendations based on your planetary analysis and birth chart',
    color: 'from-amber-500/15 to-yellow-500/10',
    iconColor: 'text-amber-400',
    href: '/services/gemstone',
    badge: 'Premium',
  },
  {
    id: 'svc-mantra',
    icon: Music,
    title: 'Mantra Guidance',
    description: 'Sacred mantras tailored to strengthen your weak planets and amplify positive energies',
    color: 'from-blue-500/15 to-cyan-500/10',
    iconColor: 'text-blue-400',
    href: '/services/mantra',
    badge: 'Premium',
  },
  {
    id: 'svc-yantra',
    icon: Triangle,
    title: 'Yantra Recommendations',
    description: 'Sacred geometric tools for specific planetary remedies and energy balancing',
    color: 'from-green-500/15 to-emerald-500/10',
    iconColor: 'text-green-400',
    href: '/services/yantra',
    badge: 'Premium',
  },
  {
    id: 'svc-homam',
    icon: Flame,
    title: 'Homam & Puja',
    description: 'Recommended fire rituals and pujas for planetary appeasement and divine blessings',
    color: 'from-orange-500/15 to-red-500/10',
    iconColor: 'text-orange-400',
    href: '/services/homa',
    badge: 'Premium',
  },
  {
    id: 'svc-ishta',
    icon: Heart,
    title: 'Ishta Devata',
    description: 'Discover your personal deity and daily worship practices for spiritual growth',
    color: 'from-pink-500/15 to-rose-500/10',
    iconColor: 'text-pink-400',
    href: '/services/ishta-devata',
    badge: 'Premium',
  },
  {
    id: 'svc-muhurtha',
    icon: Moon,
    title: 'Muhurtham Generator',
    description: 'Find the most auspicious time for marriage, business, travel and more',
    color: 'from-violet-500/15 to-purple-500/10',
    iconColor: 'text-violet-400',
    href: '/services/muhurtham',
    badge: 'Premium',
  },
  {
    id: 'svc-vastu',
    icon: Compass,
    title: 'Interactive Vastu',
    description: 'Room-by-room Vastu analysis with remedies for every direction of your home',
    color: 'from-teal-500/15 to-cyan-500/10',
    iconColor: 'text-teal-400',
    href: '/services/vastu',
    badge: 'Premium',
  },
  {
    id: 'svc-charity',
    icon: Gift,
    title: 'Charity Planner',
    description: 'Karma-aligned giving schedule based on your planetary positions and doshas',
    color: 'from-purple-500/15 to-indigo-500/10',
    iconColor: 'text-purple-400',
    href: '/services/charity',
    badge: 'Premium',
  },
];

export default function ServicesSection({ content }: { content: HomepageContent['services'] }) {

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-4">
            {content.tagline}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {content.title} <span className="text-gradient-gold">{content.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.items.map((service, i) => {
            const Icon = iconMap[service.icon] || Gem; // Fallback to Gem if not found
            return (
              <motion.div
                key={service?.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative group rounded-2xl p-6 bg-gradient-to-br ${service?.color} border border-border card-hover cursor-pointer`}
              >
                <Link href={service?.href}>
                  <div className={`w-12 h-12 rounded-xl bg-card/80 flex items-center justify-center mb-4 icon-hover-animate ${service?.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground">{service?.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-[#C9952B]/20 text-[#C9952B]">
                      {service?.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service?.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#C9952B] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight size={12} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}