'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type CurrencyCode = 'INR' | 'USD';

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  currencySymbol: string;
  setCurrencyCode: (code: CurrencyCode) => void;
  formatPrice: (amountInINR: number | string, amountInUSD?: number | string) => string;
  convertPrice: (amountInINR: number | string, amountInUSD?: number | string) => number;
}

const EXCHANGE_RATE_INR_TO_USD = 0.012; // 1 INR = 0.012 USD (Approx)

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('INR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // If the user's timezone is not in India, default to USD
      if (timeZone !== 'Asia/Calcutta' && timeZone !== 'Asia/Kolkata') {
        setCurrencyCode('USD');
      }
    } catch (e) {
      console.warn("Could not detect timezone, defaulting to INR");
    }
  }, []);

  const currencySymbol = currencyCode === 'INR' ? '₹' : '$';

  const convertPrice = (amountInINR: number | string, amountInUSD?: number | string): number => {
    if (currencyCode === 'USD' && amountInUSD !== undefined && amountInUSD !== null) {
      const usdAmount = typeof amountInUSD === 'string' ? parseFloat(amountInUSD.replace(/,/g, '')) : amountInUSD;
      if (!isNaN(usdAmount)) return Number(usdAmount.toFixed(2));
    }
    
    const amount = typeof amountInINR === 'string' ? parseFloat(amountInINR.replace(/,/g, '')) : amountInINR;
    if (isNaN(amount)) return 0;
    
    if (currencyCode === 'USD') {
      return Number((amount * EXCHANGE_RATE_INR_TO_USD).toFixed(2));
    }
    return Math.round(amount);
  };

  const formatPrice = (amountInINR: number | string, amountInUSD?: number | string): string => {
    const converted = convertPrice(amountInINR, amountInUSD);
    
    if (currencyCode === 'USD') {
      return `${currencySymbol}${converted.toFixed(2)}`;
    }
    return `${currencySymbol}${converted.toLocaleString('en-IN')}`;
  };

  // Prevent hydration mismatch by rendering default on server, then adjusting on client
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CurrencyContext.Provider value={{ currencyCode, currencySymbol, setCurrencyCode, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Return a dummy implementation for server components or when wrapped outside provider
    return {
      currencyCode: 'INR' as CurrencyCode,
      currencySymbol: '₹',
      setCurrencyCode: () => {},
      formatPrice: (amount: number | string, usd?: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
        return `₹${Number(val).toLocaleString('en-IN')}`;
      },
      convertPrice: (amount: number | string, usd?: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
        return Number(val);
      }
    };
  }
  return context;
}
