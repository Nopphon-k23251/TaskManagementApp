import React, { useState } from 'react';
import { 
  Plus, 
  Circle, 
  Clock, 
  Eye, 
  CheckCircle2, 
  Filter, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Columns3,
  LayoutGrid
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import { TaskCard } from './TaskCard';
import { EisenhowerMatrixView } from '../matrix/EisenhowerMatrixView';
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
  const [viewMode, setViewMode] = useState<'kanban' | 'matrix'>('kanban');
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [mobileSelectedColumn, setMobileSelectedColumn] = useState<TaskStatus | 'all'>('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const columns = [
    {
      id: 'todo' as TaskStatus,
      title: t('toDoCol'),
      icon: Circle,
      iconColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-[#ded5c2] dark:border-cyan-500/20',
      glowColor: 'shadow-xs dark:shadow-[0_0_15px_rgba(148,163,184,0.15)]',
      bgColor: 'bg-[#f7f4ea]/90 dark:bg-[#090e1e]/80',
    },
    {
      id: 'in_progress' as TaskStatus,
      title: t('inProgressCol'),
      icon: Clock,
      iconColor: 'text-cyan-700 dark:text-cyan-400',
      borderColor: 'border-cyan-300/80 dark:border-cyan-500/40',
      glowColor: 'shadow-xs dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      bgColor: 'bg-cyan-50/50 dark:bg-cyan-950/30',
    },
    {
      id: 'review' as TaskStatus,
      title: t('reviewCol'),
      icon: Eye,
      iconColor: 'text-indigo-700 dark:text-indigo-400',
      borderColor: 'border-indigo-300/80 dark:border-indigo-500/40',
      glowColor: 'shadow-xs dark:shadow-[0_0_15px_rgba(99,102,241,0.15)]',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/30',
    },
    {
      id: 'completed' as TaskStatus,
      title: t('completedCol'),
      icon: CheckCircle2,
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-300/80 dark:border-emerald-500/40',
      glowColor: 'shadow-xs dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/30',
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0 font-sans">
      {/* View Switcher: Kanban (4 Columns) vs Eisenhower Matrix (4 Quadrants) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center bg-[#ede7d8]/60 dark:bg-slate-950 p-1 rounded-2xl border border-[#ded5c2] dark:border-cyan-500/30 text-xs font-mono font-bold">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              viewMode === 'kanban'
                ? 'bg-gradient-to-r from-cyan-500 to-brand-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400'
            }`}
          >
            <Columns3 className="w-4 h-4" />
            <span>{t('viewKanban')}</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              viewMode === 'matrix'
                ? 'bg-gradient-to-r from-cyan-500 to-brand-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('viewMatrix')}</span>
          </button>
        </div>

        <button
          onClick={() => onOpenCreateModal('todo')}
          className="px-4 py-2 text-xs font-bold font-mono text-white bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 rounded-xl shadow-xs transition-all flex items-center gap-1.5 ml-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('createTaskBtn')}</span>
        </button>
      </div>

      {viewMode === 'matrix' ? (
        <EisenhowerMatrixView
          onOpenCreateModal={onOpenCreateModal}
          onEditTask={onEditTask}
        />
      ) : (
        <>
          {/* Top Sci-Fi Filter Console with Mobile Toggle */}
          <div className="bg-[#fdfcf9] dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl border border-[#e8e2d4] dark:border-cyan-500/20 shadow-xs dark:shadow-[0_0_20px_rgba(6,182,212,0.06)] p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-cyan-300">
            <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="font-mono uppercase tracking-wider">{t('taskFilters')}</span>
            {isFilterActive && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f5ff] animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-[#ded5c2] dark:border-cyan-500/30 bg-[#ede7d8]/70 dark:bg-slate-950 text-slate-700 dark:text-cyan-300 flex items-center gap-1.5"
            >
              <span>[FILTERS]</span>
              {showFiltersMobile ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isFilterActive && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:bg-rose-950/40 rounded-lg border border-rose-300 dark:border-rose-500/30 transition-colors"
                title={t('resetFilters')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetFilters')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls (Collapsible on mobile) */}
        <div className={`mt-3 pt-3 border-t border-[#ded5c2] dark:border-cyan-500/15 ${showFiltersMobile ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
            {/* Priority Filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/80 mb-1">
                {t('priorityLabel')}
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-1.5 text-xs bg-[#f7f4ea] dark:bg-slate-950 border border-[#ded5c2] dark:border-cyan-500/30 rounded-xl focus:border-cyan-500 outline-none text-slate-900 dark:text-slate-200"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/80 mb-1">
                {t('categoryLabel')}
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-[#f7f4ea] dark:bg-slate-950 border border-[#ded5c2] dark:border-cyan-500/30 rounded-xl focus:border-cyan-500 outline-none text-slate-900 dark:text-slate-200"
              >
                <option value="all">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Range */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-cyan-400/80 mb-1">
                {t('dueDateLabel')}
              </label>
              <select
                value={filters.dueDateRange || 'all'}
                onChange={(e) => setFilters((prev) => ({ ...prev, dueDateRange: e.target.value as any }))}
                className="w-full px-3 py-1.5 text-xs bg-[#f7f4ea] dark:bg-slate-950 border border-[#ded5c2] dark:border-cyan-500/30 rounded-xl focus:border-cyan-500 outline-none text-slate-900 dark:text-slate-200"
              >
                <option value="all">{t('allDates')}</option>
                <option value="today">{t('dueToday')}</option>
                <option value="this_week">{t('dueThisWeek')}</option>
                <option value="overdue">{t('overdueTasks')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Column View Switcher */}
      <div className="flex md:hidden overflow-x-auto gap-1.5 pb-1 no-scrollbar">
        <button
          onClick={() => setMobileSelectedColumn('all')}
          className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl whitespace-nowrap border transition-all ${
            mobileSelectedColumn === 'all'
              ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-[#fdfcf9] dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-[#ded5c2] dark:border-cyan-500/20'
          }`}
        >
          {t('allColumns')} ({filteredTasks.length})
        </button>
        {columns.map((col) => {
          const count = filteredTasks.filter((t) => t.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setMobileSelectedColumn(col.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl whitespace-nowrap border transition-all ${
                mobileSelectedColumn === col.id
                  ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#fdfcf9] dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-[#ded5c2] dark:border-cyan-500/20'
              }`}
            >
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-start">
        {columns
          .filter((col) => mobileSelectedColumn === 'all' || mobileSelectedColumn === col.id)
          .map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            const isDragOver = dragOverColumn === col.id;
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl border transition-all duration-200 backdrop-blur-xl ${
                  col.borderColor
                } ${col.bgColor} ${
                  isDragOver
                    ? 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(0,245,255,0.4)] scale-[1.01] bg-cyan-950/40'
                    : col.glowColor
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-[#ded5c2] dark:border-cyan-500/15">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${col.iconColor} drop-shadow-[0_0_6px_currentColor]`} />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {col.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-[#ede7d8] dark:bg-slate-950 text-slate-800 dark:text-cyan-400 border border-[#ded5c2] dark:border-cyan-500/30">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenCreateModal(col.id)}
                    className="p-1 rounded-lg text-slate-600 hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-[#ede7d8] dark:hover:bg-cyan-500/10 transition-colors"
                    title={`+ Add task to ${col.title}`}
                    aria-label={`Add task to ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Tasks Container */}
                <div className="p-2 sm:p-3 space-y-3 min-h-[150px] max-h-[calc(100vh-280px)] overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-cyan-500/20 rounded-xl bg-white/40 dark:bg-slate-950/40">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-500 mb-2">
                        {t('noTasksInCol')}
                      </p>
                      <button
                        onClick={() => onOpenCreateModal(col.id)}
                        className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('addFirstTask')}</span>
                      </button>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
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
      </>
    )}
  </div>
);
};
