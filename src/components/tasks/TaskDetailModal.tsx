import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Tag, 
  CheckSquare, 
  Square, 
  GitBranch, 
  Edit3, 
  Trash2, 
  ExternalLink
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { getCategoryBadgeStyle } from '../../utils/category';
import { getDaysDifference, formatDateLocale } from '../../utils/date';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
}) => {
  const { tasks, categories, toggleSubtask, deleteTask } = useTasks();
  const { language, t } = useLanguage();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!task) return null;

  // Always use the latest live task state from TaskContext
  const currentTask = tasks.find((t) => t.id === task.id) || task;

  const categoryStyle = getCategoryBadgeStyle(currentTask.category, categories);
  const duration = getDaysDifference(currentTask.startDate || currentTask.dueDate, currentTask.dueDate);
  const completedSubtasks = (currentTask.subtasks || []).filter((st) => st.completed).length;
  const totalSubtasks = (currentTask.subtasks || []).length;
  const progressPercent = currentTask.status === 'completed'
    ? 100
    : totalSubtasks > 0
    ? Math.round((completedSubtasks / totalSubtasks) * 100)
    : currentTask.status === 'in_progress' ? 50 : 0;

  // Status Badge Config
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return {
          label: t('toDoCol'),
          className: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
      case 'in_progress':
        return {
          label: t('inProgressCol'),
          className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
          dot: 'bg-cyan-400 shadow-[0_0_8px_#00f5ff] animate-pulse',
        };
      case 'review':
        return {
          label: t('reviewCol'),
          className: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400',
        };
      case 'completed':
        return {
          label: t('completedCol'),
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
    }
  };

  // Priority Badge Config
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          label: t('urgent'),
          className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-black animate-pulse',
        };
      case 'high':
        return {
          label: t('high'),
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold',
        };
      case 'medium':
        return {
          label: t('medium'),
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        };
      case 'low':
        return {
          label: t('low'),
          className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
        };
    }
  };

  const statusBadge = getStatusBadge(currentTask.status);
  const priorityBadge = getPriorityBadge(currentTask.priority);

  // Prerequisites / Dependencies details
  const prerequisiteTasks = tasks.filter((t) => currentTask.dependencies?.includes(t.id));

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteTask(currentTask.id);
    onClose();
  };

  // Helper to format text with clickable links
  const renderFormattedDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5 break-all font-mono text-xs"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('taskDetailsModalTitle')}
      maxWidth="lg"
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {/* 1. Header Badges & Title */}
        <div className="space-y-2">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Category */}
            <span
              style={categoryStyle.style}
              className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg border shadow-xs ${categoryStyle.className}`}
            >
              {currentTask.category}
            </span>

            {/* Status */}
            <span
              className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg border flex items-center gap-1.5 ${statusBadge.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </span>

            {/* Priority */}
            <span
              className={`px-2.5 py-0.5 text-[11px] font-mono rounded-lg border ${priorityBadge.className}`}
            >
              {priorityBadge.label}
            </span>

            {/* Duration Tag */}
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/20 text-slate-600 dark:text-cyan-300 ml-auto">
              {duration} {language === 'th' ? 'วัน' : 'days'}
            </span>
          </div>

          {/* Full Task Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug break-words">
            {currentTask.title}
          </h3>
        </div>

        {/* 2. Description Box */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-500/20 space-y-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-cyan-400/70 block">
            {t('taskDescLabel')}
          </span>
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {currentTask.description?.trim() ? (
              renderFormattedDescription(currentTask.description)
            ) : (
              <span className="italic text-slate-400 dark:text-slate-500">
                {t('noDescription')}
              </span>
            )}
          </div>
        </div>

        {/* 3. Schedule, Dates & Times Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Start Date & Time */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-500/20 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-cyan-400/80 block">
                {t('startDateLabel')}
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {formatDateLocale(currentTask.startDate || currentTask.dueDate, language)}
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {currentTask.startTime ? `${currentTask.startTime} น.` : t('allDayTask')}
              </p>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-cyan-500/20 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-cyan-400/80 block">
                {t('dueDateLabel')}
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {formatDateLocale(currentTask.dueDate, language)}
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {currentTask.dueTime ? `${currentTask.dueTime} น.` : t('allDayTask')}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Subtasks Checklist (Interactive) */}
        {totalSubtasks > 0 && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400/80 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t('subtasksLabel')} ({completedSubtasks}/{totalSubtasks})</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-300">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist Items */}
            <div className="space-y-1 pt-1 max-h-44 overflow-y-auto">
              {currentTask.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(currentTask.id, st.id)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-cyan-500/10 flex items-center gap-2 hover:bg-cyan-500/5 cursor-pointer transition-colors group"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubtask(currentTask.id, st.id);
                    }}
                    className="shrink-0 text-slate-400 hover:text-cyan-500 transition-colors"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <span
                    className={`text-xs flex-1 truncate ${
                      st.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-700 dark:text-slate-200 font-medium group-hover:text-cyan-500'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Prerequisites / Dependencies */}
        {prerequisiteTasks.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-cyan-500/20 space-y-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400/80 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t('dependenciesLabel')} ({prerequisiteTasks.length})</span>
            </span>
            <div className="space-y-1">
              {prerequisiteTasks.map((dep) => (
                <div
                  key={dep.id}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-cyan-500/10 flex items-center justify-between text-xs"
                >
                  <span className="font-medium truncate text-slate-700 dark:text-slate-200">
                    {dep.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      dep.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {dep.status === 'completed' ? t('completedCol') : t('inProgressCol')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Tags */}
        {currentTask.tags && currentTask.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-0.5" />
            {currentTask.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/20 text-slate-600 dark:text-cyan-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 7. Bottom Actions Deck (Close, Delete, & Edit) */}
        <div className="pt-3 border-t border-slate-200 dark:border-cyan-500/20 flex items-center justify-between gap-2">
          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors shrink-0"
            title={language === 'th' ? 'ลบงานนี้' : 'Delete task'}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'th' ? 'ลบงาน' : 'Delete'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-cyan-500/20 rounded-xl transition-colors"
            >
              {t('closeBtn')}
            </button>

            {/* Edit Task Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(currentTask);
              }}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-cyan-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95 transition-all shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('editTaskBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>

    {/* Custom Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={isConfirmDeleteOpen}
      onClose={() => setIsConfirmDeleteOpen(false)}
      onConfirm={handleConfirmDelete}
      title={language === 'th' ? 'ยืนยันการลบงาน' : 'Confirm Delete Task'}
      message={
        language === 'th'
          ? `คุณต้องการลบงาน "${currentTask.title}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`
          : `Are you sure you want to delete "${currentTask.title}"? This action cannot be undone.`
      }
      confirmText={language === 'th' ? 'ลบงานนี้' : 'Delete Task'}
      cancelText={t('cancelBtn')}
      variant="danger"
    />
    </>
  );
};
