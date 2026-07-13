'use client';
import React from 'react';
import { LogOut } from 'lucide-react';
import { logoutAdmin } from '@/app/admin-panel/actions';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-sm p-6 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-foreground mb-2">Sign Out</h2>
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to sign out of the dashboard?</p>
        
        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-foreground"
          >
            Cancel
          </button>
          <form action={logoutAdmin}>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-xl bg-red-500/90 text-white text-sm font-medium hover:bg-red-500 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Yes, Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
