import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Plus, 
  Trash2, 
  Zap, 
  Clock, 
  Target, 
  Calendar, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award,
  Volume2
} from 'lucide-react';
import { Task } from '../../types/task';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTimer, TIMER_DURATIONS } from '../../context/TimerContext';
import { getTodayString, formatDateLocale, isOverdue } from '../../utils/date';
import { getCategoryBadgeStyle } from '../../utils/category';
import { isHabitCompletedOn } from '../../utils/habits';
import { 
  playCompletionSound, 
  triggerConfetti 
} from '../../utils/feedback';

interface TodayFocusViewProps {
  onOpenCreateModal: (defaultStatus?: any, defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
  onNavigateTab: (tab: any) => void;
}

export const TodayFocusView: React.FC<TodayFocusViewProps> = ({
  onOpenCreateModal,
  onEditTask,
  onNavigateTab,
}) => {
  const {
    tasks,
    updateTaskStatus,
    habits,
    toggleHabit,
    addHabit,
    deleteHabit,
    logFocusSession,
    activeFocusTask,
    setActiveFocusTask,
    todayFocusMinutes,
    rolloverUnfinishedTasks,
    categories,
  } = useTasks();

  const { language, t } = useLanguage();
  const today = getTodayString();

  // Global Pomodoro Timer from TimerContext
  const {
    timerMode,
    timeLeft,
    isRunning,
    timerProgress,
    isTestingSound,
    switchTimerMode,
    toggleTimer,
    resetTimer,
    testAlarm,
    formatTimerDisplay,
  } = useTimer();

  const [newHabitTitle, setNewHabitTitle] = useState<string>('');
  const [showAddHabit, setShowAddHabit] = useState<boolean>(false);
  const [isRolloverLoading, setIsRolloverLoading] = useState<boolean>(false);
  const [rolloverNotice, setRolloverNotice] = useState<string | null>(null);

  // Today's scheduled tasks
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const todayIncomplete = todayTasks.filter((t) => t.status !== 'completed');
  const todayCompleted = todayTasks.filter((t) => t.status === 'completed');
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'completed');

  const handleCompleteActiveTask = async () => {
    if (!activeFocusTask) return;
    playCompletionSound();
    triggerConfetti();
    await updateTaskStatus(activeFocusTask.id, 'completed');

    // If timer was running, log whatever minutes were spent (at least 1 min)
    const elapsedSeconds = TIMER_DURATIONS[timerMode] - timeLeft;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (elapsedMinutes > 0 && timerMode === 'focus') {
      await logFocusSession({
        taskId: activeFocusTask.id,
        taskTitle: activeFocusTask.title,
        durationMinutes: elapsedMinutes,
      });
    }

    resetTimer();
    setActiveFocusTask(null);
  };

  const handleRollover = async () => {
    setIsRolloverLoading(true);
    const count = await rolloverUnfinishedTasks();
    setIsRolloverLoading(false);
    setRolloverNotice(
      language === 'th'
        ? `ยกยอดงาน ${count} รายการมาทำวันนี้เรียบร้อยแล้ว`
        : `Successfully rolled over ${count} tasks to today`
    );
    setTimeout(() => setRolloverNotice(null), 4000);
  };

  const handleAddHabitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    await addHabit(newHabitTitle.trim(), 'ทั่วไป', 'Flame');
    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16 sm:pb-8 font-sans max-w-6xl mx-auto">
      {/* 1. Header Banner & Daily Motivation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 rounded-3xl p-5 sm:p-7 md:p-8 text-white border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] bg-cyber-grid">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-mono font-bold backdrop-blur-md border border-cyan-500/40">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatDateLocale(today, language)}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              {t('todayFocusTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-cyan-100/80 max-w-xl font-medium">
              {t('todayFocusSub')}
            </p>
          </div>

          {/* Daily Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/5 dark:bg-black/30 border border-cyan-500/20 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-cyan-300/80 font-bold">
                  {t('todayFocusMinutes')}
                </p>
                <p className="text-lg font-mono font-black text-white">
                  {todayFocusMinutes} <span className="text-xs font-normal text-cyan-200">{t('minutesUnit')}</span>
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-cyan-500/20 mx-1" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-emerald-300/80 font-bold">
                  {language === 'th' ? 'เสร็จสิ้นวันนี้' : 'Done Today'}
                </p>
                <p className="text-lg font-mono font-black text-white">
                  {todayCompleted.length} / {todayTasks.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rollover Banner if Overdue Tasks Exist */}
        {overdueTasks.length > 0 && (
          <div className="mt-5 p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'th'
                  ? `คุณมีงานค้างจากวันก่อนหน้า ${overdueTasks.length} รายการที่ยังไม่เสร็จ`
                  : `You have ${overdueTasks.length} unfinished tasks from previous days`}
              </span>
            </div>

            <button
              onClick={handleRollover}
              disabled={isRolloverLoading}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold font-mono hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t('rolloverBtn', { count: overdueTasks.length })}</span>
            </button>
          </div>
        )}

        {rolloverNotice && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-mono">
            ✓ {rolloverNotice}
          </div>
        )}
      </div>

      {/* 2. Main Grid: Pomodoro Focus Cockpit (Left) & Today Priorities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pomodoro Focus Timer (7 cols on large) */}
        <div className="lg:col-span-7 bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-cyan-500/20 shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.08)] flex flex-col items-center text-center relative overflow-hidden">
          
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
                {t('focusTimerTitle')}
              </h3>
            </div>

            {/* Timer Modes Segmented Control */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-cyan-500/30 text-xs font-mono">
              <button
                onClick={() => switchTimerMode('focus')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timerMode === 'focus'
                    ? 'bg-gradient-to-r from-cyan-500 to-brand-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-cyan-400'
                }`}
              >
                {t('focusMode')}
              </button>
              <button
                onClick={() => switchTimerMode('short_break')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timerMode === 'short_break'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-400'
                }`}
              >
                {t('shortBreak')}
              </button>
              <button
                onClick={() => switchTimerMode('long_break')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timerMode === 'long_break'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-400'
                }`}
              >
                {t('longBreak')}
              </button>
            </div>
          </div>

          {/* Currently Focused Task Card */}
          <div className="w-full mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/20 text-left">
            <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-cyan-400/80 font-bold mb-1">
              {t('focusingOn')}
            </p>
            {activeFocusTask ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {activeFocusTask.title}
                  </p>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    {activeFocusTask.category}
                  </span>
                </div>
                <button
                  onClick={handleCompleteActiveTask}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold font-mono flex items-center gap-1 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('markTaskComplete')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{t('selectTaskToFocus')}</span>
                {todayIncomplete.length > 0 && (
                  <select
                    onChange={(e) => {
                      const found = todayIncomplete.find((t) => t.id === e.target.value);
                      if (found) setActiveFocusTask(found);
                    }}
                    defaultValue=""
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-cyan-100 font-mono outline-none"
                  >
                    <option value="" disabled>
                      {t('selectTaskToFocus')}
                    </option>
                    {todayIncomplete.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Large Circular Focus Clock */}
          <div className="relative my-4 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100 dark:text-slate-900"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="276"
                strokeDashoffset={276 * (1 - timerProgress)}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  timerMode === 'focus'
                    ? 'text-cyan-400 drop-shadow-[0_0_10px_#00f5ff]'
                    : timerMode === 'short_break'
                    ? 'text-emerald-400 drop-shadow-[0_0_10px_#10b981]'
                    : 'text-indigo-400 drop-shadow-[0_0_10px_#6366f1]'
                }`}
                fill="none"
              />
            </svg>

            {/* Timer Number Display Inside Circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-cyan-100 tracking-tight">
                {formatTimerDisplay(timeLeft)}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-cyan-400/80 mt-1 font-bold">
                {timerMode === 'focus' ? 'Deep Work' : 'Recharge'}
              </span>
            </div>
          </div>

          {/* Control Buttons Bar */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-2xl font-bold font-mono text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                  : 'bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{t('pauseTimer')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('startTimer')}</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-cyan-500/20 text-slate-600 dark:text-slate-400 hover:text-cyan-400 transition-all active:scale-95"
              title={t('resetTimer')}
              aria-label={t('resetTimer')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Test Alarm Sound Button */}
            <button
              onClick={testAlarm}
              className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center gap-1.5 ${
                isTestingSound
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.4)] scale-105'
                  : 'bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 border border-slate-200 dark:border-cyan-500/20 text-slate-600 dark:text-slate-400 hover:text-cyan-400'
              }`}
              title={t('testSoundBtn')}
              aria-label={t('testSoundBtn')}
            >
              <Volume2 className={`w-4 h-4 ${isTestingSound ? 'animate-bounce text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Today's Priorities (5 cols on large) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-cyan-500/20 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
                  {t('todayTasksTitle')} ({todayIncomplete.length})
                </h3>
              </div>

              <button
                onClick={() => onOpenCreateModal('todo', today)}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'เพิ่มงานวันนี้' : 'Add Task'}</span>
              </button>
            </div>

            {/* List of Today's Tasks */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {t('noTasksToday')}
                  </p>
                  <button
                    onClick={() => onOpenCreateModal('todo', today)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 text-white text-xs font-bold font-mono shadow-xs"
                  >
                    + {t('createTaskBtn')}
                  </button>
                </div>
              ) : (
                todayTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isSelected = activeFocusTask?.id === task.id;
                  const badge = getCategoryBadgeStyle(task.category, categories);

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : isCompleted
                          ? 'border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/40 opacity-60'
                          : 'border-slate-200 dark:border-cyan-500/15 bg-slate-50 dark:bg-slate-950/80 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <button
                          onClick={() => {
                            if (!isCompleted) {
                              playCompletionSound();
                              triggerConfetti();
                            }
                            updateTaskStatus(task.id, isCompleted ? 'todo' : 'completed');
                          }}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              isCompleted ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-400'
                            }`}
                          />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span
                              style={badge.style}
                              className={`text-[9px] px-2 py-0.2 rounded font-mono ${badge.className}`}
                            >
                              {task.category}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-950 text-rose-300'
                                  : task.priority === 'high'
                                  ? 'bg-amber-950 text-amber-300'
                                  : 'bg-cyan-950 text-cyan-300'
                              }`}
                            >
                              {t(task.priority)}
                            </span>
                          </div>

                          <p
                            onClick={() => onEditTask(task)}
                            className={`text-xs font-bold cursor-pointer hover:text-cyan-400 transition-colors ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>

                        {!isCompleted && (
                          <button
                            onClick={() => {
                              setActiveFocusTask(task);
                              switchTimerMode('focus');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 transition-all ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#00f5ff]'
                                : 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-cyan-300 hover:bg-cyan-500/20'
                            }`}
                          >
                            <Target className="w-3 h-3" />
                            <span>{isSelected ? 'โฟกัสอยู่' : t('focusThisTask')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => onNavigateTab('tasks')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-xs font-mono font-bold text-slate-600 dark:text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{language === 'th' ? 'ดูงานทั้งหมด & จัดการ' : 'View All Tasks & Matrix'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Daily Habits & Streaks Strip */}
      <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-cyan-500/20 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
                {t('habitsTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('habitsSub')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:from-amber-500/30 hover:to-rose-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addHabitBtn')}</span>
          </button>
        </div>

        {/* Add Habit Inline Form */}
        {showAddHabit && (
          <form onSubmit={handleAddHabitSubmit} className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/20 flex gap-2">
            <input
              type="text"
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder={t('newHabitPlaceholder')}
              autoFocus
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-slate-800 dark:text-cyan-100 placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              disabled={!newHabitTitle.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold font-mono rounded-xl disabled:opacity-40 shadow-xs"
            >
              {t('addHabitBtn')}
            </button>
          </form>
        )}

        {/* Habits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {habits.map((habit) => {
            const isDoneToday = isHabitCompletedOn(habit, today);

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                  isDoneToday
                    ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'border-slate-200 dark:border-cyan-500/15 bg-slate-50 dark:bg-slate-950/70 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      if (!isDoneToday) {
                        playCompletionSound();
                        triggerConfetti();
                      }
                      toggleHabit(habit.id, today);
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
                      isDoneToday
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_#10b981]'
                        : 'border-slate-300 dark:border-cyan-500/30 hover:border-cyan-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isDoneToday
                          ? 'text-emerald-700 dark:text-emerald-300 line-through'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {habit.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-500">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{habit.streak} {t('streakDays')}</span>
                      </span>
                      {habit.bestStreak && habit.bestStreak > 0 && (
                        <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" />
                          <span>{habit.bestStreak}d best</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                  title="Delete habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
