'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const plans = [
  {
    id: 'plan-free',
    name: 'Free',
    icon: Zap,
    price: '₹0',
    priceUSD: '$0',
    period: 'forever',
    description: 'Start your cosmic journey',
    color: 'border-border',
    badge: null,
    features: [
      'Basic Kundli Generation',
      'Daily Horoscope',
      'Today\'s Panchang',
      'Basic Gemstone Info',
      '1 Vedic Report/month',
      'Community Access',
    ],
    cta: 'Start Free',
    ctaClass: 'border border-border hover:border-accent/50 text-foreground hover:text-accent',
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    icon: Crown,
    price: '₹499',
    priceUSD: '$5.99',
    period: 'per month',
    description: 'Unlock your full cosmic potential',
    color: 'border-accent',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Unlimited Vedic Reports',
      'Gemstone + Mantra + Yantra',
      'Homam + Ishta Devata',
      'Unlimited Muhurtham',
      'Interactive Vastu',
      'Charity & Fasting Planner',
      '10% Consultation Discount',
      'Priority Support',
    ],
    cta: 'Get Premium',
    ctaClass: 'gold-gradient-bg text-white hover:opacity-90 gold-shadow',
  },
  {
    id: 'plan-cosmic',
    name: 'Cosmic',
    icon: Sparkles,
    price: '₹3,999',
    priceUSD: '$47.99',
    period: 'per year',
    description: 'Best value — save ₹2,000 / $24',
    color: 'border-secondary',
    badge: 'Best Value',
    features: [
      'Everything in Premium',
      '20% Consultation Discount',
      'Free Monthly Report PDF',
      'WhatsApp Reminders',
      'Early Access to Features',
      'Dedicated Support Manager',
      '2 Free Consultations/year',
      'Exclusive Webinars',
    ],
    cta: 'Get Cosmic',
    ctaClass: 'indigo-gradient-bg text-white hover:opacity-90 premium-shadow',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-4">
            Pricing Plans
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="text-gradient-gold">Cosmic Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans?.map((plan, i) => {
            const Icon = plan?.icon;
            return (
              <motion.div
                key={plan?.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 border-2 ${plan?.color} bg-card card-hover ${plan?.badge === 'Most Popular' ? 'scale-105 premium-shadow' : ''}`}
              >
                {plan?.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${plan?.badge === 'Most Popular' ? 'gold-gradient-bg text-white' : 'indigo-gradient-bg text-white'}`}>
                      {plan?.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center icon-hover-animate">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{plan?.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan?.description}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-4xl font-bold text-foreground tabular-nums">{plan?.priceUSD}</span>
                    <span className="text-sm text-muted-foreground">/ {plan?.period}</span>
                  </div>
                  {plan?.price !== '₹0' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Also available at <span className="font-semibold text-foreground">{plan?.price}</span> INR
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan?.features?.map((feature) => (
                    <li key={`feat-${plan?.id}-${feature?.slice(0, 20)}`} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check size={14} className="text-accent mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up-login-screen" className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${plan?.ctaClass}`}>
                  {plan?.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}