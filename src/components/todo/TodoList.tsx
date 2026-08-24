import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Terminal
} from 'lucide-react';
import { Task, TaskPriority } from '../../types/task';
import { formatDate, getTodayString, isOverdue } from '../../utils/date';
import { getCategoryBadgeStyle } from '../../utils/category';
import { useTasks } from '../../context/TaskContext';
import { useLanguage } from '../../context/LanguageContext';

interface TodoListProps {
  onEditTask: (task: Task) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ onEditTask }) => {
  const { 
    filteredTasks, 
    addTask, 
    updateTaskStatus, 
    toggleSubtask, 
    deleteTask,
    categories 
  } = useTasks();
  const { t } = useLanguage();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [quickCategory, setQuickCategory] = useState<string>(categories[0]?.name || 'General');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [todoTab, setTodoTab] = useState<'all' | 'active' | 'completed' | 'today'>('all');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await addTask({
      title: quickTitle.trim(),
      description: '',
      status: 'todo',
      priority: quickPriority,
      category: quickCategory,
      dueDate: getTodayString(),
      subtasks: [],
      tags: ['QuickTodo'],
    });

    setQuickTitle('');
  };

  const displayedTasks = filteredTasks.filter((task) => {
    if (todoTab === 'active') return task.status !== 'completed';
    if (todoTab === 'completed') return task.status === 'completed';
    if (todoTab === 'today') return task.dueDate === getTodayString();
    return true;
  });

  const activeCount = filteredTasks.filter((t) => t.status !== 'completed').length;
  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0 font-sans">
      {/* Sci-Fi Quick Add Terminal Console */}
      <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-cyan-500/20 shadow-lg dark:shadow-[0_0_25px_rgba(6,182,212,0.06)]">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">
            {t('addTodoBtn')}
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder={t('quickTodoPlaceholder')}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 focus:border-cyan-400 dark:focus:border-cyan-400 text-slate-800 dark:text-cyan-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 disabled:opacity-40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('addTodoBtn')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <span className="font-mono text-[10px] text-cyan-400/80 uppercase font-bold">{t('priorityLabel')}</span>
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
                className="w-full sm:w-auto px-2.5 py-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-cyan-500/30 text-slate-700 dark:text-slate-300 font-mono text-xs focus:outline-none"
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <span className="font-mono text-[10px] text-cyan-400/80 uppercase font-bold">{t('categoryLabel')}</span>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="w-full sm:w-auto px-2.5 py-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-cyan-500/30 text-slate-700 dark:text-slate-300 font-mono text-xs focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Sci-Fi Filter Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-cyan-500/30 shrink-0">
          <button
            onClick={() => setTodoTab('all')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
              todoTab === 'all'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
            }`}
          >
            {t('allTab')} ({filteredTasks.length})
          </button>
          <button
            onClick={() => setTodoTab('active')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
              todoTab === 'active'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
            }`}
          >
            {t('activeTab')} ({activeCount})
          </button>
          <button
            onClick={() => setTodoTab('today')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
              todoTab === 'today'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
            }`}
          >
            {t('todayTab')}
          </button>
          <button
            onClick={() => setTodoTab('completed')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
              todoTab === 'completed'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-400'
            }`}
          >
            {t('completedTab')} ({completedCount})
          </button>
        </div>
      </div>

      {/* Task Checklist Items Stack */}
      <div className="space-y-2.5">
        {displayedTasks.length === 0 ? (
          <div className="bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl p-10 text-center border border-slate-200 dark:border-cyan-500/20 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {t('allCaughtUp')}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              {t('noTasksInTab')}
            </p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isExpanded = expandedTaskId === task.id;
            const overdue = isOverdue(task.dueDate) && !isCompleted;

            return (
              <div
                key={task.id}
                className={`bg-white/90 dark:bg-[#090e1e]/90 backdrop-blur-xl rounded-2xl border transition-all duration-200 p-3.5 sm:p-4 shadow-sm hover:border-cyan-400/40 ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800 opacity-70'
                    : overdue
                    ? 'border-rose-300 dark:border-rose-800/80 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                    : 'border-slate-200 dark:border-cyan-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Toggle Check Trigger */}
                    <button
                      onClick={() => updateTaskStatus(task.id, isCompleted ? 'todo' : 'completed')}
                      className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0 focus:outline-none"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_#10b981]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-cyan-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {(() => {
                          const badgeStyle = getCategoryBadgeStyle(task.category, categories);
                          return (
                            <span
                              style={badgeStyle.style}
                              className={`text-[9px] px-2 py-0.5 rounded ${badgeStyle.className}`}
                            >
                              {task.category}
                            </span>
                          );
                        })()}
                        <span
                          className={`font-mono text-[9px] font-bold px-2 py-0.2 rounded ${
                            task.priority === 'urgent'
                              ? 'bg-rose-950 text-rose-300'
                              : task.priority === 'high'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-cyan-950 text-cyan-300'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-semibold flex items-center gap-1 ${
                            overdue ? 'text-rose-500 font-bold' : 'text-slate-400 dark:text-cyan-400/70'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <h4
                        onClick={() => onEditTask(task)}
                        className={`font-bold text-sm text-slate-900 dark:text-slate-100 cursor-pointer hover:text-cyan-400 transition-colors ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-cyan-500/10 transition-colors"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {task.subtasks.length > 0 && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Subtasks Checklist */}
                {isExpanded && task.subtasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-cyan-500/15 space-y-2 pl-8">
                    {task.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtask(task.id, st.id)}
                        className="flex items-center gap-2 text-xs cursor-pointer group"
                      >
                        {st.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                        )}
                        <span
                          className={`font-mono text-xs ${
                            st.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
