'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Check, X, Clock, Video, VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function ConsultationsPage() {
  const router = useRouter();
  const { user } = useUserData();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'consultations'),
      where('astrologerId', '==', user.uid)
      // Note: We avoid orderBy here if no index exists, we can sort in memory.
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending in memory
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setConsultations(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching consultations:", error);
      toast.error('Failed to load consultations.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const requests = consultations.filter(c => c.status === 'pending');
  const activeSessions = consultations.filter(c => c.status === 'active');
  const history = consultations.filter(c => c.status === 'completed' || c.status === 'declined' || c.status === 'missed');

  const handleAccept = async (req: any) => {
    try {
      const response = await fetch('/api/accept-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: req.id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept');
      }

      toast.success('Consultation accepted. Connecting...');
      router.push(`/call/${req.roomID}`);
    } catch (error: any) {
      console.error('Error accepting:', error);
      toast.error(error.message || 'Failed to accept consultation.');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const docRef = doc(db, 'consultations', id);
      await updateDoc(docRef, { status: 'declined' });
      toast.success('Consultation declined.');
    } catch (error) {
      console.error('Error declining:', error);
      toast.error('Failed to decline consultation.');
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Consultations</h1>
        <p className="text-muted-foreground mt-1">
          Manage your incoming customer requests and active sessions.
        </p>
      </div>

      <div className="flex border-b border-border gap-6">
        {[
          { id: 'requests', label: 'Incoming Requests', count: requests.length },
          { id: 'active', label: 'Active Sessions', count: activeSessions.length },
          { id: 'history', label: 'History', count: history.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 font-medium text-sm transition-all relative ${
              activeTab === tab.id ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? 'bg-accent/20 text-accent'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabConsultations"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {activeTab === 'requests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.length === 0 ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
                  <Clock className="w-12 h-12 mb-4 opacity-50" />
                  <p>No incoming requests at the moment.</p>
                  <p className="text-sm">Stay online to receive consultations.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{req.customerName}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Requested {formatTimeAgo(req.createdAt)}</p>
                        </div>
                        <div
                          className={`p-2 rounded-xl ${req.type === 'video' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}
                        >
                          {req.type === 'video' ? <Video size={18} /> : <Phone size={18} />}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Session Type:</span>
                          <span className="font-semibold capitalize">{req.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{req.duration} mins</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Earnings:</span>
                          <span className="font-semibold text-green-400">{formatPrice(req.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <X size={16} /> Decline
                      </button>
                      <button
                        onClick={() => handleAccept(req)}
                        className="py-2.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.length === 0 ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                  <p>No active sessions currently.</p>
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border border-l-4 border-l-accent flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{session.customerName}</h3>
                          <div className="flex items-center gap-1 mt-1 text-xs text-accent">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            In Progress
                          </div>
                        </div>
                        <div
                          className={`p-2 rounded-xl ${session.type === 'video' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}
                        >
                          {session.type === 'video' ? <Video size={18} /> : <Phone size={18} />}
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Session Type:</span>
                          <span className="font-semibold capitalize">{session.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Started:</span>
                          <span className="font-semibold">{formatTimeAgo(session.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/call/${session.roomID}`)}
                      className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <VideoIcon size={16} /> Rejoin Call
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {history.length === 0 ? (
               <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
                 <Clock className="w-12 h-12 mb-4 opacity-50" />
                 <p>Your history will appear here.</p>
               </div>
             ) : (
               history.map((hist) => (
                 <div
                   key={hist.id}
                   className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border flex flex-col justify-between opacity-80"
                 >
                   <div>
                     <div className="flex items-start justify-between mb-4">
                       <div>
                         <h3 className="font-bold text-lg text-foreground">{hist.customerName}</h3>
                         <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(hist.createdAt)}</p>
                       </div>
                       <div
                         className={`text-xs font-semibold px-2 py-1 rounded-full ${hist.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                       >
                         {hist.status}
                       </div>
                     </div>

                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">Session Type:</span>
                         <span className="font-semibold capitalize">{hist.type}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-muted-foreground">Earnings:</span>
                         <span className="font-semibold text-foreground">{hist.status === 'completed' ? formatPrice(hist.price) : '0'}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))
             )}
           </div>
          )}
        </>
      )}
    </div>
  );
}
