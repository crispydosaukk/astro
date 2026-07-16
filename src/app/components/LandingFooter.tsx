import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, Phone, MapPin, PlayCircle, Share2, MessageCircle, AtSign } from 'lucide-react';

const footerLinks = {
  Services: [
    { label: 'Kundli Generation', href: '/ai-recommendations-screen' },
    { label: 'AI Gemstone', href: '/ai-recommendations-screen' },
    { label: 'Consultation', href: '/consultation-booking-screen' },
    { label: 'Muhurtham', href: '/ai-recommendations-screen' },
    { label: 'Vastu Analysis', href: '/ai-recommendations-screen' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Astrologers: [
    { label: 'Astrologer Login', href: '/astrologer-login' },
    { label: 'Astrologer Registration', href: '/astrologer-login?mode=signup' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Refund Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AppLogo src="/AstroParihar_Top_Logo.jpg" size={36} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              India&apos;s most advanced AI-powered Vedic astrology platform. Ancient wisdom, modern technology, personalized for you.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail size={14} /> support@astroparihar.com</div>
              <div className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><MapPin size={14} /> Bengaluru, Karnataka, India</div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks)?.map(([category, links]) => (
            <div key={`footer-${category}`}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links?.map((link) => (
                  <li key={`footer-link-${link?.label}`}>
                    <Link href={link?.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 AstroParihar. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Share2, AtSign, MessageCircle, PlayCircle]?.map((IconComp, i) => (
              <button key={`social-${i}`} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all icon-hover-animate">
                <IconComp size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}