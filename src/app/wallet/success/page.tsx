'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function WalletSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [status, setStatus] = useState<'verifying' | 'done' | 'error'>('verifying');

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        toast.error('Invalid payment session');
        router.push('/wallet');
        return;
      }

      try {
        const response = await fetch('/api/verify-wallet-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        setStatus('done');
        
        if (data.balanceUpdated) {
          toast.success('Funds added to wallet successfully!');
        } else {
          toast.success('Payment verified.');
        }
        
        // Wait a moment so user sees success and then return to original page or wallet
        setTimeout(() => {
          const returnUrl = searchParams?.get('redirect') || localStorage.getItem('wallet_return_url');
          if (returnUrl) {
            localStorage.removeItem('wallet_return_url');
            router.push(returnUrl);
          } else {
            router.push('/wallet');
          }
        }, 2000);

      } catch (error: any) {
        console.error(error);
        setStatus('error');
        toast.error(error.message || 'Error processing payment');
        setTimeout(() => {
          const returnUrl = searchParams?.get('redirect') || localStorage.getItem('wallet_return_url');
          if (returnUrl) {
            localStorage.removeItem('wallet_return_url');
            router.push(returnUrl);
          } else {
            router.push('/wallet');
          }
        }, 2500);
      }
    }

    verifyPayment();
  }, [sessionId, router]);

  return (
    <div className="max-w-md w-full glass-card border border-border p-8 rounded-3xl mx-auto">
      {status === 'error' ? (
        <div className="text-red-400 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <XCircle size={64} className="mb-6" />
          <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
          <p className="text-muted-foreground text-center">There was an issue verifying your payment. Redirecting back...</p>
        </div>
      ) : status === 'done' ? (
        <div className="text-green-400 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <CheckCircle size={64} className="mb-6" />
          <h2 className="text-3xl font-bold mb-2 text-foreground">Payment Successful!</h2>
          <p className="text-muted-foreground text-center">Funds have been added to your wallet. Redirecting...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-[#C9952B]">
          <Loader2 className="animate-spin mb-6" size={64} />
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            Verifying Payment...
          </h2>
          <p className="text-muted-foreground text-center">Please do not close or refresh this window.</p>
        </div>
      )}
    </div>
  );
}

export default function WalletSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center cosmic-bg">
      <Suspense fallback={<Loader2 className="animate-spin text-[#C9952B]" size={32} />}>
        <WalletSuccessContent />
      </Suspense>
    </div>
  );
}
