'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';
import { ScrollText, ShieldCheck, Scale, Building2, Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-8">
        <div className="text-center space-y-4 border-b border-[#E5D9C8] pb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient-bg text-white flex items-center justify-center mx-auto shadow-xl">
            <ScrollText size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292522]">Terms of Service</h1>
          <p className="text-sm text-[#6B5E55]">
            Effective Date: 14/08/2026 • Operator: VAYORIX PRIVATE LIMITED
          </p>
        </div>

        <div className="space-y-8 text-sm text-[#6B5E55] leading-relaxed bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-xl">
          {/* Main Terms */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#292522] flex items-center gap-2">
              <Scale size={20} className="text-[#713B32]" /> 1. Acceptance
            </h2>
            <p>
              These Terms govern your use of AstroParihar&apos;s website, applications, AI services,
              reports, consultations, marketplace, store and related services. By using
              AstroParihar, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Nature of Services</h2>
            <p>
              AstroParihar provides traditional Vedic astrology and related spiritual/remedial
              services for information, education and personal reflection. Astrology, reports and AI
              outputs are interpretive and do not guarantee future events. AstroParihar does not
              provide medical diagnosis/treatment, mental-health diagnosis, legal advice, regulated
              financial advice or emergency services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Accounts and Accuracy</h2>
            <p>
              You must provide accurate account and birth information and keep credentials secure.
              AstroParihar is not responsible for errors caused by inaccurate or uncertain birth
              data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. AstroParihar AI</h2>
            <p>
              AI-generated content may contain errors. Important decisions should be independently
              evaluated. Do not use AI or astrology as a substitute for regulated professional or
              emergency services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Astrologer Marketplace</h2>
            <p>
              Astrologers are independent practitioners unless a separate written agreement states
              otherwise. A “Verified” badge means AstroParihar completed its applicable verification
              process; it is not a guarantee that every prediction is accurate. AstroParihar may
              perform lawful quality and safety monitoring.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Astrologer Standards</h2>
            <p>
              Astrologers must provide truthful credentials, communicate respectfully, avoid
              guaranteed outcomes and fear-based sales, avoid unsafe medical/financial claims,
              protect confidentiality and recommend remedies responsibly. AstroParihar may suspend
              or remove non-compliant astrologers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Remedies</h2>
            <p>
              Remedies may include mantra, yantra, gemstones, rudraksha, homa, puja, devata upasana,
              dana, vrata and vastu practices. No remedy is guaranteed to produce a particular
              outcome. Gemstones should be treated as chart-specific traditional recommendations and
              not as guaranteed treatments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              8. Purchases and Intellectual Property
            </h2>
            <p>
              Prices and applicable terms are shown before payment. AstroParihar content, branding,
              software, reports, designs and original materials are protected by
              intellectual-property laws. Purchased reports are for personal use unless otherwise
              agreed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">9. Prohibited Use</h2>
            <p>
              No impersonation, fraud, hacking, scraping of protected systems, malicious code,
              harassment, rating manipulation, unlawful use or exploitation of users/astrologers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">10. Disclaimers and Liability</h2>
            <p>
              To the maximum extent permitted by law, AstroParihar does not guarantee uninterrupted
              availability, error-free operation or accuracy of every interpretation, AI output or
              user-generated statement. Nothing excludes liability that cannot lawfully be excluded,
              including liability for fraud or death/personal injury caused by negligence.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">11. Refunds</h2>
            <p>
              Refunds are governed by the separate Refund &amp; Cancellation Policy and mandatory
              consumer rights are not excluded.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">12. Suspension and Changes</h2>
            <p>
              We may suspend or terminate accounts for security, fraud, legal compliance, serious
              misconduct or material breach. We may update these Terms and will communicate material
              changes where required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">13. Governing Law</h2>
            <p>
              Subject to mandatory consumer protections applicable to you, these Terms are governed
              by the laws of England and Wales and disputes are subject to courts with appropriate
              jurisdiction.
            </p>
          </section>

          <hr className="border-border my-6" />

          {/* Independent Astrologer Section */}
          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-bold text-foreground text-gradient-gold">
              INDEPENDENT ASTROLOGER–USER RELATIONSHIP
            </h2>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">1. AstroParihar as a Platform</h3>
              <p>
                AstroParihar operates a technology platform that facilitates connections between
                users seeking astrology-related services and independent astrologers offering such
                services. Unless expressly stated otherwise in a separate written agreement,
                AstroParihar is not a party to the underlying professional consultation or personal
                relationship between the User and the Astrologer. The Astrologer and User enter into
                any consultation, communication or other arrangement with each other independently.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">2. Independent Professionals</h3>
              <p>
                Astrologers listed on AstroParihar are independent professionals and are responsible
                for their own professional conduct, representations and statements, astrological
                opinions, consultation methodology, recommendations, remedies, fees, tax
                obligations, and compliance with applicable law. A “Verified AstroParihar
                Astrologer” designation means only that the Astrologer has completed
                AstroParihar&apos;s applicable verification and onboarding process. It does not
                constitute a guarantee, warranty or certification of the accuracy of every
                statement, prediction, recommendation or outcome provided by that Astrologer.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">3. User Responsibility</h3>
              <p>
                Users are responsible for the accuracy of information they provide, their
                communications with Astrologers, decisions made based on consultations, and payments
                or arrangements made directly with Astrologers where applicable.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">4. Acts and Omissions</h3>
              <p>
                To the maximum extent permitted by applicable law, AstroParihar shall not be
                responsible for the independent acts, omissions, representations, advice, opinions,
                predictions, recommendations, promises, conduct or other actions of an Astrologer or
                User, except to the extent that such liability arises directly from
                AstroParihar&apos;s own breach of law, contractual obligations, negligence, fraud,
                or wilful misconduct.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">5. No Guarantee of Outcomes</h3>
              <p>
                AstroParihar does not guarantee the accuracy of an Astrologer&apos;s prediction, a
                particular future event, success of a remedy, improvement in financial or
                relationship circumstances, career success, health outcomes, or the outcome of a
                puja/homa. Astrology is interpretive and should not be treated as a guarantee of
                future events.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                6. Professional and Regulated Advice
              </h3>
              <p>
                Astrology services provided through AstroParihar are not a substitute for
                professional services. Users should obtain appropriate advice from qualified
                professionals for matters involving medical conditions, legal matters,
                investments/financial decisions, taxation, or emergencies.
              </p>
            </section>
          </div>

          <hr className="border-border my-6" />

          {/* Governing Law & Jurisdiction */}
          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-bold text-foreground text-gradient-gold">
              GOVERNING LAW AND JURISDICTION
            </h2>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">7. Indian Law</h3>
              <p>
                Subject to any mandatory consumer, data-protection or other rights that cannot
                lawfully be excluded or restricted, the use of the AstroParihar platform, the
                relationship between AstroParihar and its Users, and the relationship between
                AstroParihar and its participating Astrologers shall be governed by the laws of
                India.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                8. Astrologer and User Compliance
              </h3>
              <p>
                Astrologers and Users using AstroParihar from India agree that their activities and
                transactions conducted through the platform shall comply with applicable Indian laws
                and regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                9. Disputes Between Astrologer and User
              </h3>
              <p>
                Any dispute arising directly between an Astrologer and a User concerning a
                consultation, communication, representation, prediction, recommendation, payment or
                other independent arrangement shall primarily be a matter between the Astrologer and
                the User.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                10. Platform Role and Limited Responsibility
              </h3>
              <p>
                AstroParihar provides the technology, marketplace infrastructure, communication
                facilities, booking facilities and related services through which Users and
                Astrologers may connect. AstroParihar reserves the right to investigate complaints
                and take appropriate platform-level action, including warnings, suspension, removal
                or termination.
              </p>
            </section>
          </div>

          {/* Operator Footer Box */}
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Building2 size={16} className="text-[#C9952B]" /> VAYORIX PRIVATE LIMITED
            </div>
            <p>B Ff1/1, KK road, V Puram, Chennai-53</p>
            <p className="flex flex-wrap gap-4 pt-1">
              <span>
                Support:{' '}
                <a href="mailto:astroparihar06@gmail.com" className="text-[#C9952B] underline">
                  astroparihar06@gmail.com
                </a>
              </span>
              <span>
                Legal:{' '}
                <a href="mailto:astroparihar06@gmail.com" className="text-[#C9952B] underline">
                  astroparihar06@gmail.com
                </a>
              </span>
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
