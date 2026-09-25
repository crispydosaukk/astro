import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, MapPin, Building2 } from 'lucide-react';

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
    { label: 'AiASTRO Platform', href: '/aiastro' },
  ],
  Astrologers: [
    { label: 'Astrologer Login', href: '/astrologer-login' },
    { label: 'Astrologer Registration', href: '/apply' },
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
    <footer className="bg-[#FFFDFC] border-t border-[#E5D9C8] text-[#292522]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <AppLogo src="/astrologo.png" size={68} />
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed max-w-sm">
              India&apos;s most advanced premium Vedic astrology platform. Ancient wisdom, modern
              technology, personalized for you.
            </p>

            <div className="space-y-3 pt-1 text-xs text-[#6B5E55]">
              {/* Head Office */}
              <div className="rounded-xl p-3 bg-[#FAF6F0] border border-[#EFE5D8] space-y-1.5 shadow-[0_2px_8px_rgba(41,37,34,0.02)]">
                <div className="flex items-center gap-1.5 font-bold text-[#713B32] text-[11px] uppercase tracking-wider">
                  <Building2 size={13} className="shrink-0 text-[#713B32]" />
                  <span>Head Office</span>
                </div>
                <div>
                  <div className="font-bold text-[#292522] text-[13px]">Vooty Ltd</div>
                  <div className="text-[11px] text-[#6B5E55] mt-0.5">
                    <span className="text-[#8C7A6B]">Company Number:</span>{' '}
                    <span className="font-medium text-[#292522]">11632049</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#6B5E55]">
                  <MapPin size={13} className="text-[#713B32] shrink-0 mt-0.5" />
                  <span>No 1 Sedgecombe Avenue, Kenton, Harrow, HA3 0HW</span>
                </div>
              </div>

              {/* India Office */}
              <div className="space-y-1 px-1">
                <div className="text-[10.5px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
                  India Office
                </div>
                <div className="font-bold text-[#292522]">VAYORIX PRIVATE LIMITED</div>
                <div className="flex items-start gap-2 text-[11.5px] leading-relaxed">
                  <MapPin size={13} className="text-[#713B32] shrink-0 mt-0.5" />
                  <span>B Ff1/1, KK road, V Puram, Chennai-53</span>
                </div>
              </div>

              {/* Contact Email */}
              <div className="flex items-center gap-2 px-1 pt-0.5 text-[11.5px]">
                <Mail size={13} className="text-[#713B32] shrink-0" />
                <a
                  href="mailto:astroparihar06@gmail.com"
                  className="hover:text-[#713B32] transition-colors"
                >
                  astroparihar06@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks)?.map(([category, links]) => (
            <div key={`footer-${category}`}>
              <h4 className="font-bold text-[#292522] mb-4 text-sm">{category}</h4>
              <ul className="space-y-2.5">
                {links?.map((link) => (
                  <li key={`footer-link-${link?.label}`}>
                    <Link
                      href={link?.href}
                      className="text-xs text-[#6B5E55] hover:text-[#713B32] font-medium transition-colors"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E5D9C8] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6B5E55]">
          <div>
            <p>
              © 2026 AstroParihar. Head Office: Vooty Ltd (Company No. 11632049) • Operated by VAYORIX PRIVATE LIMITED. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-[#713B32] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#713B32] transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-[#713B32] transition-colors">
              Refund Policy
            </Link>
            <Link href="/cookies" className="hover:text-[#713B32] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
