'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';
import { Lock, ShieldCheck, Building2, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-8">
        <div className="text-center space-y-4 border-b border-border pb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient-bg text-white flex items-center justify-center mx-auto shadow-xl">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: 14/08/2026 • Operator: VAYORIX PRIVATE LIMITED • Privacy Contact: astroparihar06@gmail.com
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed glass-card p-8 sm:p-10 rounded-3xl border border-white/10">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Scope</h2>
            <p>
              This Privacy Policy explains how AstroParihar collects, uses, stores and shares personal information when you visit the website, create an account, use AstroParihar AI, request a horoscope/report, book an astrologer, purchase a product or remedy, enrol as an astrologer, or contact support. AstroParihar provides traditional Vedic astrology, consultations, reports, educational content and related remedial services. Astrology is interpretive and is not medical, psychological, legal or financial advice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
            <p>
              We may collect account/contact details; birth date, birth time and birthplace for personalised astrology; consultation messages, notes and feedback; booking and transaction information; technical information such as IP address, device/browser information and cookie identifiers; and, for astrologer applicants, identity/credential information, qualifications, assessment answers, interview responses and quality scores. Users may voluntarily disclose sensitive information such as health, relationship or financial circumstances during a consultation. We process such information only where legally permitted and necessary for the requested service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. How We Use Information</h2>
            <p>
              We use information to provide services; calculate or display charts through approved astrology calculation systems; operate AstroParihar AI; match users with astrologers; process bookings and payments; provide support; verify astrologers; conduct quality and safety audits; prevent fraud; improve services; send service communications; send marketing where permitted; and comply with law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Lawful Basis</h2>
            <p>
              Where UK GDPR applies, processing may rely on contract, legal obligation, legitimate interests, consent or another lawful basis permitted by law. For users in India and other jurisdictions, we apply the privacy and consent requirements applicable to the relevant processing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. AstroParihar AI</h2>
            <p>
              AstroParihar AI may process birth data, chart information, questions and conversation content to provide requested guidance. AI output may be inaccurate. It is not a substitute for a doctor, psychologist, lawyer, regulated financial adviser or emergency service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Sharing</h2>
            <p>
              We may use payment processors, hosting/cloud providers, security providers, astrology calculation/API providers, AI/technology providers, communications providers, identity/document verification providers, professional advisers, and verified astrologers where necessary to deliver a requested consultation. We may disclose information to regulators or authorities where legally required. We do not sell personal information for money.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">7. International Transfers</h2>
            <p>
              Some service providers may operate outside your country. Where required, we use appropriate legal transfer mechanisms and safeguards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">8. Retention and Security</h2>
            <p>
              We retain information only as long as reasonably necessary for the stated purposes, legal obligations, accounting, fraud prevention and dispute resolution. We use appropriate technical and organisational security measures, but no online system can guarantee absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">9. Your Rights</h2>
            <p>
              Depending on applicable law, you may have rights to access, correct, delete, restrict, object, port data, withdraw consent and object to certain marketing or automated processing. Contact astroparihar06@gmail.com.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">10. Marketing</h2>
            <p>
              You may unsubscribe from promotional communications at any time. Essential service messages may still be sent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">11. Children</h2>
            <p>
              AstroParihar is not intended to collect children&apos;s personal information without the safeguards required by applicable law. Certain services may be restricted to adults.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">12. Complaints</h2>
            <p>
              Contact astroparihar06@gmail.com first. Where applicable, you may also complain to the data protection regulator in your jurisdiction, including the UK Information Commissioner&apos;s Office for UK users.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">13. Changes and Contact</h2>
            <p>
              We may update this policy from time to time.
            </p>
          </section>

          {/* Operator Footer Box */}
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Building2 size={16} className="text-[#C9952B]" /> VAYORIX PRIVATE LIMITED
            </div>
            <p>B Ff1/1, KK road, V Puram, Chennai-53</p>
            <p className="flex flex-wrap gap-4 pt-1">
              <span>Privacy: <a href="mailto:astroparihar06@gmail.com" className="text-[#C9952B] underline">astroparihar06@gmail.com</a></span>
              <span>Support: <a href="mailto:astroparihar06@gmail.com" className="text-[#C9952B] underline">astroparihar06@gmail.com</a></span>
            </p>
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
