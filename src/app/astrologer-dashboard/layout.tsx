'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AstrologerSidebar from './components/AstrologerSidebar';
import { Loader2 } from 'lucide-react';

export default function AstrologerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      let verifiedSession: any = null;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('astro_verified_session');
        if (stored) {
          try {
            verifiedSession = JSON.parse(stored);
          } catch (e) {}
        }
      }

      if (!currentUser && (!verifiedSession || !verifiedSession.authenticated)) {
        router.push('/astrologer-login');
        return;
      }

      if (verifiedSession && verifiedSession.authenticated && verifiedSession.id) {
        setUser((currentUser || { uid: verifiedSession.id, email: verifiedSession.email || '', phoneNumber: verifiedSession.phone || '' }) as any);
        setLoading(false);
        return;
      }

      // Check if user is an approved astrologer in Firestore
      try {
        const docRef = doc(db, 'astrologers', currentUser!.uid);
        const docSnap = await getDoc(docRef);
        const validStatuses = ['approved', 'active', 'full_time', 'probation', 'verified'];
        if (docSnap.exists() && (validStatuses.includes(String(docSnap.data().status || '').toLowerCase()) || docSnap.data().isVerified)) {
          setUser(currentUser);
        } else {
          router.push('/astrologer-login');
        }
      } catch (error) {
        console.error('Error checking astrologer role:', error);
        router.push('/astrologer-login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
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
