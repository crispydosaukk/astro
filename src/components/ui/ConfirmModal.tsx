'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  HelpCircle,
  Info,
  Trash2,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'info';
  confirmLoading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  confirmLoading = false,
  icon,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Icon based on variant
  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return <Trash2 size={24} className="text-rose-600" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-amber-600" />;
      case 'info':
        return <Info size={24} className="text-[#C9952B]" />;
      default:
        return <Sparkles size={24} className="text-[#C9952B]" />;
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      default:
        return 'bg-[#713B32] hover:bg-[#552B24] text-white shadow-[#713B32]/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />

          {/* Centered Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#FFFDFC] text-[#292522] border border-[#E5D9C8] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 text-center"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B5E55] hover:text-[#292522] hover:bg-[#F8F3EA] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Icon Header */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex items-center justify-center mb-4 shadow-sm">
              {renderIcon()}
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-bold text-[#292522] tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed mb-6">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={confirmLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#F8F3EA] hover:bg-[#EDE4D5] text-[#292522] border border-[#E5D9C8] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                }}
                disabled={confirmLoading}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 ${getConfirmButtonClasses()}`}
              >
                {confirmLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
