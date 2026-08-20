'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';
import { logoutAdmin } from '@/app/admin-panel/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-[#FFFDFC] dark:bg-card border border-[#E5D9C8] dark:border-border w-full max-w-sm p-6 rounded-3xl shadow-2xl relative z-10 mx-auto text-center"
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <LogOut size={26} />
            </div>
            <h2 className="text-xl font-bold text-[#292522] dark:text-foreground mb-1">Sign Out</h2>
            <p className="text-sm text-[#6B5E55] dark:text-muted-foreground mb-6">
              Are you sure you want to sign out of the dashboard?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#E5D9C8] dark:border-border text-sm font-semibold hover:bg-[#EDE4D5]/60 dark:hover:bg-muted transition-colors text-[#292522] dark:text-foreground"
              >
                Cancel
              </button>
              <form action={logoutAdmin} className="flex-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogOut size={16} /> Yes, Sign Out
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
