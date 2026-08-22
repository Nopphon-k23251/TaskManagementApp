import React, { useState } from 'react';
import { 
  Plus, 
  Circle, 
  Clock, 
  Eye, 
  CheckCircle2, 
  Filter, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { TaskCard } from './TaskCard';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface KanbanBoardProps {
  onOpenCreateModal: (defaultStatus?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onOpenCreateModal,
  onEditTask,
}) => {
  const { filteredTasks, updateTaskStatus, filters, setFilters, resetFilters, categories } = useTasks();
  const { t } = useLanguage();
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState<TaskStatus | 'all'>('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const columns = [
    {
      id: 'todo' as TaskStatus,
      title: t('toDoCol'),
      icon: Circle,
      iconColor: 'text-slate-400',
      borderColor: 'border-slate-300 dark:border-slate-700',
      bgColor: 'bg-slate-50/70 dark:bg-slate-900/40',
    },
    {
      id: 'in_progress' as TaskStatus,
      title: t('inProgressCol'),
      icon: Clock,
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-300 dark:border-amber-700',
      bgColor: 'bg-amber-50/30 dark:bg-amber-950/20',
    },
    {
      id: 'review' as TaskStatus,
      title: t('reviewCol'),
      icon: Eye,
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-300 dark:border-blue-700',
      bgColor: 'bg-blue-50/30 dark:bg-blue-950/20',
    },
    {
      id: 'completed' as TaskStatus,
      title: t('completedCol'),
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-300 dark:border-emerald-700',
      bgColor: 'bg-emerald-50/30 dark:bg-emerald-950/20',
    },
  ];

  const priorities: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: t('allPriorities') },
    { value: 'urgent', label: t('urgent') },
    { value: 'high', label: t('high') },
    { value: 'medium', label: t('medium') },
    { value: 'low', label: t('low') },
  ];

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      await updateTaskStatus(taskId, columnId);
    }
  };

  const isFilterActive =
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.dueDateRange !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0">
      {/* Top Filter Bar with Mobile Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-brand-500" />
            <span>{t('taskFilters')}</span>
            {isFilterActive && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFiltersMobile ? 'Hide' : 'Options'}</span>
              {showFiltersMobile ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('tasksCount', { count: filteredTasks.length })}
            </span>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className={`mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5 ${showFiltersMobile ? 'block' : 'hidden sm:flex'}`}>
          {/* Priority filter */}
          <select
            value={filters.priority || 'all'}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, priority: e.target.value as TaskPriority | 'all' }))
            }
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Dynamic Categories filter */}
          <select
            value={filters.category || 'all'}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date range filter */}
          <select
            value={filters.dueDateRange || 'all'}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dueDateRange: e.target.value as any }))
            }
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">{t('allDates')}</option>
            <option value="today">{t('dueToday')}</option>
            <option value="this_week">{t('dueThisWeek')}</option>
            <option value="overdue">{t('overdueTasks')}</option>
          </select>

          {/* Reset filter button */}
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 sm:py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('resetFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Column Switcher Pills */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setMobileSelectedColumn('all')}
          className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            mobileSelectedColumn === 'all'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('allColumns')} ({filteredTasks.length})
        </button>

        {columns.map((col) => {
          const count = filteredTasks.filter((t) => t.status === col.id).length;
          const isActive = mobileSelectedColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileSelectedColumn(col.id)}
              className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{col.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-start">
        {columns.filter(
          (col) => mobileSelectedColumn === 'all' || mobileSelectedColumn === col.id
        ).map((col) => {
          const Icon = col.icon;
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 p-3.5 sm:p-4 min-h-[300px] md:min-h-[500px] ${
                col.bgColor
              } ${
                isOver
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.iconColor}`} />
                  <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {col.title}
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs border border-slate-200/80 dark:border-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenCreateModal(col.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label={`Add task to ${col.title}`}
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                      {t('noTasksInCol')}
                    </p>
                    <button
                      onClick={() => onOpenCreateModal(col.id)}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('addFirstTask')}
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
