import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  GitBranch, 
  CheckCircle2, 
  Clock,
  Zap,
  Radio
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

    // Buffer range for cyber timeline
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

  // Column width configuration based on zoom level
  const dayWidth = useMemo(() => {
    switch (zoom) {
      case 'day': return 46; // px per day
      case 'week': return 32;
      case 'month': return 18;
    }
  }, [zoom]);

  // Auto-scroll to today marker on mount or zoom change
  useEffect(() => {
    if (timelineContainerRef.current) {
      const todayIndex = timelineDays.findIndex((d) => d.isToday);
      if (todayIndex > 0) {
        const scrollPosition = todayIndex * dayWidth - 180;
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
    const width = Math.max(dayWidth * 0.85, durationDays * dayWidth);

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
    <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-100 font-sans">
      {/* Sci-Fi Hologram Header & Control Console */}
      <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.08)]">
        {/* Ambient Sci-Fi Glow Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title and HUD Status */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
                [ ORCHESTRATION TIMELINE MATRIX // PRO ]
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-950 via-brand-600 to-cyan-600 dark:from-white dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              <span>{t('ganttTitle')}</span>
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {t('ganttSub')}
            </p>
          </div>

          {/* Sci-Fi Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Cyber Zoom Toggle */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-cyan-500/30 shadow-inner">
              {(['day', 'week', 'month'] as ZoomLevel[]).map((lvl) => {
                const label = lvl === 'day' ? t('zoomDay') : lvl === 'week' ? t('zoomWeek') : t('zoomMonth');
                const isSelected = zoom === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setZoom(lvl)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Jump to Today Button */}
            <button
              onClick={() => {
                if (timelineContainerRef.current) {
                  const todayIndex = timelineDays.findIndex((d) => d.isToday);
                  if (todayIndex >= 0) {
                    timelineContainerRef.current.scrollTo({
                      left: Math.max(0, todayIndex * dayWidth - 180),
                      behavior: 'smooth',
                    });
                  }
                }
              }}
              className="px-3.5 py-1.5 text-xs font-mono font-bold text-slate-700 dark:text-cyan-300 bg-slate-100 dark:bg-slate-950/80 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-xl border border-slate-200 dark:border-cyan-500/30 shadow-xs transition-all flex items-center gap-2 group"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-cyan-500 group-hover:animate-spin" />
              <span>{t('todayMarker')}</span>
            </button>

            {/* Futuristic + New Task Button */}
            <button
              onClick={() => onOpenCreateModal('todo')}
              className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-brand-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-[0_0_18px_rgba(6,182,212,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('createTaskBtn')}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-200/80 dark:border-cyan-500/15 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none text-slate-700 dark:text-slate-200 font-medium"
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
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="all">{t('allPriorities')}</option>
              <option value="urgent">{t('urgent')}</option>
              <option value="high">{t('high')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="low">{t('low')}</option>
            </select>
          </div>

          {/* Toggle Dependency Laser Connectors */}
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-cyan-300 select-none text-xs font-mono font-semibold hover:opacity-90 transition-opacity">
            <input
              type="checkbox"
              checked={showDependencyLines}
              onChange={(e) => setShowDependencyLines(e.target.checked)}
              className="rounded border-slate-300 dark:border-cyan-500/40 text-cyan-500 focus:ring-cyan-400 w-4 h-4 bg-slate-900"
            />
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('showDependencyLines')}</span>
          </label>
        </div>
      </div>

      {/* Futuristic Plasma Hazard Alert for Delayed Prerequisites */}
      {dependencyAnalysis.delayedWarningCount > 0 && (
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-slate-900/80 border border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.25)] flex items-start gap-3.5 animate-fade-in backdrop-blur-md">
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold uppercase tracking-wider">
                [ HAZARD // CRITICAL IMPACT ]
              </span>
              <h4 className="font-black text-rose-200">
                {t('delayedWarningTitle')} ({dependencyAnalysis.delayedWarningCount} งานที่ได้รับผลกระทบ)
              </h4>
            </div>
            <p className="text-rose-200/90 leading-relaxed text-xs">
              มีงานต้นทางที่เลยกำหนดส่งหรือเลื่อนทับวันเริ่มต้นของงานถัดไป กรุณาตรวจสอบแท่งไทม์ไลน์ที่มีสัญลักษณ์ ⚠️ และเส้นเลเซอร์สีแดง
            </p>
          </div>
        </div>
      )}

      {/* Main Sci-Fi Gantt Matrix Deck */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 dark:border-cyan-500/20 shadow-2xl overflow-hidden flex flex-col bg-cyber-grid">
        <div className="flex flex-1 min-h-[480px] overflow-hidden relative">
          {/* Left Column: Task Control Deck (Sticky) */}
          <div className="w-64 sm:w-80 shrink-0 border-r border-slate-800 dark:border-cyan-500/20 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md flex flex-col z-20">
            {/* Left Header Deck */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 dark:border-cyan-500/20 bg-slate-900/95 dark:bg-[#070b14]/95 font-mono text-[11px] font-bold text-slate-400 dark:text-cyan-400/90 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>TASKS [{displayTasks.length}]</span>
              </span>
              <span>{t('taskDurationDays', { days: '' }).trim()}</span>
            </div>

            {/* Task Row Headers List */}
            <div className="divide-y divide-slate-800/80 dark:divide-cyan-500/10 overflow-y-auto">
              {displayTasks.map((task) => {
                const depStatus = getTaskDependencyStatus(task, filteredTasks);
                const duration = getDaysDifference(task.startDate || task.dueDate, task.dueDate);
                const matchedCategory = categories.find((c) => c.name === task.category);
                const categoryClass = matchedCategory?.color || 'bg-slate-800 text-slate-300 border-slate-700';

                return (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="h-14 px-3.5 flex items-center justify-between hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-cyan-400"
                  >
                    <div className="overflow-hidden pr-2 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border truncate max-w-[90px] ${categoryClass}`}>
                          {task.category}
                        </span>

                        {depStatus.isBlocked && (
                          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            <GitBranch className="w-2.5 h-2.5" />
                            {depStatus.blockedBy.length}
                          </span>
                        )}

                        {depStatus.hasWarning && (
                          <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                            ⚠️
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-xs text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                        {task.title}
                      </p>
                    </div>

                    <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-cyan-400/80 shrink-0">
                      {duration}d
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
              <div className="h-14 sticky top-0 z-10 flex border-b border-slate-800 dark:border-cyan-500/20 bg-slate-900/95 dark:bg-[#070b14]/95 backdrop-blur-md">
                {timelineDays.map((day) => (
                  <div
                    key={day.dateStr}
                    style={{ width: `${dayWidth}px` }}
                    className={`shrink-0 flex flex-col items-center justify-center border-r border-slate-800/80 dark:border-cyan-500/10 font-mono text-[10px] transition-colors ${
                      day.isToday
                        ? 'bg-cyan-500/15 text-cyan-300 font-black shadow-[inset_0_0_12px_rgba(6,182,212,0.2)]'
                        : day.isWeekend
                        ? 'bg-slate-900/60 text-slate-500 font-medium'
                        : 'text-slate-400 font-semibold'
                    }`}
                  >
                    <span className="text-[9px] tracking-tighter opacity-80">{day.monthName} {day.dayNumber}</span>
                    <span className="text-[10px] font-bold uppercase">{day.weekdayName}</span>
                  </div>
                ))}
              </div>

              {/* Vertical Grid Columns & Futuristic Today Laser Line */}
              <div className="absolute inset-0 top-14 flex pointer-events-none">
                {timelineDays.map((day) => (
                  <div
                    key={'grid-' + day.dateStr}
                    style={{ width: `${dayWidth}px` }}
                    className={`shrink-0 border-r border-slate-800/50 dark:border-cyan-500/5 ${
                      day.isToday
                        ? 'bg-cyan-500/5 relative'
                        : day.isWeekend
                        ? 'bg-slate-950/40'
                        : ''
                    }`}
                  >
                    {day.isToday && (
                      <>
                        {/* Emitting Laser Beacon at Top */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cyan-400 rotate-45 z-20 shadow-[0_0_10px_#00f5ff] animate-pulse" />
                        {/* Vertical Laser Beam Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-500 to-indigo-500 z-10 shadow-[0_0_8px_#00f5ff] opacity-90" />
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* SVG Glowing Laser Dependency Connectors */}
              {showDependencyLines && (
                <svg
                  className="absolute inset-0 top-14 pointer-events-none z-10 w-full h-full"
                  style={{ width: `${timelineDays.length * dayWidth}px` }}
                >
                  <defs>
                    {/* Glowing Filters */}
                    <filter id="laser-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00f5ff" floodOpacity="0.8" />
                    </filter>
                    <filter id="laser-glow-delayed" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.9" />
                    </filter>

                    <linearGradient id="laser-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#00f5ff" />
                    </linearGradient>

                    <linearGradient id="laser-delayed-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>

                    <marker
                      id="arrow-cyan"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#00f5ff" />
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
                        <g key={`dep-${parentTask.id}-${task.id}`}>
                          {/* Outer Glow Halo */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isParentDelayed ? '#f43f5e' : '#00f5ff'}
                            strokeWidth={isParentDelayed ? '4' : '3'}
                            opacity="0.3"
                          />
                          {/* Inner Laser Core */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isParentDelayed ? 'url(#laser-delayed-grad)' : 'url(#laser-cyan-grad)'}
                            strokeWidth={isParentDelayed ? '2.5' : '1.8'}
                            strokeDasharray={isParentDelayed ? '5,4' : '6,4'}
                            filter={isParentDelayed ? 'url(#laser-glow-delayed)' : 'url(#laser-glow-cyan)'}
                            markerEnd={isParentDelayed ? 'url(#arrow-delayed)' : 'url(#arrow-cyan)'}
                            className="animate-cyber-flow"
                          />
                          {/* Origin Emitter Dot */}
                          <circle cx={startX} cy={startY} r="3" fill={isParentDelayed ? '#f43f5e' : '#00f5ff'} />
                        </g>
                      );
                    });
                  })}
                </svg>
              )}

              {/* Gantt Task Bars Row List */}
              <div className="divide-y divide-slate-800/60 dark:divide-cyan-500/10 relative z-10">
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
                      {/* Sci-Fi Hologram Task Bar */}
                      <div
                        onMouseDown={(e) => handleBarMouseDown(e, task, 'move')}
                        onClick={() => onEditTask(task)}
                        style={{
                          left: `${geom.left}px`,
                          width: `${geom.width}px`,
                        }}
                        className={`absolute h-8.5 rounded-xl cursor-grab active:cursor-grabbing flex items-center justify-between px-3 transition-all select-none ${
                          isDraggingThis
                            ? 'opacity-85 ring-2 ring-cyan-400 scale-[1.03] shadow-[0_0_25px_#00f5ff]'
                            : ''
                        } ${
                          depStatus.hasWarning
                            ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white border border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                            : depStatus.isBlocked
                            ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-slate-200 border border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                            : task.status === 'completed'
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                            : 'bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 text-white border border-cyan-400/50 shadow-[0_0_18px_rgba(6,182,212,0.35)] hover:border-cyan-300'
                        }`}
                      >
                        {/* Animated Energy Stripes Progress Fill */}
                        <div
                          className="absolute inset-0 bg-white/20 energy-stripes pointer-events-none rounded-xl"
                          style={{ width: `${progress}%` }}
                        />

                        {/* Left Resize Handle */}
                        <div
                          onMouseDown={(e) => handleBarMouseDown(e, task, 'resize-start')}
                          className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/30 rounded-l-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          title="Drag to adjust start date"
                        >
                          <span className="text-[8px] font-bold text-white">«</span>
                        </div>

                        {/* Bar Label Content */}
                        <div className="relative z-10 flex items-center gap-1.5 overflow-hidden pr-1">
                          {depStatus.hasWarning && (
                            <span className="text-xs font-bold shrink-0 animate-bounce">⚠️</span>
                          )}
                          {depStatus.isBlocked && !depStatus.hasWarning && (
                            <span className="text-xs font-bold shrink-0">🔒</span>
                          )}
                          {task.status === 'completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-200" />
                          )}
                          <span className="text-xs font-bold truncate drop-shadow-sm">
                            {task.title}
                          </span>
                        </div>

                        {/* Monospace Progress Pill */}
                        <span className="relative z-10 font-mono text-[10px] font-black shrink-0 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-white/20">
                          {progress}%
                        </span>

                        {/* Right Resize Handle */}
                        <div
                          onMouseDown={(e) => handleBarMouseDown(e, task, 'resize-end')}
                          className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/30 rounded-r-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          title="Drag to adjust due date"
                        >
                          <span className="text-[8px] font-bold text-white">»</span>
                        </div>
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
