import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  Square,
  Zap,
  ListTree
} from 'lucide-react';
import { Task, TaskStatus } from '../../types/task';
import { 
  getMonthDays, 
  getWeekDays, 
  formatDate, 
  getTodayString, 
  getDaysDifference,
  CalendarDay 
} from '../../utils/date';
import { getCategoryBadgeStyle } from '../../utils/category';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface CalendarViewProps {
  onOpenCreateModal: (defaultStatus?: TaskStatus, defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
}

/**
 * Checks if a task is active, occurring, or due on a given date.
 */
export function isTaskOnDate(task: Task, dateStr: string): boolean {
  const start = task.startDate || task.dueDate;
  const end = task.dueDate;
  return start <= dateStr && dateStr <= end;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenCreateModal,
  onEditTask,
}) => {
  const { filteredTasks, updateTaskDate, updateTaskStatus, categories } = useTasks();
  const { language, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('agenda');
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(getTodayString());
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const weekdays = language === 'th'
    ? ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

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

  // Month Title string
  const monthTitle = language === 'th'
    ? `${thaiMonths[month]} ${year + 543}`
    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Agenda tasks active or due on the selected date
  const agendaTasks = useMemo(() => {
    const matched = filteredTasks.filter((t) => isTaskOnDate(t, selectedAgendaDate));

    return matched.sort((a, b) => {
      // 1. Completed tasks sink to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // 2. Tasks with specific startTime come first chronologically
      const aTime = a.startTime ? `0_${a.startTime}` : (a.dueTime ? `1_${a.dueTime}` : '2_allDay');
      const bTime = b.startTime ? `0_${b.startTime}` : (b.dueTime ? `1_${b.dueTime}` : '2_allDay');
      if (aTime !== bTime) return aTime.localeCompare(bTime);

      // 3. Fallback to order index
      return (a.order ?? 999) - (b.order ?? 999);
    });
  }, [filteredTasks, selectedAgendaDate]);

  // Detect time collisions/overlaps for tasks scheduled with time slots on this date
  const conflictingTaskIds = useMemo(() => {
    const timed = agendaTasks.filter(
      (t) => t.startTime && t.dueTime && t.status !== 'completed'
    );
    const conflictSet = new Set<string>();

    for (let i = 0; i < timed.length; i++) {
      for (let j = i + 1; j < timed.length; j++) {
        const a = timed[i];
        const b = timed[j];
        if (a.startTime! < b.dueTime! && b.startTime! < a.dueTime!) {
          conflictSet.add(a.id);
          conflictSet.add(b.id);
        }
      }
    }
    return conflictSet;
  }, [agendaTasks]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0 font-sans">
      {/* Sci-Fi Hologram Header Deck */}
      <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-cyan-500/20 shadow-lg dark:shadow-[0_0_25px_rgba(6,182,212,0.06)] p-3.5 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
                [ CALENDAR MATRIX // SCHEDULE ]
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              <span>{monthTitle}</span>
            </h2>
          </div>

          {/* View Toggle & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-cyan-500/30">
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
                }`}
              >
                {t('agendaView')}
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  viewMode === 'month'
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
                }`}
              >
                {t('monthView')}
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  viewMode === 'week'
                    ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
                }`}
              >
                {t('weekView')}
              </button>
            </div>

            {/* Prev / Next / Today */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-cyan-500/30 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-cyan-300 hover:bg-slate-200"
                aria-label="Previous period"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-cyan-500/30 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-cyan-300 hover:bg-slate-200"
              >
                {t('todayBtn')}
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-cyan-500/30 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-cyan-300 hover:bg-slate-200"
                aria-label="Next period"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Renderers */}
      {viewMode === 'agenda' ? (
        /* Mobile-First Agenda Strip & Day Focus */
        <div className="space-y-4">
          {/* Horizontal Agenda Date Strip */}
          <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-cyan-500/20 p-3 shadow-sm overflow-x-auto no-scrollbar">
            <div className="flex gap-2 min-w-max">
              {days.slice(0, 14).map((day) => {
                const isSelected = day.dateString === selectedAgendaDate;
                const tasksOnThisDay = filteredTasks.filter((t) => isTaskOnDate(t, day.dateString));
                const hasDueToday = tasksOnThisDay.some((t) => t.dueDate === day.dateString);
                
                return (
                  <button
                    key={day.dateString}
                    onClick={() => setSelectedAgendaDate(day.dateString)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl min-w-[58px] transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-tr from-brand-600 to-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.4)] scale-105'
                        : day.isToday
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase opacity-75">
                      {weekdays[new Date(day.dateString).getDay()]}
                    </span>
                    <span className="text-base font-mono font-black my-0.5">
                      {day.dayNumber}
                    </span>
                    {tasksOnThisDay.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isSelected 
                            ? 'bg-white shadow-[0_0_6px_#fff]' 
                            : hasDueToday
                            ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                            : 'bg-cyan-400 shadow-[0_0_6px_#00f5ff]'
                        }`} />
                        {tasksOnThisDay.length > 1 && (
                          <span className={`font-mono text-[9px] font-bold ${isSelected ? 'text-white' : 'text-cyan-400'}`}>
                            {tasksOnThisDay.length}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Conflict Banner */}
          {conflictingTaskIds.size > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-400 font-mono">
                    {t('timeConflictBanner', { count: conflictingTaskIds.size })}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {t('timeConflictWarning')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agenda Selected Day Tasks Deck */}
          <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-cyan-500/20 shadow-lg p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-cyan-500/15">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{t('tasksOnDate', { date: formatDate(selectedAgendaDate) })}</span>
                </h3>
                <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-cyan-400/80 truncate block">
                  {agendaTasks.length} {t('tasksCount', { count: agendaTasks.length })}
                </span>
              </div>

              <button
                onClick={() => onOpenCreateModal('todo', selectedAgendaDate)}
                className="hidden sm:flex px-3 py-1.5 text-xs font-mono font-bold text-white bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('addTaskOnDate')}</span>
              </button>
            </div>

            <div className="space-y-3">
              {agendaTasks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-cyan-500/20 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                  <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mb-2">
                    {t('noTasksOnDate')}
                  </p>
                  <button
                    onClick={() => onOpenCreateModal('todo', selectedAgendaDate)}
                    className="font-mono text-xs font-bold text-cyan-400 hover:underline"
                  >
                    + {t('addTaskOnDate')}
                  </button>
                </div>
              ) : (
                agendaTasks.map((task) => {
                  const hasConflict = conflictingTaskIds.has(task.id);
                  const isDueToday = task.dueDate === selectedAgendaDate;
                  const isStartDay = (task.startDate || task.dueDate) === selectedAgendaDate;
                  const isMultiDay = Boolean(task.startDate && task.startDate !== task.dueDate);
                  const totalDays = isMultiDay ? getDaysDifference(task.startDate || task.dueDate, task.dueDate) : 1;
                  const currentDayNum = isMultiDay ? Math.max(1, getDaysDifference(task.startDate || task.dueDate, selectedAgendaDate)) : 1;
                  const completedSubtasks = (task.subtasks || []).filter((st) => st.completed).length;
                  const totalSubtasks = (task.subtasks || []).length;
                  const badgeStyle = getCategoryBadgeStyle(task.category, categories);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={`p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border transition-all cursor-pointer group shadow-xs ${
                        hasConflict
                          ? 'border-rose-500/60 bg-rose-950/10 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                          : task.status === 'completed'
                          ? 'border-emerald-500/30 opacity-70 hover:opacity-100 hover:border-emerald-400'
                          : 'border-slate-200 dark:border-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Top Badges Strip: Time + Category + Status + Multi-day */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Time Slot Pill */}
                            {task.startTime && task.dueTime ? (
                              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                                hasConflict
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                              }`}>
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>{task.startTime} - {task.dueTime} น.</span>
                              </span>
                            ) : task.dueTime ? (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border bg-amber-950/80 text-amber-300 border-amber-500/40 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>กำหนดส่ง {task.dueTime} น.</span>
                              </span>
                            ) : task.startTime ? (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border bg-cyan-950/80 text-cyan-300 border-cyan-500/40 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>เริ่ม {task.startTime} น.</span>
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-cyan-400" />
                                <span>{t('allDayTask')}</span>
                              </span>
                            )}

                            {/* Time Conflict Warning Tag */}
                            {hasConflict && (
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                <span>{t('timeConflictWarning')}</span>
                              </span>
                            )}

                            {/* Category Badge */}
                            <span
                              style={badgeStyle.style}
                              className={`text-[9px] px-1.5 py-0.2 rounded border ${badgeStyle.className}`}
                            >
                              {task.category}
                            </span>

                            {/* Priority Badge */}
                            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              task.priority === 'urgent' ? 'bg-rose-950 text-rose-300' : 'bg-cyan-950 text-cyan-300'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>

                            {/* Multi-day schedule indicator */}
                            {isMultiDay && (
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                                {isDueToday ? '🚩 ' + t('dueOnThisDay') : isStartDay ? '🚀 เริ่มวันนี้' : '🔄 วันที่ ' + currentDayNum + '/' + totalDays}
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <h4 className={`font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition-colors ${
                            task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}>
                            {task.title}
                          </h4>

                          {/* Description Snippet */}
                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Right: Subtasks & Status Quick Toggle */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          {totalSubtasks > 0 && (
                            <span className="font-mono text-[10px] font-bold text-cyan-400/90 bg-cyan-950/50 px-2 py-1 rounded-lg border border-cyan-500/20 flex items-center gap-1">
                              <ListTree className="w-3 h-3" />
                              <span>{completedSubtasks}/{totalSubtasks}</span>
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed');
                            }}
                            className="p-1 rounded-lg hover:bg-cyan-500/10 transition-colors"
                            title={task.status === 'completed' ? t('toDoCol') : t('completedCol')}
                          >
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Matrix Grid (Month & Week) */
        <div className="bg-white/90 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-cyan-500/20 shadow-2xl overflow-hidden bg-cyber-grid">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-cyan-500/20 bg-slate-900/95 dark:bg-[#070b14]/95 text-center font-mono text-[11px] font-bold py-3 text-cyan-400">
            {weekdays.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-cyan-500/10">
            {days.map((day) => {
              const dayTasks = filteredTasks.filter((t) => isTaskOnDate(t, day.dateString));
              const isOver = dragOverDate === day.dateString;
              return (
                <div
                  key={day.dateString}
                  onDragOver={(e) => handleDragOver(e, day.dateString)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.dateString)}
                  onClick={() => onOpenCreateModal('todo', day.dateString)}
                  className={`min-h-[95px] sm:min-h-[115px] p-1.5 sm:p-2 transition-colors relative cursor-pointer group ${
                    day.isCurrentMonth ? 'bg-transparent' : 'opacity-40 bg-slate-900/40'
                  } ${
                    isOver
                      ? 'bg-cyan-500/20 ring-2 ring-cyan-400 shadow-[0_0_20px_#00f5ff]'
                      : day.isToday
                      ? 'bg-cyan-500/10 shadow-[inset_0_0_12px_rgba(6,182,212,0.2)]'
                      : 'hover:bg-cyan-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-mono text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        day.isToday
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_#00f5ff]'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="font-mono text-[9px] font-bold text-cyan-400/80">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleCardDragStart(e, task)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold truncate border shadow-xs hover:scale-[1.02] transition-all ${
                          task.status === 'completed'
                            ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 line-through opacity-70'
                            : task.startTime || task.dueTime
                            ? 'border-cyan-400/50 bg-cyan-950/80 text-cyan-200 hover:border-cyan-300'
                            : 'border-cyan-500/30 bg-slate-900/90 text-cyan-300 hover:border-cyan-400'
                        }`}
                      >
                        {task.startTime ? `⏰ ${task.startTime} ` : task.dueTime ? `⏰ ${task.dueTime} ` : ''}
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="font-mono text-[9px] text-cyan-400 font-bold px-1 block">
                        +{dayTasks.length - 3} MORE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
