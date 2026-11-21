'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AstrologerSidebar from './components/AstrologerSidebar';
import { Loader2, ShieldAlert, Ban, Mail, LogOut } from 'lucide-react';

interface BlockedState {
  type: 'suspended' | 'deactivated';
  reason: string;
  name?: string;
}

export default function AstrologerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [blockedState, setBlockedState] = useState<BlockedState | null>(null);
  const router = useRouter();

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      let verifiedSession: any = null;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('astro_verified_session');
        if (stored) {
          try {
            verifiedSession = JSON.parse(stored);
          } catch {}
        }
      }

      const activeId = verifiedSession?.authenticated && verifiedSession?.id
        ? String(verifiedSession.id)
        : currentUser?.uid || '';

      if (!activeId) {
        setLoading(false);
        router.push('/astrologer-login');
        return;
      }

      // Real-time Firestore listener: instantly locks dashboard if Admin suspends or deactivates!
      const docRef = doc(db, 'astrologers', activeId);
      unsubDoc = onSnapshot(
        docRef,
        async (docSnap) => {
          if (!docSnap.exists()) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('astro_verified_session');
            }
            setUser(null);
            setLoading(false);
            router.push('/astrologer-login');
            return;
          }

          const data = docSnap.data() || {};
          const status = String(data.status || '').toLowerCase().trim();
          const isSuspended = Boolean(data.isSuspended || status === 'suspended');
          const isDeactivated = Boolean(
            data.isActive === false ||
              data.dashboardDisabled === true ||
              status === 'deactivated' ||
              status === 'inactive' ||
              status === 'blocked'
          );

          if (isSuspended || isDeactivated) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('astro_verified_session');
            }
            try {
              await signOut(auth);
            } catch {}
            setUser(null);
            setBlockedState({
              type: isSuspended ? 'suspended' : 'deactivated',
              reason:
                String(data.suspensionReason || '').trim() ||
                (isSuspended
                  ? 'Your astrologer account has been suspended by the administrator.'
                  : 'Your astrologer account has been deactivated by the administrator.'),
              name: data.name || '',
            });
            setLoading(false);
            return;
          }

          const validStatuses = ['approved', 'active', 'full_time', 'full-time active', 'probation', 'verified'];
          if (validStatuses.includes(status) || data.isVerified || data.isFullTimeApproved) {
            setBlockedState(null);
            setUser(
              (currentUser || {
                uid: activeId,
                email: verifiedSession?.email || data.email || '',
                phoneNumber: verifiedSession?.phone || data.phone || '',
              }) as any
            );
          } else {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('astro_verified_session');
            }
            setUser(null);
            router.push('/astrologer-login');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error watching astrologer status:', error);
          setLoading(false);
          router.push('/astrologer-login');
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubDoc) unsubDoc();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (blockedState) {
    const isSuspended = blockedState.type === 'suspended';
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-card border-2 border-red-500/35 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 mx-auto">
            {isSuspended ? <Ban size={38} /> : <ShieldAlert size={38} />}
          </div>
          <div className="space-y-2">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/15 text-red-600 border border-red-500/30">
              {isSuspended ? 'Account Suspended' : 'Account Deactivated'}
            </span>
            <h1 className="text-2xl font-extrabold text-foreground">
              Astrologer Dashboard Access Disabled
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {blockedState.reason}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              You have been signed out automatically and your profile is hidden from the customer app and website until reactivated by an administrator.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="mailto:astropariharuk@gmail.com?subject=Astrologer%20Account%20Suspension%20Support"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-all"
            >
              <Mail size={15} />
              Contact Admin Support
            </a>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('astro_verified_session');
                }
                router.push('/astrologer-login');
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-bold inline-flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={15} />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AstrologerSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">{children}</main>
    </div>
  );
}
