import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, Phone, MapPin, PlayCircle, Share2, MessageCircle, AtSign } from 'lucide-react';

const footerLinks = {
  Services: [
    { label: 'Kundli Generation', href: '/#services' },
    { label: 'Gemstone Recommendation', href: '/#services' },
    { label: 'Consultation', href: '/consultation-booking-screen' },
    { label: 'Muhurtham', href: '/#services' },
    { label: 'Vastu Analysis', href: '/#services' },
  ],
  Company: [
    { label: 'About Us', href: '/' },
    { label: 'Blog', href: '/' },
    { label: 'Careers', href: '/' },
    { label: 'Admin Panel', href: '/admin-panel' },
  ],
  Astrologers: [
    { label: 'Astrologer Login', href: '/astrologer-login' },
    { label: 'Astrologer Registration', href: '/astrologer-login?mode=signup' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { label: 'Cookie & Tracking Policy', href: '/cookies' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <AppLogo src="/AstroParihar_Top_Logo.jpg" size={36} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              India&apos;s most advanced premium Vedic astrology platform. Ancient wisdom, modern
              technology, personalized for you.
            </p>
            
            <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
              <div className="font-semibold text-foreground">VAYORIX PRIVATE LIMITED</div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-[#C9952B]" /> B Ff1/1, KK road, V Puram, Chennai-53
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#C9952B]" /> astroparihar06@gmail.com
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks)?.map(([category, links]) => (
            <div key={`footer-${category}`}>
              <h4 className="font-semibold text-foreground mb-4 text-sm">{category}</h4>
              <ul className="space-y-2.5">
                {links?.map((link) => (
                  <li key={`footer-link-${link?.label}`}>
                    <Link
                      href={link?.href}
                      className="text-xs text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            <p>© 2026 AstroParihar. Operated by VAYORIX PRIVATE LIMITED. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-accent transition-colors">Refund Policy</Link>
            <Link href="/cookies" className="hover:text-accent transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
