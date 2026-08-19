'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { Loader2, FileText, User, X, Eye, Calendar, Sparkles, ShieldCheck, ChevronRight, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, getDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { getSettings } from '@/lib/settings';

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

  // In-Call Customer Profile & Reports State (For Astrologers)
  const [targetCustomerId, setTargetCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [customerReports, setCustomerReports] = useState<any[]>([]);
  const [loadingCustomerReports, setLoadingCustomerReports] = useState(false);
  const [showReportsDrawer, setShowReportsDrawer] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Real-time listener for consultation status changes (e.g. if ended by recipient)
  useEffect(() => {
    if (!roomID || !user) return;
    const q = query(collection(db, 'consultations'), where('roomID', '==', roomID));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        if (docData.status === 'completed' || docData.status === 'cancelled' || docData.status === 'declined') {
          console.log("Consultation status changed to ended in database.");
          const isAstrologer = window.location.href.includes('astrologer') || userData?.role === 'astrologer';
          router.push(isAstrologer ? '/astrologer-dashboard' : '/');
        }
      }
    });
    return () => unsubscribe();
  }, [roomID, user, router, userData]);

  useEffect(() => {
    let zp: any = null;

    const initZego = async () => {
      // Remove !userData from the early return, as astrologers won't have it
      if (!user || !containerRef.current || !roomID) return;

      try {
        // Dynamically import Zego to avoid SSR issues
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

        // Fetch consultation to get duration and customer ID
        const q = query(collection(db, 'consultations'), where('roomID', '==', roomID));
        const querySnapshot = await getDocs(q);
        
        let fetchedDuration = 5; // default 5 mins
        let consultationId: string | null = null;
        let isCustomer = false;
        let isAudioCall = false;
        let cId: string | null = null;

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          consultationId = querySnapshot.docs[0].id;
          isCustomer = user.uid === docData.customerId;
          cId = docData.customerId || null;
          if (docData.duration) fetchedDuration = docData.duration;
          if (docData.type === 'call' || docData.type === 'audio') {
            isAudioCall = true;
          }

          // If consultation has already ended, do not join
          if (docData.status === 'completed' || docData.status === 'cancelled' || docData.status === 'declined') {
            alert('This consultation call has already ended.');
            const isAstrologer = window.location.href.includes('astrologer') || userData?.role === 'astrologer';
            router.push(isAstrologer ? '/astrologer-dashboard' : '/');
            return;
          }
        }
        setDurationLimit(fetchedDuration);
        setActiveConsultationId(consultationId);
        setIsCustomerRole(isCustomer);
        setTargetCustomerId(cId);

        // Fetch dynamic platform settings for ZegoCloud credentials if env vars are missing
        const dbSettings = await getSettings();
        const rawAppId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID || dbSettings?.zegoAppId;
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET || dbSettings?.zegoServerSecret;

        if (!rawAppId || !serverSecret || rawAppId === '123456789' || serverSecret === 'PLACEHOLDER_SECRET') {
          console.error("ZegoCloud credentials missing or invalid placeholder.");
          setInitFailed(true);
          return;
        }

        const appID = parseInt(rawAppId.toString());

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
          turnOnCameraWhenJoining: !isAudioCall,
          showMyCameraToggleButton: !isAudioCall,
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

  // Fetch Customer Profile & Reports for Astrologer during active call
  const fetchCustomerData = async (cId: string) => {
    setLoadingCustomerReports(true);
    try {
      // 1. Fetch User Profile
      const userRef = doc(db, 'users', cId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setCustomerDetails({ id: userSnap.id, ...userSnap.data() });
      }

      // 2. Fetch Customer's Completed Reports
      const q = query(collection(db, 'service_requests'), where('userId', '==', cId));
      const querySnapshot = await getDocs(q);
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      const sorted = fetched
        .filter((r) => r.status === 'completed')
        .sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });

      setCustomerReports(sorted);
    } catch (err) {
      console.error("Error fetching customer data:", err);
    } finally {
      setLoadingCustomerReports(false);
    }
  };

  // Timer and billing logic
  useEffect(() => {
    if (!isJoined || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      if (activeConsultationId) {
        const docRef = doc(db, 'consultations', activeConsultationId);
        updateDoc(docRef, { status: 'completed' }).catch(console.error);
      }
      alert("Time limit completed. Your call session has ended.");
      const isAstrologer = window.location.href.includes('astrologer') || userData?.role === 'astrologer';
      router.push(isAstrologer ? '/astrologer-dashboard' : '/');
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
            // Insufficient balance, mark call as completed and force disconnect
            if (activeConsultationId) {
              const docRef = doc(db, 'consultations', activeConsultationId);
              await updateDoc(docRef, { status: 'completed' }).catch(console.error);
            }
            alert("Your wallet balance is exhausted. The call has ended.");
            const isAstrologer = window.location.href.includes('astrologer') || userData?.role === 'astrologer';
            router.push(isAstrologer ? '/astrologer-dashboard' : '/');
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
  }, [timeLeft, isJoined, router, isCustomerRole, activeConsultationId, userData]);

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

  const isAstrologerUser = window.location.href.includes('astrologer') || userData?.role === 'astrologer';

  return (
    <div className="h-screen w-full bg-black overflow-hidden flex flex-col relative">
      {isJoined && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-xl flex items-center gap-4">
           {timeLeft !== null && (
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
               <span className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                 {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                 {(timeLeft % 60).toString().padStart(2, '0')}
               </span>
               <span className="text-white/70 text-xs">Remaining</span>
             </div>
           )}

           {/* Astrologer Customer Profile & Reports Access Button */}
           {isAstrologerUser && targetCustomerId && (
             <button
               onClick={() => {
                 setShowReportsDrawer(true);
                 if (targetCustomerId) fetchCustomerData(targetCustomerId);
               }}
               className="px-3.5 py-1.5 bg-[#C9952B] hover:bg-[#b08020] text-white font-semibold text-xs rounded-full transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
             >
               <FileText size={14} />
               <span>Customer Reports</span>
               {customerReports.length > 0 && (
                 <span className="bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                   {customerReports.length}
                 </span>
               )}
             </button>
           )}

           <button
             onClick={async () => {
               if (activeConsultationId) {
                 try {
                   const docRef = doc(db, 'consultations', activeConsultationId);
                   await updateDoc(docRef, { status: 'completed' });
                 } catch (e) {
                   console.error(e);
                 }
               }
               router.push(isAstrologerUser ? '/astrologer-dashboard' : '/');
             }}
             className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-full transition-colors cursor-pointer"
           >
             End Call
           </button>
        </div>
      )}

      {/* Main Zego Video / Audio Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full flex-1"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Slide-Over Side Drawer for Customer Profile & Reports (Astrologer Only) */}
      <AnimatePresence>
        {showReportsDrawer && (
          <div className="fixed inset-0 z-[99999] flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-lg h-full bg-[#0f1117] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden text-foreground"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center text-white font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {customerDetails?.name || 'Customer Profile'}
                    </h3>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live Call Session Access
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReportsDrawer(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* Customer Details Card */}
                {customerDetails && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] mb-3">
                      Customer Bio & Birth Info
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-white/50 block">Name</span>
                        <span className="font-semibold text-white">{customerDetails.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-white/50 block">Date of Birth</span>
                        <span className="font-semibold text-white">{customerDetails.dob || 'N/A'}</span>
                      </div>
                      {customerDetails.phone && (
                        <div>
                          <span className="text-white/50 block">Phone</span>
                          <span className="font-semibold text-white flex items-center gap-1">
                            <Phone size={10} className="text-[#C9952B]" /> {customerDetails.phone}
                          </span>
                        </div>
                      )}
                      {customerDetails.email && (
                        <div className="col-span-2">
                          <span className="text-white/50 block">Email</span>
                          <span className="font-semibold text-white flex items-center gap-1 truncate">
                            <Mail size={10} className="text-[#C9952B]" /> {customerDetails.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Reports List Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText size={16} className="text-[#C9952B]" />
                      Customer Generated Reports ({customerReports.length})
                    </h4>
                    <button
                      onClick={() => targetCustomerId && fetchCustomerData(targetCustomerId)}
                      className="text-[11px] text-[#C9952B] hover:underline font-semibold"
                    >
                      Refresh
                    </button>
                  </div>

                  {loadingCustomerReports ? (
                    <div className="flex flex-col items-center justify-center py-12 text-white/50 text-xs gap-2">
                      <Loader2 className="animate-spin text-[#C9952B]" size={24} />
                      Fetching customer reports...
                    </div>
                  ) : customerReports.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <FileText size={32} className="mx-auto text-white/30" />
                      <p className="text-sm font-semibold text-white/80">No reports generated yet</p>
                      <p className="text-xs text-white/50">This customer hasn't purchased or generated reports on the platform.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerReports.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <Sparkles size={14} className="text-[#C9952B] shrink-0" />
                              <h5 className="font-bold text-sm text-white truncate">
                                {rep.type || 'Custom Astrological Report'}
                              </h5>
                            </div>
                            {rep.details?.dob && (
                              <p className="text-[11px] text-white/60">
                                Details: {rep.details.dob} | {rep.details.time || ''} | {rep.details.place || ''}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedReport(rep)}
                            className="px-3 py-1.5 rounded-xl gold-gradient-bg text-white text-xs font-semibold flex items-center gap-1 shadow-md hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                          >
                            <Eye size={12} /> View Report
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Notice */}
              <div className="p-4 border-t border-white/10 bg-black/40 text-[11px] text-white/50 text-center">
                🔒 Temporary access enabled only during active call session. Access expires upon disconnect.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Report Content Modal (Over Zego Call) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#141721] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-foreground"
            >
              {/* Report Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedReport.type}</h3>
                  {selectedReport.details?.dob && (
                    <p className="text-xs text-white/60 mt-0.5">
                      Target: {selectedReport.details.dob} {selectedReport.details.place ? `| ${selectedReport.details.place}` : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Report Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-sm text-white/90">
                {(() => {
                  try {
                    const data = JSON.parse(selectedReport.reportContent);
                    if (data && data.recommendationTitle) {
                      return (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30">
                            <span className="text-xs text-[#C9952B] font-bold uppercase tracking-wider block mb-1">
                              {data.recommendationTitle}
                            </span>
                            <h4 className="text-xl font-bold text-white mb-1">{data.recommendationName}</h4>
                            <p className="text-xs text-white/70">{data.timing}</p>
                          </div>

                          {data.materials && (
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h5 className="text-xs font-bold text-[#C9952B] uppercase mb-1">Materials / Requirements</h5>
                              <p className="text-xs leading-relaxed text-white/80">{data.materials}</p>
                            </div>
                          )}

                          {(data.astrologicalAnalysis || data.description) && (
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h5 className="text-xs font-bold text-[#C9952B] uppercase mb-1">Astrological Analysis</h5>
                              <p className="text-xs leading-relaxed whitespace-pre-wrap text-white/80">{data.astrologicalAnalysis || data.description}</p>
                            </div>
                          )}

                          {data.procedure && (
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h5 className="text-xs font-bold text-[#C9952B] uppercase mb-1">Procedure</h5>
                              <p className="text-xs leading-relaxed whitespace-pre-wrap text-white/80">{data.procedure}</p>
                            </div>
                          )}
                        </div>
                      );
                    }
                  } catch (e) {}

                  return (
                    <div className="whitespace-pre-wrap text-xs leading-relaxed text-white/80 space-y-2">
                      {selectedReport.reportContent}
                    </div>
                  );
                })()}
              </div>

              {/* Report Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
