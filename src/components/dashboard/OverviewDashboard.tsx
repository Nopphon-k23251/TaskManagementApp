import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  Calendar, 
  ArrowUpRight,
  Sparkles,
  Activity,
  AlertTriangle,
  Clock,
  GitBranch
} from 'lucide-react';
import { Task, ActiveTab } from '../../types/task';
import { formatDate, isOverdue } from '../../utils/date';
import { getTaskDependencyStatus } from '../../utils/dependencies';
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md mb-2 sm:mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {t('prodSummary')}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('overviewTitle')}
          </h2>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-indigo-100 leading-relaxed">
            {t('overviewSub', { completed, total, rate: completionRate })}
          </p>
          <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 text-xs font-bold text-brand-900 bg-white hover:bg-indigo-50 rounded-xl shadow-md transition-all active:scale-95"
            >
              {t('createTaskBtn')}
            </button>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t('viewTimelineBtn')}</span>
            </button>
            <button
              onClick={() => onNavigateTab('board')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all"
            >
              {t('viewBoardBtn')}
            </button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('totalTasks')}</span>
            <Layers className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {total}
          </div>
          <div className="mt-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {todo} {t('toDoCol')} · {inProgress} {t('activeTasks')}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('completionRate')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('overdue')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {overdueCount}
          </div>
          <div className="mt-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {overdueCount > 0 ? t('overdue') : 'On track'}
          </div>
        </div>

        {/* Blocked Dependencies & Urgent */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('blockedTasksOverview')}</span>
            <GitBranch className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {blockedTasks.length}
          </div>
          <div className="mt-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {delayedWarningTasks.length > 0 ? `⚠️ ${delayedWarningTasks.length} งานต้นทางล่าช้า` : 'รอเริ่มตามลำดับ'}
          </div>
        </div>
      </div>

      {/* Main Analytics Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Upcoming Deadlines & Priority Breakdown */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {t('upcomingDeadlines')}
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>{t('fullCalendar')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
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
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500'
                              : task.priority === 'high'
                              ? 'bg-amber-500'
                              : 'bg-brand-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {task.title}
                            </p>
                            {depStatus.isBlocked && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0">
                                {depStatus.hasWarning ? '⚠️' : '🔒'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {task.category}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-semibold shrink-0 ml-2 ${
                          overdue ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
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

          {/* Priority Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
              {t('priorityDistribution')}
            </h3>

            <div className="space-y-3">
              {[
                { label: t('urgent'), count: priorityStats.urgent, color: 'bg-rose-500', text: 'text-rose-500' },
                { label: t('high'), count: priorityStats.high, color: 'bg-amber-500', text: 'text-amber-500' },
                { label: t('medium'), count: priorityStats.medium, color: 'bg-brand-500', text: 'text-brand-500' },
                { label: t('low'), count: priorityStats.low, color: 'bg-slate-400', text: 'text-slate-400' },
              ].map((item) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={item.text}>{item.label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.count} งาน ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">
              {t('taskCategories')}
            </h3>

            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).map(([catName, count]) => {
                const catObj = categories.find((c) => c.name === catName);
                const colorClass = catObj?.color || 'bg-slate-100 text-slate-700';
                return (
                  <div
                    key={catName}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${colorClass}`}
                  >
                    <span>{catName}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Activity className="w-4 h-4 text-brand-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('recentActivity')}
              </h3>
            </div>

            <div className="space-y-3">
              {activityLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {t('noActivity')}
                </div>
              ) : (
                activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 text-xs">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-500" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {log.taskTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
