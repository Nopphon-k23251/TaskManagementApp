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
  CheckSquare
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import { formatDate, isOverdue } from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, compact = false }) => {
  const { deleteTask, updateTaskStatus, categories } = useTasks();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

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
    low: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', label: t('low') },
    medium: { bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400', label: t('medium') },
    high: { bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400', label: t('high') },
    urgent: { bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400', label: t('urgent') },
  };

  // Find color for task's category
  const matchedCategory = categories.find((c) => c.name === task.category);
  const categoryColor = matchedCategory?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white dark:bg-slate-800/90 rounded-2xl p-4 border transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-lg ${
        isDragging
          ? 'opacity-40 scale-95 border-brand-500 shadow-2xl'
          : overdue
          ? 'border-rose-300 dark:border-rose-800/80 shadow-xs'
          : 'border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-brand-300 dark:hover:border-brand-700'
      }`}
    >
      {/* Top Header: Category & Priority & Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${categoryColor}`}
          >
            {task.category}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              priorityLabels[task.priority].bg
            }`}
          >
            {priorityLabels[task.priority].label}
          </span>
        </div>

        {/* Drag handle & Actions */}
        <div className="flex items-center gap-1">
          <div className="text-slate-300 dark:text-slate-600 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 animate-fade-in text-xs"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-500" />
                  {t('editTaskModalTitle')}
                </button>
                {nextStatus && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      updateTaskStatus(task.id, nextStatus);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                    {statusLabel[nextStatus]}
                  </button>
                )}
                {prevStatus && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      updateTaskStatus(task.id, prevStatus);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
                    {statusLabel[prevStatus]}
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
                  {t('clearAllTasks').split(' ')[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={() => onEdit(task)}
        className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
      >
        {task.title}
      </h3>

      {/* Description */}
      {!compact && task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-brand-500" />
              {t('subtasksLabel')}
            </span>
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                completedSubtasks === totalSubtasks
                  ? 'bg-emerald-500'
                  : 'bg-brand-500'
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
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Due Date & Mobile Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
        <div
          className={`flex items-center gap-1.5 font-medium ${
            overdue
              ? 'text-rose-600 dark:text-rose-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {overdue ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{formatDate(task.dueDate)}</span>
        </div>

        {/* Mobile Quick Move Pill */}
        <div className="flex items-center gap-1">
          {nextStatus && (
            <button
              onClick={() => updateTaskStatus(task.id, nextStatus)}
              className="md:hidden flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <span>{statusLabel[nextStatus]}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'completed' && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('done')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
