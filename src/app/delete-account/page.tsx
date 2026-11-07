'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';
import { Trash2, AlertTriangle, CheckCircle2, ShieldAlert, ArrowLeft, Phone, UserX } from 'lucide-react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [reason, setReason] = useState('No longer using the service');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered mobile number.' });
      return;
    }
    if (!confirmed) {
      setStatusMessage({ type: 'error', text: 'Please confirm that you understand this action is permanent.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Account associated with ${fullPhone} has been permanently deleted along with all Kundli charts and consultation data. This phone number cannot be used to log in.`,
        });
        setPhoneNumber('');
        setConfirmed(false);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to process account deletion request. Please try again or contact support.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Network error. Please try again or email astroparihar06@gmail.com directly.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#713B32] font-semibold hover:underline"
        >
          <ArrowLeft size={16} /> Back to AstroParihar
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-4 border-b border-[#E5D9C8] pb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-xl">
            <UserX size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#292522]">
            Delete AstroParihar Account & Data
          </h1>
          <p className="text-sm text-[#6B5E55] max-w-xl mx-auto">
            Official account and data deletion portal for the <strong>AstroParihar</strong> mobile application and website, operated by <strong>VAYORIX PRIVATE LIMITED</strong>.
          </p>
        </div>

        {/* Information Policy Box (Google Play Compliant) */}
        <div className="bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-lg space-y-6 text-sm text-[#6B5E55] leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-[#713B32] font-bold text-base">
              <ShieldAlert size={20} />
              <span>What Happens When You Delete Your Account</span>
            </div>
            <p>
              Under Google Play policies and global data privacy standards, you have the right to request permanent deletion of your account and all associated personal data stored by AstroParihar.
            </p>
          </section>

          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            <div className="bg-red-50/70 border border-red-200/60 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-red-900 flex items-center gap-2 text-sm">
                <Trash2 size={16} className="text-red-600" /> Data That is Permanently Deleted
              </h3>
              <ul className="text-xs text-red-800 space-y-1.5 list-disc pl-4">
                <li>Your profile details (Name, Gender, Contact number)</li>
                <li>All saved birth profiles (Family, Children, Partner)</li>
                <li>Calculated Janam Kundli charts and astrological reports</li>
                <li>AI Astrologer chat history and consultation notes</li>
                <li>Live Astrologer consultation logs and recordings</li>
                <li>Wallet balance, promo credits, and cached preferences</li>
              </ul>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-5 space-y-2">
              <h3 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                <AlertTriangle size={16} className="text-amber-600" /> Data Retention for Compliance
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                As required by applicable statutory taxation and financial regulations, transaction IDs and invoice records of payments made via Razorpay/Stripe are archived in read-only form for required statutory audit periods, completely unlinked from your astrological chart data.
              </p>
            </div>
          </div>

          <section className="space-y-2 pt-2">
            <h3 className="font-bold text-[#292522]">How to Delete Your Account</h3>
            <p>You can delete your account using either of the following two methods:</p>
            <ol className="list-decimal pl-5 space-y-1 text-xs sm:text-sm">
              <li>
                <strong>Inside the AstroParihar Mobile App</strong>: Open AstroParihar → Go to <strong>Profile</strong> → Tap <strong>Delete Account</strong> → Confirm with the confirmation prompt.
              </li>
              <li>
                <strong>Via this Web Form</strong>: Enter your registered mobile number below and confirm deletion.
              </li>
            </ol>
          </section>
        </div>

        {/* Interactive Web Deletion Form */}
        <div className="bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-xl">
          <h2 className="text-xl font-bold text-[#292522] mb-2 flex items-center gap-2">
            <Phone size={20} className="text-[#713B32]" /> Submit Deletion Request
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E55] mb-6">
            Enter the registered mobile phone number linked to your AstroParihar account.
          </p>

          {statusMessage && (
            <div
              className={`p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#713B32] uppercase tracking-wider mb-2">
                Registered Mobile Number *
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-[#FAF6F0] border border-[#E5D9C8] text-[#292522] rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#713B32]"
                >
                  <option value="+91">🇮🇳 India (+91)</option>
                  <option value="+44">🇬🇧 UK (+44)</option>
                  <option value="+1">🇺🇸 USA (+1)</option>
                  <option value="+971">🇦🇪 UAE (+971)</option>
                  <option value="+61">🇦🇺 Australia (+61)</option>
                  <option value="+65">🇸🇬 Singapore (+65)</option>
                  <option value="+977">🇳🇵 Nepal (+977)</option>
                </select>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 bg-[#FAF6F0] border border-[#E5D9C8] text-[#292522] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#713B32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#713B32] uppercase tracking-wider mb-2">
                Reason for Leaving (Optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-[#E5D9C8] text-[#292522] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#713B32]"
              >
                <option value="No longer using the service">No longer using the service</option>
                <option value="Privacy concerns">Privacy concerns</option>
                <option value="Created duplicate account">Created duplicate account</option>
                <option value="Other reasons">Other reasons</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#E5D9C8] text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-[#6B5E55] leading-snug">
                  I understand that this action is permanent. All my Kundli charts, consultations, and profile data will be permanently deleted and cannot be recovered.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={18} />
              {loading ? 'Processing Deletion...' : 'Permanently Delete My Account'}
            </button>
          </form>

          <p className="text-xs text-[#8C7A6B] text-center mt-6">
            Need manual assistance? Email our Data Privacy Officer at{' '}
            <a href="mailto:astroparihar06@gmail.com" className="text-[#713B32] underline font-semibold">
              astroparihar06@gmail.com
            </a>
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
