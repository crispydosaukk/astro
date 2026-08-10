'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function CallPage() {
  const { roomID } = useParams();
  const { user, userData, loading } = useUserData();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [initFailed, setInitFailed] = useState(false);
  const [durationLimit, setDurationLimit] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);
  const [isCustomerRole, setIsCustomerRole] = useState(false);

  useEffect(() => {
    let zp: any = null;

    const initZego = async () => {
      // Remove !userData from the early return, as astrologers won't have it
      if (!user || !containerRef.current || !roomID) return;

      try {
        // Dynamically import Zego to avoid SSR issues
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

        // Fetch consultation to get duration
        const q = query(collection(db, 'consultations'), where('roomID', '==', roomID));
        const querySnapshot = await getDocs(q);
        
        let fetchedDuration = 5; // default 5 mins
        let consultationId: string | null = null;
        let isCustomer = false;

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docData = doc.data();
          consultationId = doc.id;
          isCustomer = user.uid === docData.customerId;
          if (docData.duration) fetchedDuration = docData.duration;
        }
        setDurationLimit(fetchedDuration);
        setActiveConsultationId(consultationId);
        setIsCustomerRole(isCustomer);

        // Using placeholder AppID and ServerSecret if env vars are not set
        const appID = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID 
          ? parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID)
          : 123456789; // PLACEHOLDER
        
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET 
          || "PLACEHOLDER_SECRET";

        // Add a random string to userID so you can test in multiple tabs with the same logged-in account
        const uniqueUserID = `${user.uid}_${Math.floor(Math.random() * 10000)}`;
        
        // Fallback for name if userData is null (e.g. for astrologers)
        const userName = userData?.name || user.displayName || user.email || 'User';

        // Generate Kit Token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID as string,
          uniqueUserID,
          userName
        );

        // Create instance object from kit token
        zp = ZegoUIKitPrebuilt.create(kitToken);
        
        // Check if the user is an astrologer based on path or role (fallback to one-on-one layout)
        const isAstrologer = window.location.href.includes('astrologer') || userData?.role === 'astrologer';

        // Join room
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 call
          },
          showScreenSharingButton: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showPreJoinView: true,
          onJoinRoom: async () => {
             setIsJoined(true);
             if (fetchedDuration) {
               setTimeLeft(fetchedDuration * 60);
             }

             if (isCustomer && consultationId) {
               try {
                 await fetch('/api/start-call-billing', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ consultationId })
                 });
               } catch (error) {
                 console.error('Error starting billing:', error);
               }
             }
          },
          onLeaveRoom: async () => {
            try {
              // Find the consultation record by roomID and mark it as completed
              const q = query(collection(db, 'consultations'), where('roomID', '==', roomID));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const docRef = doc(db, 'consultations', querySnapshot.docs[0].id);
                await updateDoc(docRef, { status: 'completed' });
                console.log("Consultation marked as completed in database.");
              }
            } catch (error) {
              console.error('Failed to update consultation status:', error);
            }

            // Redirect after leaving
            if (isAstrologer) {
              router.push('/astrologer-dashboard');
            } else {
              router.push('/'); // Redirect customers to home instead of user-dashboard
            }
          },
        });
      } catch (error) {
        console.error("ZegoCloud Initialization Error:", error);
        setInitFailed(true);
      }
    };

    if (!loading && user) {
      initZego();
    }

    return () => {
      if (zp) {
        zp.destroy();
      }
    };
  }, [roomID, user, userData, loading, router]);

  // Timer and billing logic
  useEffect(() => {
    if (!isJoined || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      alert("Time limit completed. Your wallet amount for this session is exhausted.");
      router.push('/');
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    // Track total seconds in call to trigger billing every 60s
    let secondsElapsed = 0;
    const billingTimer = setInterval(async () => {
      secondsElapsed += 1;
      
      // We only deduct if it's the customer and 60 seconds have passed
      if (isCustomerRole && activeConsultationId && secondsElapsed % 60 === 0) {
        try {
          const res = await fetch('/api/deduct-minute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consultationId: activeConsultationId })
          });
          
          if (res.status === 402) {
            // Insufficient balance, force disconnect
            setTimeLeft(0);
          }
        } catch (e) {
          console.error("Failed to deduct minute", e);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(billingTimer);
    };
  }, [timeLeft, isJoined, router, isCustomerRole, activeConsultationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B] mb-4" size={48} />
        <p className="text-muted-foreground">Preparing your secure session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Please log in to join the call.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-[#C9952B]">Return Home</button>
      </div>
    );
  }

  if (initFailed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/20 max-w-md">
          <h2 className="font-bold text-xl mb-2">Connection Error</h2>
          <p className="text-sm opacity-80 mb-4">Could not initialize the secure connection. Please make sure the ZegoCloud API keys are configured properly.</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden flex flex-col relative">
      {isJoined && timeLeft !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-xl flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
           <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
             {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
             {(timeLeft % 60).toString().padStart(2, '0')}
           </span>
           <span className="text-white/70 text-xs">Remaining</span>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full flex-1"
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
}
