import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  MoreVertical, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  GripVertical, 
  CheckSquare,
  GitBranch
} from 'lucide-react';
import { Task, TaskStatus } from '../../types/task';
import { formatDate, formatShortDate, isOverdue } from '../../utils/date';
import { getTaskDependencyStatus } from '../../utils/dependencies';
import { getCategoryBadgeStyle } from '../../utils/category';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, compact = false }) => {
  const { tasks, deleteTask, updateTaskStatus, categories } = useTasks();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
  const depStatus = getTaskDependencyStatus(task, tasks);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getNextStatus = (curr: TaskStatus): TaskStatus | null => {
    switch (curr) {
      case 'todo': return 'in_progress';
      case 'in_progress': return 'review';
      case 'review': return 'completed';
      case 'completed': return null;
    }
  };

  const getPrevStatus = (curr: TaskStatus): TaskStatus | null => {
    switch (curr) {
      case 'todo': return null;
      case 'in_progress': return 'todo';
      case 'review': return 'in_progress';
      case 'completed': return 'review';
    }
  };

  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  const statusLabel = {
    todo: t('toDoCol'),
    in_progress: t('inProgressCol'),
    review: t('reviewCol'),
    completed: t('completedCol'),
  };

  const priorityLabels = {
    low: { bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', label: t('low') },
    medium: { bg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/40', label: t('medium') },
    high: { bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40', label: t('high') },
    urgent: { bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]', label: t('urgent') },
  };

  // Find color for task's category
  const categoryStyle = getCategoryBadgeStyle(task.category, categories);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-[#fdfcf9] dark:bg-[#0d152a]/95 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-cyan-400 shadow-[0_0_30px_#00f5ff]'
          : depStatus.hasWarning
          ? 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40'
          : overdue
          ? 'border-rose-400 dark:border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
          : 'border-[#ded5c2] dark:border-cyan-500/20 shadow-xs hover:border-amber-400/60 dark:hover:border-cyan-400/50 hover:shadow-xs dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      }`}
    >
      {/* Top Header: Category & Priority & Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            style={categoryStyle.style}
            className={`text-[10px] px-2 py-0.5 rounded-md ${categoryStyle.className}`}
          >
            {task.category}
          </span>
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              priorityLabels[task.priority].bg
            }`}
          >
            {priorityLabels[task.priority].label}
          </span>

          {/* Dependency Blocked Badge */}
          {depStatus.isBlocked && (
            <span 
              className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                depStatus.hasWarning
                  ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/50 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40'
              }`}
              title={
                depStatus.hasWarning
                  ? `งานต้นทาง (${depStatus.delayedBy.map((p) => p.title).join(', ')}) ล่าช้า!`
                  : `ต้องรองาน (${depStatus.blockedBy.map((p) => p.title).join(', ')}) เสร็จก่อน`
              }
            >
              <GitBranch className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>{depStatus.hasWarning ? '⚠️ ' : '🔒 '}{depStatus.blockedBy.length}</span>
            </span>
          )}
        </div>

        {/* Drag handle & Actions */}
        <div className="flex items-center gap-1">
          <div className="text-slate-400 dark:text-cyan-500/40 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-cyan-300 hover:bg-[#ede7d8]/60 dark:hover:bg-cyan-500/10 transition-colors focus:outline-none"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-44 bg-[#fdfcf9] dark:bg-slate-950 rounded-xl shadow-xl border border-[#ded5c2] dark:border-cyan-500/30 py-1 z-30 animate-fade-in text-xs font-mono"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-[#ede7d8]/60 dark:hover:bg-cyan-500/10"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>{t('editTaskModalTitle')}</span>
                </button>
                {nextStatus && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      updateTaskStatus(task.id, nextStatus);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-[#ede7d8]/60 dark:hover:bg-cyan-500/10"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>{statusLabel[nextStatus]}</span>
                  </button>
                )}
                {prevStatus && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      updateTaskStatus(task.id, prevStatus);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-[#ede7d8]/60 dark:hover:bg-cyan-500/10"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>{statusLabel[prevStatus]}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    deleteTask(task.id);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clearAllTasks').split(' ')[0]}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={() => onEdit(task)}
        className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
      >
        {task.title}
      </h3>

      {/* Description */}
      {!compact && task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-600 dark:text-cyan-300/90 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>SUBTASKS</span>
            </span>
            <span className="font-bold">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#ede7d8] dark:bg-slate-900 rounded-full overflow-hidden border border-[#ded5c2] dark:border-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full energy-stripes ${
                completedSubtasks === totalSubtasks
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  : 'bg-cyan-500 shadow-[0_0_8px_#00f5ff]'
              }`}
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#ede7d8]/70 text-slate-800 border border-[#ded5c2] dark:bg-slate-900/90 dark:text-cyan-300 dark:border-cyan-500/30"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Date Range & Mobile Quick Advance */}
      <div className="flex items-center justify-between pt-2 border-t border-[#ded5c2] dark:border-cyan-500/15 text-xs">
        <div
          className={`flex items-center gap-1.5 font-mono text-[11px] font-semibold ${
            overdue || depStatus.hasWarning
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-slate-600 dark:text-cyan-300/90'
          }`}
        >
          {depStatus.hasWarning || overdue ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-bounce" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          )}
          <span>
            {task.startDate && task.startDate !== task.dueDate
              ? `${formatShortDate(task.startDate)} → ${formatShortDate(task.dueDate)}`
              : formatDate(task.dueDate)}
          </span>
        </div>

        {/* Mobile Quick Advance Action */}
        <div className="flex items-center gap-1">
          {nextStatus && (
            <button
              onClick={() => updateTaskStatus(task.id, nextStatus)}
              className="md:hidden flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold text-cyan-700 bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 dark:text-cyan-300 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 dark:border-cyan-500/40 rounded-lg transition-all active:scale-95 shadow-xs"
            >
              <span>{statusLabel[nextStatus]}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'completed' && (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('done')}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
