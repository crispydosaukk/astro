'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';
import { Cookie, ShieldCheck, Building2, Mail } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-8">
        <div className="text-center space-y-4 border-b border-border pb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient-bg text-white flex items-center justify-center mx-auto shadow-xl">
            <Cookie size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Cookie &amp; Tracking Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: 14/08/2026 • Operator: VAYORIX PRIVATE LIMITED
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed glass-card p-8 sm:p-10 rounded-3xl border border-white/10">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. What Are Cookies?</h2>
            <p>
              Cookies and similar technologies are stored on or accessed from your device when you use AstroParihar. Similar technologies can include pixels, tags, local storage and scripts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Categories</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Strictly necessary:</strong> login, authentication, security, session management, checkout, consent preferences and core functionality.</li>
              <li><strong className="text-foreground">Preferences:</strong> language, region and interface choices.</li>
              <li><strong className="text-foreground">Analytics:</strong> website performance, traffic and feature usage.</li>
              <li><strong className="text-foreground">Marketing:</strong> campaign measurement and advertising personalisation where legally permitted and consent is required.</li>
              <li><strong className="text-foreground">AI/personalisation:</strong> session context or preferences needed for requested AI features.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Consent</h2>
            <p>
              For UK users, non-essential cookies and similar technologies will be controlled through an appropriate consent mechanism where required. The banner should provide: Accept All | Reject Non-Essential | Manage Preferences. Non-essential cookies should not be set before required consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Third Parties</h2>
            <p>
              Payment, analytics, security, customer-support, AI, advertising and other providers may use their own technologies subject to their policies and applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Cookie Preference Centre</h2>
            <p>
              A persistent Cookie Settings link should allow users to revisit choices. Where appropriate, previously stored non-essential cookies should be deleted or disabled when consent is withdrawn.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Production Cookie Inventory</h2>
            <p>
              Before publication, AstroParihar must maintain an actual inventory of every cookie/technology, provider, first/third party status, purpose, category, duration, data collected and consent requirement. Do not publish invented cookie names.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">7. Browser Controls</h2>
            <p>
              You can also manage cookies through your browser. Blocking essential cookies may affect functionality.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">8. Changes and Contact</h2>
            <p>
              We may update this policy when our technology or legal requirements change.
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
