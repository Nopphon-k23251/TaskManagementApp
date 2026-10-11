import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TimerMode } from '../types/task';
import { useTasks } from './TaskContext';
import { useLanguage } from './LanguageContext';
import { 
  playTimerFinishSound, 
  stopTimerAlarm, 
  triggerConfetti, 
  initAudioContext, 
  testAlarmSound 
} from '../utils/feedback';

export const TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface TimerContextType {
  timerMode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  timerProgress: number;
  showTimeUpModal: boolean;
  completedTimerMode: TimerMode;
  isTestingSound: boolean;
  formatTimerDisplay: (seconds: number) => string;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchTimerMode: (mode: TimerMode) => void;
  dismissAlarm: () => void;
  testAlarm: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeFocusTask, logFocusSession } = useTasks();
  const { language } = useLanguage();

  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState<boolean>(false);
  const [completedTimerMode, setCompletedTimerMode] = useState<TimerMode>('focus');
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);

  // Exact target timestamp to prevent timer drift and survive background tab throttling
  const targetEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const titleFlashIntervalRef = useRef<number | null>(null);

  const startTitleFlashing = (text: string) => {
    stopTitleFlashing();
    let alt = false;
    titleFlashIntervalRef.current = window.setInterval(() => {
      document.title = alt ? text : '🔔 TaskManager Pro';
      alt = !alt;
    }, 750);
  };

  const stopTitleFlashing = () => {
    if (titleFlashIntervalRef.current) {
      clearInterval(titleFlashIntervalRef.current);
      titleFlashIntervalRef.current = null;
    }
    document.title = 'TaskManager Pro';
  };

  const dismissAlarm = () => {
    stopTimerAlarm();
    stopTitleFlashing();
    setShowTimeUpModal(false);
    if (timeLeft <= 0) {
      setTimeLeft(TIMER_DURATIONS[timerMode]);
    }
  };

  const testAlarm = () => {
    setIsTestingSound(true);
    testAlarmSound();
    setTimeout(() => setIsTestingSound(false), 900);
  };

  const startTimer = () => {
    initAudioContext();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const currentRemaining = timeLeft <= 0 ? TIMER_DURATIONS[timerMode] : timeLeft;
    if (timeLeft <= 0) {
      setTimeLeft(currentRemaining);
    }
    targetEndTimeRef.current = Date.now() + currentRemaining * 1000;
    setIsRunning(true);
  };

  const pauseTimer = () => {
    if (targetEndTimeRef.current) {
      const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      targetEndTimeRef.current = null;
    }
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    dismissAlarm();
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setTimeLeft(TIMER_DURATIONS[timerMode]);
  };

  const switchTimerMode = (mode: TimerMode) => {
    dismissAlarm();
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setTimerMode(mode);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  // Keep browser tab title updated with countdown while timer is running
  useEffect(() => {
    if (isRunning) {
      const modeLabel = timerMode === 'focus' ? 'Deep Work' : 'Break';
      document.title = `(${formatTimerDisplay(timeLeft)}) 🎯 ${modeLabel} - TaskManager Pro`;
    } else if (!showTimeUpModal) {
      document.title = 'TaskManager Pro';
    }
  }, [isRunning, timeLeft, timerMode, showTimeUpModal]);

  // Main timer countdown interval
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          // Timer completed!
          setIsRunning(false);
          targetEndTimeRef.current = null;
          setCompletedTimerMode(timerMode);
          setShowTimeUpModal(true);
          playTimerFinishSound();
          triggerConfetti();

          const flashMsg = timerMode === 'focus' 
            ? (language === 'th' ? '⏰ ครบเวลาโฟกัสแล้ว!' : "⏰ Focus Time's Up!")
            : (language === 'th' ? '⏰ หมดเวลาพักแล้ว!' : "⏰ Break Time's Up!");
          startTitleFlashing(flashMsg);

          // Native desktop notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(flashMsg, {
                body: timerMode === 'focus' 
                  ? (language === 'th' ? 'คุณโฟกัสงานครบตามเวลาเรียบร้อยแล้ว ยอดเยี่ยมมาก! ได้เวลาพักสายตา' : 'Focus session completed! Time for a short break.')
                  : (language === 'th' ? 'หมดเวลาพักเบรกแล้ว พร้อมเริ่มรอบโฟกัสต่อไปหรือยัง?' : 'Break is over! Ready for the next focus sprint?'),
              });
            } catch {}
          }

          // Mobile vibration if supported
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([400, 200, 400, 200, 400]);
            } catch {}
          }

          if (timerMode === 'focus') {
            const minutes = Math.round(TIMER_DURATIONS.focus / 60);
            logFocusSession({
              taskId: activeFocusTask?.id,
              taskTitle: activeFocusTask?.title || 'General Focus',
              durationMinutes: minutes,
            });
          }
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRunning, timerMode, activeFocusTask, language, logFocusSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimerAlarm();
      stopTitleFlashing();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const timerProgress = 1 - timeLeft / TIMER_DURATIONS[timerMode];

  return (
    <TimerContext.Provider
      value={{
        timerMode,
        timeLeft,
        isRunning,
        timerProgress,
        showTimeUpModal,
        completedTimerMode,
        isTestingSound,
        formatTimerDisplay,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        switchTimerMode,
        dismissAlarm,
        testAlarm,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
