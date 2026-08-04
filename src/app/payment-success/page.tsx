'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [status, setStatus] = useState<'verifying' | 'generating' | 'done' | 'error'>('verifying');

  useEffect(() => {
    async function processPaymentAndReport() {
      if (!sessionId) {
        toast.error('Invalid payment session');
        router.push('/');
        return;
      }

      try {
        const pendingStr = localStorage.getItem('pending_report');
        if (!pendingStr) {
          // If no pending report in local storage, just redirect
          toast.success('Payment verified.');
          router.push('/my-reports');
          return;
        }

        const reportDetails = JSON.parse(pendingStr);
        setStatus('generating');

        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportDetails),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate report');
        }

        localStorage.removeItem('pending_report');
        setStatus('done');
        toast.success('Report generated successfully!');
        
        // Wait a moment so user sees success
        setTimeout(() => {
          router.push('/my-reports');
        }, 1500);

      } catch (error: any) {
        console.error(error);
        setStatus('error');
        toast.error(error.message || 'Error processing report');
        setTimeout(() => router.push('/'), 2000);
      }
    }

    processPaymentAndReport();
  }, [sessionId, router]);

  return (
    <div className="max-w-md w-full glass-card border border-border p-8 rounded-3xl">
      {status === 'error' ? (
        <div className="text-red-400">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground">Redirecting to home...</p>
        </div>
      ) : status === 'done' ? (
        <div className="text-green-400 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <CheckCircle size={64} className="mb-6" />
          <h2 className="text-3xl font-bold mb-2 text-foreground">Payment Successful!</h2>
          <p className="text-muted-foreground">Your report is ready. Redirecting...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-[#C9952B]">
          <Loader2 className="animate-spin mb-6" size={64} />
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            {status === 'verifying' ? 'Verifying Payment...' : 'Generating Your Report...'}
          </h2>
          <p className="text-muted-foreground">Please do not close this window.</p>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <Suspense fallback={<Loader2 className="animate-spin text-[#C9952B]" size={32} />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
