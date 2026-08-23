import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  GitBranch, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { Task, TaskStatus } from '../../types/task';
import { 
  getTodayString, 
  getDaysDifference, 
  addDaysToDate, 
  generateTimelineDays
} from '../../utils/date';
import { getTaskDependencyStatus } from '../../utils/dependencies';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface GanttTimelineViewProps {
  onOpenCreateModal: (defaultStatus?: TaskStatus, defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
}

type ZoomLevel = 'day' | 'week' | 'month';

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({
  onOpenCreateModal,
  onEditTask,
}) => {
  const { filteredTasks, updateTask, categories } = useTasks();
  const { language, t } = useLanguage();

  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showDependencyLines, setShowDependencyLines] = useState<boolean>(true);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragAction, setDragAction] = useState<'move' | 'resize-start' | 'resize-end' | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [initialTaskDates, setInitialTaskDates] = useState<{ start: string; due: string } | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Filter tasks for Gantt
  const displayTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      return true;
    });
  }, [filteredTasks, selectedCategory, selectedPriority]);

  // Determine timeline boundary
  const timelineRange = useMemo(() => {
    const today = getTodayString();
    let minDate = today;
    let maxDate = today;

    if (displayTasks.length > 0) {
      displayTasks.forEach((t) => {
        const start = t.startDate || t.dueDate;
        const due = t.dueDate;
        if (start < minDate) minDate = start;
        if (due > maxDate) maxDate = due;
      });
    }

    // Add buffer days: 3 days before min, 10 days after max
    const startRange = addDaysToDate(minDate, -4);
    const endRange = addDaysToDate(maxDate, zoom === 'month' ? 45 : zoom === 'week' ? 21 : 14);
    const totalDays = Math.max(20, getDaysDifference(startRange, endRange));

    return {
      startDate: startRange,
      endDate: endRange,
      totalDays,
    };
  }, [displayTasks, zoom]);

  const timelineDays = useMemo(() => {
    return generateTimelineDays(timelineRange.startDate, timelineRange.totalDays, language);
  }, [timelineRange, language]);

  // Column width configuration based on zoom
  const dayWidth = useMemo(() => {
    switch (zoom) {
      case 'day': return 42; // px per day
      case 'week': return 28;
      case 'month': return 16;
    }
  }, [zoom]);

  // Auto-scroll to today marker on mount or zoom change
  useEffect(() => {
    if (timelineContainerRef.current) {
      const todayIndex = timelineDays.findIndex((d) => d.isToday);
      if (todayIndex > 0) {
        const scrollPosition = todayIndex * dayWidth - 160;
        timelineContainerRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth',
        });
      }
    }
  }, [timelineDays, dayWidth]);

  // Count blocked and delayed tasks for top warning banner
  const dependencyAnalysis = useMemo(() => {
    let blockedCount = 0;
    let delayedWarningCount = 0;
    const delayedTasksList: { child: Task; parent: Task }[] = [];

    displayTasks.forEach((task) => {
      const status = getTaskDependencyStatus(task, filteredTasks);
      if (status.isBlocked) blockedCount++;
      if (status.hasWarning) {
        delayedWarningCount++;
        status.delayedBy.forEach((p) => {
          delayedTasksList.push({ child: task, parent: p });
        });
      }
    });

    return { blockedCount, delayedWarningCount, delayedTasksList };
  }, [displayTasks, filteredTasks]);

  // Compute Task Bar geometry
  const getTaskBarGeometry = (task: Task) => {
    const startStr = task.startDate || task.dueDate;
    const dueStr = task.dueDate;
    const offsetDays = getDaysDifference(timelineRange.startDate, startStr) - 1;
    const durationDays = getDaysDifference(startStr, dueStr);

    const left = Math.max(0, offsetDays * dayWidth);
    const width = Math.max(dayWidth * 0.8, durationDays * dayWidth);

    return { left, width, startStr, dueStr, durationDays };
  };

  // Drag to Reschedule Handlers
  const handleBarMouseDown = (
    e: React.MouseEvent,
    task: Task,
    action: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    setDraggingTaskId(task.id);
    setDragAction(action);
    setDragStartX(e.clientX);
    setInitialTaskDates({
      start: task.startDate || task.dueDate,
      due: task.dueDate,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingTaskId || !dragAction || !initialTaskDates) return;

      const deltaX = e.clientX - dragStartX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (deltaDays === 0) return;

      if (dragAction === 'move') {
        const newStart = addDaysToDate(initialTaskDates.start, deltaDays);
        const newDue = addDaysToDate(initialTaskDates.due, deltaDays);
        updateTask(draggingTaskId, { startDate: newStart, dueDate: newDue });
      } else if (dragAction === 'resize-end') {
        const newDue = addDaysToDate(initialTaskDates.due, deltaDays);
        if (newDue >= initialTaskDates.start) {
          updateTask(draggingTaskId, { dueDate: newDue });
        }
      } else if (dragAction === 'resize-start') {
        const newStart = addDaysToDate(initialTaskDates.start, deltaDays);
        if (newStart <= initialTaskDates.due) {
          updateTask(draggingTaskId, { startDate: newStart });
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingTaskId(null);
      setDragAction(null);
      setInitialTaskDates(null);
    };

    if (draggingTaskId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTaskId, dragAction, dragStartX, initialTaskDates, dayWidth, updateTask]);

  return (
    <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Top Header & Control Toolbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-slate-900 via-brand-600 to-indigo-600 dark:from-white dark:via-brand-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-500" />
              <span>{t('ganttTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('ganttSub')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setZoom('day')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  zoom === 'day'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t('zoomDay')}
              </button>
              <button
                onClick={() => setZoom('week')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  zoom === 'week'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t('zoomWeek')}
              </button>
              <button
                onClick={() => setZoom('month')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  zoom === 'month'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t('zoomMonth')}
              </button>
            </div>

            {/* Jump to Today */}
            <button
              onClick={() => {
                if (timelineContainerRef.current) {
                  const todayIndex = timelineDays.findIndex((d) => d.isToday);
                  if (todayIndex >= 0) {
                    timelineContainerRef.current.scrollTo({
                      left: Math.max(0, todayIndex * dayWidth - 160),
                      behavior: 'smooth',
                    });
                  }
                }
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-brand-500" />
              <span>{t('todayMarker')}</span>
            </button>

            {/* Create Task Button */}
            <button
              onClick={() => onOpenCreateModal('todo')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('createTaskBtn')}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 outline-none"
            >
              <option value="all">{t('allPriorities')}</option>
              <option value="urgent">{t('urgent')}</option>
              <option value="high">{t('high')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="low">{t('low')}</option>
            </select>
          </div>

          {/* Toggle Dependency Lines */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none text-[11px] font-medium">
            <input
              type="checkbox"
              checked={showDependencyLines}
              onChange={(e) => setShowDependencyLines(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <GitBranch className="w-3.5 h-3.5 text-brand-500" />
            <span>{t('showDependencyLines')}</span>
          </label>
        </div>
      </div>

      {/* Visual Warning Alert Banner for Delayed Prerequisites */}
      {dependencyAnalysis.delayedWarningCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 animate-fade-in shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
              <span>{t('delayedWarningTitle')}</span>
              <span className="px-2 py-0.2 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-300 rounded-full text-[10px]">
                {dependencyAnalysis.delayedWarningCount} งานที่ได้รับผลกระทบ
              </span>
            </h4>
            <p className="text-rose-800 dark:text-rose-300 leading-relaxed text-[11px]">
              มีงานต้นทางที่ล่าช้าหรือเลยกำหนดส่ง ซึ่งอาจส่งผลให้งานลำดับถัดไปเริ่มไม่ทันตามกำหนดการ กรุณาตรวจสอบแท่งไทม์ไลน์ที่มีสัญลักษณ์ ⚠️
            </p>
          </div>
        </div>
      )}

      {/* Main Gantt Timeline Matrix Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-1 min-h-[460px] overflow-hidden relative">
          {/* Left Column: Task Info Sidebar (Sticky) */}
          <div className="w-64 sm:w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col z-20">
            {/* Left Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>{t('taskTitleLabel')} ({displayTasks.length})</span>
              <span>{t('taskDurationDays', { days: '' }).trim()}</span>
            </div>

            {/* Task Row Headers List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto">
              {displayTasks.map((task) => {
                const depStatus = getTaskDependencyStatus(task, filteredTasks);
                const duration = getDaysDifference(task.startDate || task.dueDate, task.dueDate);
                const matchedCategory = categories.find((c) => c.name === task.category);
                const categoryClass = matchedCategory?.color || 'bg-slate-100 text-slate-700';

                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="h-14 px-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <div className="overflow-hidden pr-2 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border truncate max-w-[90px] ${categoryClass}`}>
                          {task.category}
                        </span>

                        {depStatus.isBlocked && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <GitBranch className="w-2.5 h-2.5" />
                            {depStatus.blockedBy.length}
                          </span>
                        )}

                        {depStatus.hasWarning && (
                          <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                            ⚠️
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {task.title}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      {duration} วัน
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Timeline Canvas (Scrollable Grid) */}
          <div
            ref={timelineContainerRef}
            className="flex-1 overflow-x-auto overflow-y-hidden relative select-none"
            style={{ minWidth: 0 }}
          >
            {/* Timeline Width Container */}
            <div
              className="relative"
              style={{ width: `${timelineDays.length * dayWidth}px` }}
            >
              {/* Sticky Timeline Date Header */}
              <div className="h-14 sticky top-0 z-10 flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm">
                {timelineDays.map((day) => (
                  <div
                    key={day.dateStr}
                    style={{ width: `${dayWidth}px` }}
                    className={`shrink-0 flex flex-col items-center justify-center border-r border-slate-200/60 dark:border-slate-700/60 text-[10px] ${
                      day.isToday
                        ? 'bg-brand-50/80 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-extrabold'
                        : day.isWeekend
                        ? 'bg-slate-200/30 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 font-medium'
                        : 'text-slate-600 dark:text-slate-400 font-medium'
                    }`}
                  >
                    <span className="text-[9px] opacity-75">{day.monthName} {day.dayNumber}</span>
                    <span className="text-[10px] font-bold">{day.weekdayName}</span>
                  </div>
                ))}
              </div>

              {/* Vertical Grid Columns & Today Marker Line */}
              <div className="absolute inset-0 top-14 flex pointer-events-none">
                {timelineDays.map((day) => (
                  <div
                    key={'grid-' + day.dateStr}
                    style={{ width: `${dayWidth}px` }}
                    className={`shrink-0 border-r border-slate-100 dark:border-slate-800/40 ${
                      day.isToday
                        ? 'bg-brand-50/20 dark:bg-brand-950/20 relative'
                        : day.isWeekend
                        ? 'bg-slate-50/40 dark:bg-slate-900/30'
                        : ''
                    }`}
                  >
                    {day.isToday && (
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-rose-500 z-10 opacity-80" />
                    )}
                  </div>
                ))}
              </div>

              {/* SVG Dependency Connector Lines */}
              {showDependencyLines && (
                <svg
                  className="absolute inset-0 top-14 pointer-events-none z-10 w-full h-full"
                  style={{ width: `${timelineDays.length * dayWidth}px` }}
                >
                  <defs>
                    <marker
                      id="arrow-normal"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#6366f1" />
                    </marker>
                    <marker
                      id="arrow-delayed"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" />
                    </marker>
                  </defs>

                  {displayTasks.map((task, childIdx) => {
                    if (!task.dependencies || task.dependencies.length === 0) return null;
                    const childGeom = getTaskBarGeometry(task);
                    const childY = childIdx * 56 + 28; // row center

                    return task.dependencies.map((depId) => {
                      const parentIdx = displayTasks.findIndex((t) => t.id === depId);
                      if (parentIdx === -1) return null;
                      const parentTask = displayTasks[parentIdx];
                      const parentGeom = getTaskBarGeometry(parentTask);
                      const parentY = parentIdx * 56 + 28;

                      const startX = parentGeom.left + parentGeom.width;
                      const startY = parentY;
                      const endX = childGeom.left;
                      const endY = childY;

                      const isParentDelayed = parentTask.status !== 'completed' && (
                        parentGeom.dueStr > childGeom.startStr || parentGeom.dueStr < getTodayString()
                      );

                      const midX = (startX + endX) / 2;
                      const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                      return (
                        <path
                          key={`dep-${parentTask.id}-${task.id}`}
                          d={pathD}
                          fill="none"
                          stroke={isParentDelayed ? '#f43f5e' : '#818cf8'}
                          strokeWidth={isParentDelayed ? '2.5' : '1.5'}
                          strokeDasharray={isParentDelayed ? '4,3' : 'none'}
                          markerEnd={isParentDelayed ? 'url(#arrow-delayed)' : 'url(#arrow-normal)'}
                          className="transition-all duration-300"
                        />
                      );
                    });
                  })}
                </svg>
              )}

              {/* Gantt Task Bars Row List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40 relative z-10">
                {displayTasks.map((task) => {
                  const geom = getTaskBarGeometry(task);
                  const depStatus = getTaskDependencyStatus(task, filteredTasks);
                  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                  const totalSubtasks = task.subtasks.length;
                  const progress = task.status === 'completed' 
                    ? 100 
                    : totalSubtasks > 0 
                    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
                    : task.status === 'in_progress' ? 50 : 0;

                  const isDraggingThis = draggingTaskId === task.id;

                  return (
                    <div key={'row-' + task.id} className="h-14 relative flex items-center">
                      {/* Horizontal Gantt Bar */}
                      <div
                        onMouseDown={(e) => handleBarMouseDown(e, task, 'move')}
                        onClick={() => onEditTask(task)}
                        style={{
                          left: `${geom.left}px`,
                          width: `${geom.width}px`,
                        }}
                        className={`absolute h-8 rounded-xl shadow-md cursor-grab active:cursor-grabbing flex items-center justify-between px-2.5 transition-all overflow-hidden ${
                          isDraggingThis ? 'opacity-75 ring-2 ring-brand-400 scale-[1.02] shadow-xl' : ''
                        } ${
                          depStatus.hasWarning
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white ring-2 ring-rose-400 animate-pulse'
                            : depStatus.isBlocked
                            ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white opacity-90'
                            : task.status === 'completed'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                            : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white'
                        }`}
                      >
                        {/* Inner Progress Fill */}
                        <div
                          className="absolute inset-0 bg-black/20 pointer-events-none rounded-xl"
                          style={{ width: `${progress}%` }}
                        />

                        {/* Left Resize Handle */}
                        <div
                          onMouseDown={(e) => handleBarMouseDown(e, task, 'resize-start')}
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40"
                          title="Drag to change start date"
                        />

                        {/* Bar Label Content */}
                        <div className="relative z-10 flex items-center gap-1.5 overflow-hidden pr-1">
                          {depStatus.hasWarning && (
                            <span className="text-xs font-bold shrink-0">⚠️</span>
                          )}
                          {depStatus.isBlocked && !depStatus.hasWarning && (
                            <span className="text-xs font-bold shrink-0">🔒</span>
                          )}
                          {task.status === 'completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="text-xs font-bold truncate">
                            {task.title}
                          </span>
                        </div>

                        {/* Progress text */}
                        <span className="relative z-10 text-[10px] font-extrabold shrink-0 bg-black/25 px-1.5 py-0.2 rounded-md">
                          {progress}%
                        </span>

                        {/* Right Resize Handle */}
                        <div
                          onMouseDown={(e) => handleBarMouseDown(e, task, 'resize-end')}
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40"
                          title="Drag to change due date"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
