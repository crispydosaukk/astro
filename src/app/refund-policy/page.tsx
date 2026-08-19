'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';
import { RefreshCw, ShieldCheck, Building2, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-8">
        <div className="text-center space-y-4 border-b border-[#E5D9C8] pb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient-bg text-white flex items-center justify-center mx-auto shadow-xl">
            <RefreshCw size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292522]">Refund &amp; Cancellation Policy</h1>
          <p className="text-sm text-[#6B5E55]">
            Effective Date: 14/08/2026 • Operator: VAYORIX PRIVATE LIMITED
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#6B5E55] leading-relaxed bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-xl">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. General</h2>
            <p>
              AstroParihar aims to deliver the service purchased. Refunds are handled fairly and in accordance with applicable consumer law. Nothing here removes mandatory statutory rights.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Consultations</h2>
            <p>
              Before a consultation starts, cancellation may be requested through support subject to the booking terms. Once a personalised consultation has substantially started, refunds may be limited subject to applicable law. Quality-related complaints may be reviewed where the astrologer did not attend, the service was materially incomplete, a substantial technical failure prevented delivery, or serious inappropriate conduct occurred. A refund is not normally available solely because a customer disagrees with a prediction or expected future outcome. Astrology is interpretive.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Technical Problems</h2>
            <p>
              For material technical failures, AstroParihar may offer reconnection/rescheduling, replacement service, partial refund or full refund depending on circumstances.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Reports</h2>
            <p>
              Before personalised report preparation begins, cancellation may be possible. Once work has entered production, cancellation/refund may be restricted because work has been performed, subject to mandatory rights. If AstroParihar cannot deliver a report because of its own failure, a replacement or refund may be offered.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">5. Digital Products</h2>
            <p>
              Where digital content is supplied immediately, any legally required acknowledgement concerning loss of a cancellation right will be obtained before immediate delivery.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">6. Physical Products</h2>
            <p>
              Returns and refunds for physical goods follow applicable consumer law and the terms displayed at checkout. Defective or incorrect goods should be reported promptly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">7. Puja, Homa and Other Scheduled Services</h2>
            <p>
              Cancellation terms will be displayed before payment where practicable. Once third-party arrangements are committed or a service has begun, cancellation may be restricted subject to applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">8. Duplicate/Unauthorised Payments</h2>
            <p>
              Contact astroparihar06@gmail.com promptly with the transaction reference. We will investigate.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">9. Refund Method</h2>
            <p>
              Approved refunds are normally returned to the original payment method unless applicable law or the payment provider requires another permitted method.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">10. How to Request</h2>
            <p>
              Email astroparihar06@gmail.com with order/booking ID, purchase date, service, reason and supporting evidence. For consultation-quality complaints, relevant consultation records may be reviewed where lawful and necessary.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">11. Fraud and Abuse</h2>
            <p>
              Refunds may be restricted for fraud, repeated abusive claims, payment manipulation or chargeback abuse, subject to applicable law.
            </p>
          </section>

          {/* Operator Footer Box */}
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Building2 size={16} className="text-[#C9952B]" /> VAYORIX PRIVATE LIMITED
            </div>
            <p className="flex flex-wrap gap-4 pt-1">
              <span>Support: <a href="mailto:astroparihar06@gmail.com" className="text-[#C9952B] underline">astroparihar06@gmail.com</a></span>
              <span>Legal: <a href="mailto:astroparihar06@gmail.com" className="text-[#C9952B] underline">astroparihar06@gmail.com</a></span>
            </p>
          </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
