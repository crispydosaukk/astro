'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CurrencyCode = 'INR' | 'USD';

interface CurrencyContextType {
  currencyCode: CurrencyCode;
  currencySymbol: string;
  isIndia: boolean;
  setCurrencyCode: (code: CurrencyCode) => void;
  formatPrice: (amountInINR: number | string, amountInUSD?: number | string) => string;
  convertPrice: (amountInINR: number | string, amountInUSD?: number | string) => number;
}

const EXCHANGE_RATE_INR_TO_USD = 0.012; // 1 INR = ~0.012 USD

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>('INR');
  const [isIndia, setIsIndia] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    // 1. Check if user previously chose a specific currency preference in localStorage
    const savedCurrency = typeof window !== 'undefined' ? localStorage.getItem('astroparihar_currency') : null;
    if (savedCurrency === 'INR' || savedCurrency === 'USD') {
      setCurrencyCodeState(savedCurrency);
      setIsIndia(savedCurrency === 'INR');
      return;
    }

    // 2. Instant Local Detection via Timezone and Timezone Offset (Standard IST is UTC+5:30 -> -330 mins)
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const isIndianTimeZone =
        timeZone === 'Asia/Calcutta' ||
        timeZone === 'Asia/Kolkata' ||
        timeZone.toLowerCase().includes('calcutta') ||
        timeZone.toLowerCase().includes('kolkata');
      
      const isISTOffset = new Date().getTimezoneOffset() === -330;

      if (isIndianTimeZone || isISTOffset) {
        setCurrencyCodeState('INR');
        setIsIndia(true);
      } else {
        // User is opening outside India -> automatically default to USD ($)
        setCurrencyCodeState('USD');
        setIsIndia(false);
      }
    } catch (e) {
      console.warn('Could not read timezone, fallback to INR');
    }

    // 3. Optional Non-blocking Geo-IP verification for 100% accuracy
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          const inIndia = data.country_code === 'IN';
          setIsIndia(inIndia);
          // Only auto-update if user hasn't manually set a preference
          if (!localStorage.getItem('astroparihar_currency')) {
            setCurrencyCodeState(inIndia ? 'INR' : 'USD');
          }
        }
      })
      .catch(() => {
        // Fallback silently if offline or blocked by ad-blocker
      });
  }, []);

  const setCurrencyCode = (code: CurrencyCode) => {
    setCurrencyCodeState(code);
    setIsIndia(code === 'INR');
    if (typeof window !== 'undefined') {
      localStorage.setItem('astroparihar_currency', code);
    }
  };

  const currencySymbol = currencyCode === 'INR' ? '₹' : '$';

  const convertPrice = (amountInINR: number | string, amountInUSD?: number | string): number => {
    if (currencyCode === 'USD') {
      if (amountInUSD !== undefined && amountInUSD !== null && amountInUSD !== '') {
        const usdVal = typeof amountInUSD === 'string' ? parseFloat(amountInUSD.replace(/[^0-9.]/g, '')) : amountInUSD;
        if (!isNaN(usdVal) && usdVal > 0) return Number(usdVal.toFixed(2));
      }

      const inrVal = typeof amountInINR === 'string' ? parseFloat(amountInINR.replace(/[^0-9.]/g, '')) : amountInINR;
      if (isNaN(inrVal) || inrVal === 0) return 0;
      return Number((inrVal * EXCHANGE_RATE_INR_TO_USD).toFixed(2));
    }

    // Default INR
    const inrVal = typeof amountInINR === 'string' ? parseFloat(amountInINR.replace(/[^0-9.]/g, '')) : amountInINR;
    if (isNaN(inrVal)) return 0;
    return Math.round(inrVal);
  };

  const formatPrice = (amountInINR: number | string, amountInUSD?: number | string): string => {
    const converted = convertPrice(amountInINR, amountInUSD);

    if (currencyCode === 'USD') {
      // Format as $XX or $XX.XX
      const formatted = converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
      return `$${formatted}`;
    }

    return `₹${converted.toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        currencySymbol,
        isIndia,
        setCurrencyCode,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    return {
      currencyCode: 'INR' as CurrencyCode,
      currencySymbol: '₹',
      isIndia: true,
      setCurrencyCode: () => {},
      formatPrice: (amountInINR: number | string, amountInUSD?: number | string) => {
        const val = typeof amountInINR === 'string' ? parseFloat(amountInINR.replace(/[^0-9.]/g, '')) : amountInINR;
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
      },
      convertPrice: (amountInINR: number | string) => {
        const val = typeof amountInINR === 'string' ? parseFloat(amountInINR.replace(/[^0-9.]/g, '')) : amountInINR;
        return Number(val || 0);
      },
    };
  }
  return context;
}
