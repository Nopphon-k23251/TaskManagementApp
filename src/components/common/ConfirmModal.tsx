import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'danger',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-rose-500 animate-pulse" />,
      iconBg: 'bg-rose-500/15 border border-rose-500/30 text-rose-400',
      confirmBtn: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.4)]',
      border: 'border-rose-500/30 dark:border-rose-500/40',
      glow: 'dark:shadow-[0_0_35px_rgba(244,63,94,0.2)]',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500 animate-bounce" />,
      iconBg: 'bg-amber-500/15 border border-amber-500/30 text-amber-400',
      confirmBtn: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.4)]',
      border: 'border-amber-500/30 dark:border-amber-500/40',
      glow: 'dark:shadow-[0_0_35px_rgba(245,158,11,0.2)]',
    },
    info: {
      icon: <HelpCircle className="w-6 h-6 text-cyan-500 animate-pulse" />,
      iconBg: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400',
      confirmBtn: 'bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.4)]',
      border: 'border-cyan-500/30 dark:border-cyan-500/40',
      glow: 'dark:shadow-[0_0_35px_rgba(6,182,212,0.2)]',
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md bg-white/95 dark:bg-[#090e1e]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border ${variantStyles.border} ${variantStyles.glow} overflow-hidden transform transition-all animate-scale-in flex flex-col bg-cyber-grid`}
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            {/* Action Icon */}
            <div className={`p-3 rounded-2xl shrink-0 ${variantStyles.iconBg}`}>
              {variantStyles.icon}
            </div>

            {/* Content */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                {message}
              </p>
            </div>

            {/* Close Cross Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2 text-xs font-mono font-bold rounded-xl transition-all active:scale-95 ${variantStyles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
