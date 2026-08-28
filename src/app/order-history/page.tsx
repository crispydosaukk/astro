'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Loader2, Video, Phone, Calendar, Clock, CreditCard, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/lib/CurrencyContext';

export default function OrderHistoryPage() {
  const { user, loading: userLoading } = useUserData();
  const { formatPrice } = useCurrency();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'consultations'),
          where('customerId', '==', user.uid),
          where('status', '==', 'completed')
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Sort manually by createdAt if it exists, or just fallback
        data.sort((a: any, b: any) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });

        setHistory(data);
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchHistory();
    }
  }, [user, userLoading]);

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <div className="container mx-auto p-6 lg:p-8 max-w-4xl pt-32">
        <h1 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3">
          <Clock className="text-[#C9952B]" size={32} />
          Consultation History
        </h1>

        {loading || userLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#C9952B]" size={40} />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:border-[#C9952B]/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C9952B]/10 flex items-center justify-center flex-shrink-0">
                      {order.type === 'video' ? (
                        <Video className="text-[#C9952B]" size={24} />
                      ) : (
                        <Phone className="text-[#C9952B]" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {order.type === 'video' ? 'Video' : 'Audio'} Consultation with{' '}
                        {order.astrologerName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} /> {order.date} at {order.time}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} /> {order.duration} minutes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center bg-muted/50 p-4 rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                      Amount Paid
                    </span>
                    <span className="text-2xl font-bold text-[#C9952B] flex items-center gap-1.5">
                      {formatPrice(order.price || 0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Phone className="text-muted-foreground" size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No past consultations</h3>
            <p className="text-muted-foreground mb-6">
              You haven't completed any consultations with our astrologers yet.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => (window.location.href = '/talk-to-ai-astrologer')}
                className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white transition-all shadow-md flex items-center gap-1.5"
              >
                <Bot size={15} className="animate-pulse" /> AI Expert Astrologer
              </button>
              <button
                onClick={() => (window.location.href = '/talk-to-astrologer')}
                className="px-6 py-2.5 rounded-xl font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all"
              >
                Book Astrologer Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
