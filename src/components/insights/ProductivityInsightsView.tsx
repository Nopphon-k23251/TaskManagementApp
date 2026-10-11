import React from 'react';
import { 
  Flame, 
  Clock, 
  TrendingUp, 
  Award, 
  Layers, 
  CheckCircle2, 
  Activity
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';
import { getTodayString } from '../../utils/date';

export const ProductivityInsightsView: React.FC = () => {
  const { tasks, habits, focusSessions, todayFocusMinutes, activityLogs } = useTasks();
  const { language, t } = useLanguage();
  const today = getTodayString();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total Focus Minutes all-time
  const totalFocusMinutesAllTime = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Best habit streak across all habits
  const topHabitStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const bestAllTimeStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16 sm:pb-8 font-sans max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <span>{t('insightsTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('insightsSub')}
          </p>
        </div>
      </div>

      {/* KPI 4-Card Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Today's Focus Minutes */}
        <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm relative overflow-hidden group hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-cyan-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase">{t('todayFocusMinutes')}</span>
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-cyan-300">
            {todayFocusMinutes} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">{t('minutesUnit')}</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
            {t('totalFocusTime')}: {totalFocusMinutesAllTime} {t('minutesUnit')}
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden group hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-emerald-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase">{t('completionRate')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-emerald-300">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-950 h-2 rounded-full mt-2 overflow-hidden border border-slate-300 dark:border-emerald-500/30">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
              style={{ width: `${Math.max(completionRate > 0 ? 5 : 0, completionRate)}%` }}
            />
          </div>
        </div>

        {/* Active Habit Consistency */}
        <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-amber-500/20 shadow-sm relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-amber-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase">{language === 'th' ? 'Streak สูงสุด' : 'Best Streak'}</span>
            <Flame className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-amber-300">
            {topHabitStreak} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">{t('streakDays')}</span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
            {t('bestStreakLabel', { count: bestAllTimeStreak })}
          </div>
        </div>

        {/* Total Tasks Managed */}
        <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-indigo-500/20 shadow-sm relative overflow-hidden group hover:border-indigo-400/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-indigo-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase">{t('totalTasks')}</span>
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-indigo-300">
            {totalTasks}
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
            {completedTasks} {t('done')} · {inProgressTasks} {t('inProgress')}
          </div>
        </div>
      </div>

      {/* Grid: Habit Streaks Table & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Habit Consistency Board */}
        <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-cyan-500/20 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
                {t('habitsTitle')} ({habits.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono py-4 text-center">
                {language === 'th' ? 'ไม่มีข้อมูลกิจวัตร' : 'No habits tracked yet'}
              </p>
            ) : (
              habits.map((h) => {
                const isCompletedToday = h.completedDates.includes(today);

                return (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-500/15 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {h.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          {h.category || (language === 'th' ? 'ทั่วไป' : 'General')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          {language === 'th'
                            ? `สำเร็จ ${h.completedDates.length} ครั้ง`
                            : `Completed ${h.completedDates.length} times`}
                        </span>
                        {isCompletedToday && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {language === 'th' ? '✓ วันนี้สำเร็จแล้ว' : '✓ Done today'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-transparent text-xs font-mono font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>{h.streak} {t('streakDays')}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity & Completed Milestones Feed */}
        <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-cyan-500/20 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
              {t('recentActivity')}
            </h3>
          </div>

          <div className="space-y-3 font-mono max-h-[360px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('noActivity')}
              </div>
            ) : (
              activityLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-500/10 text-xs flex items-start gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_6px_#00f5ff] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-200 truncate">
                      {log.taskTitle}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-cyan-400/80">
                      {log.details || log.action}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
