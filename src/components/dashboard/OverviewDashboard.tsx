import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  Calendar, 
  ArrowUpRight,
  Activity,
  AlertTriangle,
  Clock,
  GitBranch,
  Radio,
  Zap
} from 'lucide-react';
import { Task, ActiveTab } from '../../types/task';
import { formatDate, isOverdue } from '../../utils/date';
import { getTaskDependencyStatus } from '../../utils/dependencies';
import { getCategoryBadgeStyle } from '../../utils/category';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface OverviewDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onEditTask: (task: Task) => void;
  onOpenCreateModal: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigateTab,
  onEditTask,
  onOpenCreateModal,
}) => {
  const { tasks, activityLogs, categories } = useTasks();
  const { t } = useLanguage();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'completed').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Blocked & delayed dependencies check
  const blockedTasks = tasks.filter((t) => getTaskDependencyStatus(t, tasks).isBlocked);
  const delayedWarningTasks = tasks.filter((t) => getTaskDependencyStatus(t, tasks).hasWarning);

  // Priority breakdown
  const priorityStats = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // Upcoming deadlines (sort by nearest dueDate, incomplete first)
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0 font-sans">
      {/* Holographic Command Deck Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 rounded-3xl p-5 sm:p-7 md:p-8 text-white border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] bg-cyber-grid">
        {/* Glowing Neon Light Orbs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[10px] sm:text-xs font-mono font-bold backdrop-blur-md mb-2 sm:mb-3 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{t('prodSummary')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
            {t('overviewTitle')}
          </h2>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-2xl font-medium">
            {t('overviewSub', { completed, total, rate: completionRate })}
          </p>

          <div className="mt-4 sm:mt-6 flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-200 hover:from-cyan-300 hover:to-white rounded-xl shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>{t('createTaskBtn')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('timeline')}
              className="px-4 py-2 text-xs font-mono font-bold text-cyan-300 bg-slate-900/90 hover:bg-slate-800 rounded-xl border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('viewTimelineBtn')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('board')}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-300 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all"
            >
              {t('viewBoardBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.06)] relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-cyan-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">{t('totalTasks')}</span>
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-cyan-300">
            {total}
          </div>
          <div className="mt-1.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 truncate">
            {todo} {t('toDoCol')} · {inProgress} {t('inProgressCol')}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.06)] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-emerald-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">{t('completionRate')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-emerald-300">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-950 h-3 rounded-full mt-2.5 overflow-hidden border border-slate-300 dark:border-cyan-500/40 p-[1px] shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500 progress-neon-emerald"
              style={{ width: `${Math.max(completionRate > 0 ? 4 : 0, completionRate)}%` }}
            />
          </div>
        </div>

        {/* Overdue Alert */}
        <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-rose-500/20 shadow-sm dark:shadow-[0_0_20px_rgba(244,63,94,0.06)] relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-rose-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">{t('overdue')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:animate-bounce" />
          </div>
          <div className={`text-2xl sm:text-3xl font-mono font-black ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {overdueCount}
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 truncate">
            {overdueCount > 0 ? `⚠️ ${t('overdueTasks')}` : `✓ ${t('done')}`}
          </div>
        </div>

        {/* Blocked Dependencies */}
        <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-amber-500/20 shadow-sm dark:shadow-[0_0_20px_rgba(245,158,11,0.06)] relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-amber-400/80 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">{t('blockedTasksOverview')}</span>
            <GitBranch className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-amber-600 dark:text-amber-300">
            {blockedTasks.length}
          </div>
          <div className="mt-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 truncate">
            {delayedWarningTasks.length > 0 ? `⚠️ ${delayedWarningTasks.length} ${t('delayedWarningTitle')}` : `✓ ${t('unblockAllPrereqs').split(' ')[0]}`}
          </div>
        </div>
      </div>

      {/* Main Analytics Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Upcoming Deadlines & Priority Breakdown */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t('upcomingDeadlines')}
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>{t('fullCalendar')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-400">
                  {t('noUpcoming')}
                </div>
              ) : (
                upcomingTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate);
                  const depStatus = getTaskDependencyStatus(task, tasks);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 border border-slate-200 dark:border-cyan-500/15 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px] ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500 shadow-rose-500'
                              : task.priority === 'high'
                              ? 'bg-amber-500 shadow-amber-500'
                              : 'bg-cyan-500 shadow-cyan-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {task.title}
                            </p>
                            {depStatus.isBlocked && (
                              <span className="text-[10px] text-amber-500 font-mono font-bold shrink-0">
                                {depStatus.hasWarning ? '⚠️' : '🔒'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-mono font-bold shrink-0 ml-2 ${
                          overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-cyan-400/80'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Priority Distribution Widget */}
          <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              {t('priorityDistribution')}
            </h3>

            <div className="space-y-3">
              {[
                { label: t('urgent'), count: priorityStats.urgent, progressClass: 'progress-neon-rose', text: 'text-rose-700 dark:text-rose-400' },
                { label: t('high'), count: priorityStats.high, progressClass: 'progress-neon-amber', text: 'text-amber-700 dark:text-amber-400' },
                { label: t('medium'), count: priorityStats.medium, progressClass: 'progress-neon-cyan', text: 'text-cyan-700 dark:text-cyan-400' },
                { label: t('low'), count: priorityStats.low, progressClass: 'bg-slate-400 dark:bg-slate-500', text: 'text-slate-700 dark:text-slate-400' },
              ].map((item) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className={item.text}>{item.label}</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800 p-[1px]">
                      <div
                        className={`h-full ${item.progressClass} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(item.count > 0 ? 4 : 0, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Categories & Activity Stream */}
        <div className="space-y-4 sm:space-y-6">
          {/* Categories Pill Cloud */}
          <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">
              {t('taskCategories')}
            </h3>

            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).map(([catName, count]) => {
                const badgeStyle = getCategoryBadgeStyle(catName, categories);
                return (
                  <div
                    key={catName}
                    style={badgeStyle.style}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs ${badgeStyle.className} shadow-xs`}
                  >
                    <span>{catName}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/40 text-[10px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('recentActivity')}
              </h3>
            </div>

            <div className="space-y-3 font-mono">
              {activityLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {t('noActivity')}
                </div>
              ) : (
                activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-cyan-500/30 text-xs">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_6px_#00f5ff]" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {log.taskTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-cyan-400/80">
                      {log.details || log.action}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
