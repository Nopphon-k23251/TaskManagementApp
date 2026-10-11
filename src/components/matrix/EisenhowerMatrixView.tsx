import React from 'react';
import { 
  AlertOctagon, 
  CalendarClock, 
  Zap, 
  Inbox, 
  Plus, 
  CheckCircle2, 
  Edit3,
  Calendar
} from 'lucide-react';
import { Task, TaskPriority } from '../../types/task';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';
import { isToday, isOverdue, formatDate, getTodayString } from '../../utils/date';
import { getCategoryBadgeStyle } from '../../utils/category';
import { playCompletionSound, triggerConfetti } from '../../utils/feedback';

interface EisenhowerMatrixViewProps {
  onOpenCreateModal: (defaultStatus?: any, defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
}

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  onOpenCreateModal,
  onEditTask,
}) => {
  const { filteredTasks, updateTaskStatus, categories } = useTasks();
  const { language, t } = useLanguage();
  const today = getTodayString();

  // Exclude completed tasks from the matrix planning
  const activeTasks = filteredTasks.filter((t) => t.status !== 'completed');

  // Categorize into 4 mutually exclusive Quadrants:
  // Q1: Do First (Urgent & Important)
  const doFirstTasks = activeTasks.filter(
    (t) => t.priority === 'urgent' || (t.priority === 'high' && (isToday(t.dueDate) || isOverdue(t.dueDate)))
  );

  // Q2: Schedule (Important, Not Urgent)
  const scheduleTasks = activeTasks.filter(
    (t) => !doFirstTasks.includes(t) && t.priority === 'high'
  );

  // Q3: Delegate / Quick (Urgent, Less Important)
  const delegateTasks = activeTasks.filter(
    (t) => !doFirstTasks.includes(t) && !scheduleTasks.includes(t) && (isToday(t.dueDate) || isOverdue(t.dueDate))
  );

  // Q4: Backlog (Not Urgent, Not Important)
  const backlogTasks = activeTasks.filter(
    (t) => !doFirstTasks.includes(t) && !scheduleTasks.includes(t) && !delegateTasks.includes(t)
  );

  const quadrants = [
    {
      id: 'do_first',
      title: t('quadrantDoFirst'),
      desc: t('quadrantDoFirstDesc'),
      icon: AlertOctagon,
      tasks: doFirstTasks,
      borderClass: 'border-rose-400/40 dark:border-rose-500/30',
      bgHeader: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
      badgeClass: 'bg-rose-500 text-white',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.08)]',
      defaultPriority: 'urgent' as TaskPriority,
      defaultDate: today,
    },
    {
      id: 'schedule',
      title: t('quadrantSchedule'),
      desc: t('quadrantScheduleDesc'),
      icon: CalendarClock,
      tasks: scheduleTasks,
      borderClass: 'border-cyan-400/40 dark:border-cyan-500/30',
      bgHeader: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      badgeClass: 'bg-cyan-500 text-white',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.08)]',
      defaultPriority: 'high' as TaskPriority,
      defaultDate: '',
    },
    {
      id: 'delegate',
      title: t('quadrantDelegate'),
      desc: t('quadrantDelegateDesc'),
      icon: Zap,
      tasks: delegateTasks,
      borderClass: 'border-amber-400/40 dark:border-amber-500/30',
      bgHeader: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      badgeClass: 'bg-amber-500 text-white',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]',
      defaultPriority: 'medium' as TaskPriority,
      defaultDate: today,
    },
    {
      id: 'backlog',
      title: t('quadrantBacklog'),
      desc: t('quadrantBacklogDesc'),
      icon: Inbox,
      tasks: backlogTasks,
      borderClass: 'border-[#ded5c2] dark:border-slate-700/50',
      bgHeader: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
      badgeClass: 'bg-slate-500 text-white',
      glow: 'shadow-xs',
      defaultPriority: 'low' as TaskPriority,
      defaultDate: '',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
            {t('matrixTitle')}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('matrixSub')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quad) => {
          const Icon = quad.icon;

          return (
            <div
              key={quad.id}
              className={`bg-[#fdfcf9] dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-3xl border ${quad.borderClass} ${quad.glow} p-4 sm:p-5 flex flex-col min-h-[290px] shadow-xs`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#e8e2d4] dark:border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-xl ${quad.bgHeader} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {quad.title}
                      </h4>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full ${quad.badgeClass}`}>
                        {quad.tasks.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                      {quad.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCreateModal('todo', quad.defaultDate || today)}
                  className="p-1.5 rounded-xl bg-[#ede7d8]/70 hover:bg-[#ede7d8] dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-cyan-400 transition-colors"
                  title="Add task in quadrant"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task list in Quadrant */}
              <div className="flex-1 space-y-2 mt-3 overflow-y-auto max-h-[320px] pr-1">
                {quad.tasks.length === 0 ? (
                  <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-[#f7f4ea]/60 dark:bg-slate-950/40 border border-dashed border-[#ded5c2] dark:border-slate-900">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {language === 'th' ? 'ไม่มีงานในช่องนี้' : 'No tasks in this quadrant'}
                    </p>
                  </div>
                ) : (
                  quad.tasks.map((task) => {
                    const badge = getCategoryBadgeStyle(task.category, categories);
                    const overdue = isOverdue(task.dueDate);

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-2xl bg-[#f7f4ea] hover:bg-[#fffdf9] dark:bg-slate-950/80 border border-[#e8e2d4] dark:border-cyan-500/15 hover:border-cyan-400/40 shadow-xs transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <button
                            onClick={() => {
                              playCompletionSound();
                              triggerConfetti();
                              updateTaskStatus(task.id, 'completed');
                            }}
                            className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
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
                                className={`font-mono text-[9px] font-semibold flex items-center gap-1 ${
                                  overdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-cyan-400/70'
                                }`}
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                {formatDate(task.dueDate)}
                              </span>
                            </div>

                            <p
                              onClick={() => onEditTask(task)}
                              className="text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            >
                              {task.title}
                            </p>
                          </div>

                          <button
                            onClick={() => onEditTask(task)}
                            className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
