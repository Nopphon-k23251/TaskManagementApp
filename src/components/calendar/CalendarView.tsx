import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Task, TaskStatus } from '../../types/task';
import { 
  getMonthDays, 
  getWeekDays, 
  formatDate, 
  getTodayString, 
  CalendarDay,
  isOverdue 
} from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface CalendarViewProps {
  onOpenCreateModal: (defaultStatus?: TaskStatus, defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenCreateModal,
  onEditTask,
}) => {
  const { filteredTasks, updateTaskDate, categories } = useTasks();
  const { language, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('agenda');
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(getTodayString());
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const weekdays = language === 'th'
    ? ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days: CalendarDay[] =
    viewMode === 'month' ? getMonthDays(year, month) : getWeekDays(currentDate);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(currentDate.getDate() - 7);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() + 7);
      setCurrentDate(next);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedAgendaDate(getTodayString());
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      await updateTaskDate(taskId, targetDate);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const monthLocale = language === 'th' ? 'th-TH' : 'en-US';
  const monthName = currentDate.toLocaleString(monthLocale, { month: 'long', year: 'numeric' });

  // Agenda week strip calculation
  const agendaWeekDays = getWeekDays(currentDate);
  const agendaTasks = filteredTasks.filter((t) => t.dueDate === selectedAgendaDate);

  return (
    <div className="space-y-4 animate-fade-in pb-16 sm:pb-0">
      {/* Calendar Header / Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
            <CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {monthName}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              {t('calendarDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle (Agenda / Month / Week) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('agendaView')}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('monthView')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all hidden sm:block ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('weekView')}
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {t('todayBtn')}
          </button>

          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Agenda View Mode */}
      {viewMode === 'agenda' ? (
        <div className="space-y-4">
          {/* Horizontal Day Selector Strip */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
              {agendaWeekDays.map((d) => {
                const isSelected = selectedAgendaDate === d.dateString;
                const hasTasks = filteredTasks.some((t) => t.dueDate === d.dateString);
                const dayLabel = weekdays[new Date(d.dateString).getDay()];

                return (
                  <button
                    key={d.dateString}
                    onClick={() => setSelectedAgendaDate(d.dateString)}
                    className={`flex flex-col items-center justify-center min-w-[48px] py-2 px-1.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
                        : d.isToday
                        ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase">{dayLabel}</span>
                    <span className="text-base font-extrabold my-0.5">{d.dayNumber}</span>
                    <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: hasTasks ? (isSelected ? '#ffffff' : '#6366f1') : 'transparent' }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agenda Tasks for Selected Day */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t('tasksOnDate', { date: formatDate(selectedAgendaDate) })}
              </h3>
              <button
                onClick={() => onOpenCreateModal('todo', selectedAgendaDate)}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('addTaskOnDate')}
              </button>
            </div>

            <div className="space-y-2.5">
              {agendaTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t('noTasksOnDate')}
                </div>
              ) : (
                agendaTasks.map((task) => {
                  const matchedCat = categories.find((c) => c.name === task.category);
                  const catColor = matchedCat?.color || 'bg-brand-50 text-brand-600';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catColor}`}>
                            {task.category}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 capitalize">
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Grid Mode (Month / Week) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day of week headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2.5">
              {weekdays.map((day, idx) => (
                <div
                  key={day}
                  className={`text-xs font-bold ${
                    idx === 0 || idx === 6
                      ? 'text-rose-500/80 dark:text-rose-400/80'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid matrix */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
              {days.map((day) => {
                const dayTasks = filteredTasks.filter((t) => t.dueDate === day.dateString);
                const isDragTarget = dragOverDate === day.dateString;

                return (
                  <div
                    key={day.dateString}
                    onDragOver={(e) => handleDragOver(e, day.dateString)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day.dateString)}
                    className={`p-1.5 sm:p-2 transition-colors flex flex-col group relative ${
                      viewMode === 'month' ? 'min-h-[100px] sm:min-h-[140px]' : 'min-h-[180px] sm:min-h-[220px]'
                    } ${
                      !day.isCurrentMonth
                        ? 'bg-slate-50/50 dark:bg-slate-950/40 opacity-40'
                        : 'bg-white dark:bg-slate-900'
                    } ${
                      day.isToday
                        ? 'ring-2 ring-inset ring-brand-500/30 bg-brand-50/10 dark:bg-brand-950/20'
                        : ''
                    } ${
                      isDragTarget
                        ? 'bg-brand-100/60 dark:bg-brand-900/40 ring-2 ring-brand-500'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                          day.isToday
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      <button
                        onClick={() => onOpenCreateModal('todo', day.dateString)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
                        title={`Add task on ${day.dateString}`}
                        aria-label={`Add task on ${day.dateString}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Task Cards in this Day */}
                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] sm:max-h-[120px] pr-0.5">
                      {dayTasks.map((task) => {
                        const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
                        const priorityColor = {
                          urgent: 'border-l-rose-500',
                          high: 'border-l-amber-500',
                          medium: 'border-l-blue-500',
                          low: 'border-l-slate-400',
                        }[task.priority];

                        const statusBg = {
                          todo: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
                          in_progress: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
                          review: 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800',
                          completed: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 line-through opacity-70',
                        }[task.status];

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleCardDragStart(e, task)}
                            onClick={() => onEditTask(task)}
                            className={`p-1 rounded text-[10px] sm:text-[11px] font-semibold border border-l-3 shadow-2xs cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${priorityColor} ${statusBg}`}
                            title={`${task.title} (${task.priority} priority - ${task.status})`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate flex-1">{task.title}</span>
                              {overdue && (
                                <AlertCircle className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
