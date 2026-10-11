import React from 'react';
import { Bell, Coffee, Target } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TimeUpModalProps {
  onNavigateToFocus?: () => void;
}

export const TimeUpModal: React.FC<TimeUpModalProps> = ({ onNavigateToFocus }) => {
  const { 
    showTimeUpModal, 
    completedTimerMode, 
    dismissAlarm, 
    switchTimerMode 
  } = useTimer();
  const { activeFocusTask } = useTasks();
  const { language, t } = useLanguage();

  if (!showTimeUpModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0c1428] rounded-3xl p-6 sm:p-8 border-2 border-cyan-400 dark:border-cyan-400 shadow-[0_0_50px_rgba(0,245,255,0.4)] text-center relative overflow-hidden animate-slide-up">
        {/* Background Cyber Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Bell Icon with Rings */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40" />
          <span className="relative inline-flex rounded-2xl h-16 w-16 bg-gradient-to-tr from-cyan-500 to-brand-600 items-center justify-center text-white shadow-[0_0_25px_#00f5ff]">
            <Bell className="w-8 h-8 animate-bounce" />
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {t('timerFinishedTitle')}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {completedTimerMode === 'focus'
            ? t('timerFinishedFocusDesc')
            : t('timerFinishedBreakDesc')}
        </p>

        {/* Active task banner if applicable */}
        {activeFocusTask && completedTimerMode === 'focus' && (
          <div className="mb-6 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-left flex items-center gap-2.5">
            <Target className="w-4 h-4 text-cyan-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-400 font-bold block">
                {language === 'th' ? 'งานที่โฟกัส:' : 'Focused Task:'}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                {activeFocusTask.title}
              </span>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="space-y-2.5">
          {completedTimerMode === 'focus' ? (
            <button
              onClick={() => {
                dismissAlarm();
                switchTimerMode('short_break');
                onNavigateToFocus?.();
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold font-mono text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              <span>{t('startBreakBtn')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                dismissAlarm();
                switchTimerMode('focus');
                onNavigateToFocus?.();
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold font-mono text-sm bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>{t('startFocusBtn')}</span>
            </button>
          )}

          <button
            onClick={dismissAlarm}
            className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {t('dismissAlarmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
